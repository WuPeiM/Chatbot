<template>
    <div class="ace-editor">
        <AceEditor
            ref="aceEditor"
            class="editor-input"
            theme="ace-queryinput"
            height="32"
            width="100%"
            :options="options"
            lang="lucene"
            v-bind="$attrs"
            @init="editorInit"
            @keydown.enter.native="onEnter"
            @input="handleInput"
        />
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
    import AceEditor from './ace.ts'
    import ace from 'ace-builds/src-noconflict/ace.js'

    @Component({
        name: 'AceEidtor',
        components: {
            AceEditor
        }
    })

    export default class AceEidtor extends Vue {
        @Prop({
            type: Array,
            default: () => []
        })
        fields: Array<any>
        @Prop({
            type: String,
            default: () => ''
        })
        placeholder: string

        options: any = {
            enableBasicAutocompletion: true, // 启用基本自动完成
            enableSnippets: false, // 启用代码段
            enableLiveAutocompletion: true, // 启用实时自动完成
            printMarginColumn: 30, // 指定打印边距的列号
            displayIndentGuides: false, // 显示参考线
            enableEmmet: false, // 启用Emmet
            tabSize: 0, // 指定编辑器中一个制表符所占的空格数
            fontSize: 14, // 设置字号
            useWorker: false, // 使用辅助对象
            showPrintMargin: false, // 去除编辑器里的竖线
            enableMultiselect: true, // 选中多处
            readOnly: false, // 是否只读
            showFoldWidgets: false, // 显示折叠部件
            fadeFoldWidgets: false, // 淡入折叠部件
            wrap: false, // 换行
            showGutter: false, // 不显示左侧栏条数
            highlightActiveLine: false, // 选中row高亮
            // minLines: 2, // 指定编辑器的最小行数
            // maxLines: 3, // 指定编辑器的最大行数
            autoScrollEditorIntoView: true // 控制编辑器是否自动滚动到光标所在行的可视区域内
        }

        fieldData: Array<any> = []
        lnTools: any = ace.acequire('ace/ext/language_tools')
        content: string = ''
        showPlaceHolder: boolean = true
        valueMaps: any = {}

        @Watch('fields', {
            immediate: true,
            deep: true
        })
        onFieldsDataChange(data) {
            if (data?.length) {
                this.fieldData = data.map(item => {
                    return {
                        caption: item.value,
                        value: item.value,
                        score: 9,
                        meta: item.type
                    }
                })
            }
        }

        // input事件（处理palceholder的显示隐藏）
        handleInput(val) {
            this.content = val
            if (this.content && this.showPlaceHolder) {
                this.showPlaceHolder = false
                this.$nextTick(() => {
                    const aceDom = this.$refs.aceEditor?.$el
                    aceDom.querySelector('.ace-placeholder').style.display = 'none'
                })
            }
            if (!this.content) this.showPlaceHolder = true
        }
        // enter回车事件
        onEnter(event) {
            if (event.keyCode === 13) {
                event.preventDefault()
                this.$emit('enter')
            }
        }
        // 设置默认值
        setDefaultVal(val) {
            this.$refs.aceEditor.editor.setValue(val)
        }
        // 编辑器初始化
        editorInit(editor) {
            // 绑定change事件
            editor.getSession().on('change', val => {
                this.$emit('change', editor.getValue())
                // 当输入字段时，触发自动提示
                const doc = editor.getSession().getDocument()
                const lastToken = editor.session.getTokenAt(doc.getLength() - 1)
                if (lastToken?.type === 'keyword' && lastToken?.value.endsWith(':') && lastToken?.value !== '_exists_:') {
                    const key = lastToken.value.slice(0, -1)
                    if (!this.valueMaps[key]) {
                        // 获取建议列表
                        const params = {
                            field: key,
                            size: 50,
                            input: '',
                            streams: [],
                            timerange: {
                                from: 900,
                                type: 'relative'
                            }
                        }
                        this.$api.log.getSearchSuggestion(params).then(res => {
                            if (res.result) {
                                this.valueMaps[key] = (res.data.suggestions || []).map(item => {
                                    return {
                                        caption: item.value,
                                        value: this.dealFieldValue(item.value),
                                        score: 10,
                                        meta: item.occurrence + ' hits'
                                    }
                                })
                                editor.execCommand('startAutocomplete')
                            }
                        })
                        return
                    }
                    this.$nextTick(() => {
                        editor.execCommand('startAutocomplete')
                    })
                }
            })
            // 给组件添加placeholder
            const placeholder = document.createElement('span')
            placeholder.className = 'ace-placeholder'
            placeholder.textContent = this.placeholder || '请输入'
            this.$refs.aceEditor?.$el.appendChild(placeholder)
            placeholder.onclick = () => {
                editor.focus()
            }
            editor.on('focus', () => {
                placeholder.style.display = 'none'
            })
            editor.on('blur', () => {
                if (!this.content) {
                    placeholder.style.display = 'block'
                }
            })
            // 自定义语法提示
            const that = this
            const completer = {
                getCompletions: (editors, session, pos, prefix, callback) => {
                    const tokens = session.getTokens(pos.row)
                    const currentToken = session.getTokenAt(pos.row, pos.column)
                    const currentTokenIdx = tokens.findIndex((t) => (t === currentToken))
                    const lastToken = currentTokenIdx > 0 ? tokens[currentTokenIdx - 1] : null
                    const uniqResults = that.setCompleteData(tokens, currentToken, currentTokenIdx, prefix, lastToken)
                    callback(null, uniqResults)
                }
            }
            // 自定义提示语法先清空本地缓存
            this.lnTools.setCompleters([])
            // 添加自定义语法提示
            this.lnTools.addCompleter(completer)
        }
        setCompleteData(tokens, currentToken, currentTokenIdx, prefix, lastToken) {
            const combiningOperators: Array<any> = [
                {
                    caption: 'AND',
                    value: 'AND ',
                    score: 10,
                    meta: 'operator'
                },
                {
                    caption: 'OR',
                    value: 'OR ',
                    score: 10,
                    meta: 'operator'
                }
            ]
            const operators: Array<any> = [
                {
                    caption: 'NOT',
                    value: 'NOT ',
                    score: 10,
                    meta: 'operator'
                }
            ]
            const existsOperator: Array<any> = [
                {
                    caption: '_exists_:',
                    value: '_exists_:',
                    score: 10,
                    meta: 'operator'
                }
            ]
            const fieldData = this.fieldData.map(item => {
                const { caption, value, ...remain } = item
                return {
                    caption: caption + ':',
                    value: value + ':',
                    ...remain
                }
            })
            const _matchesFieldName = (prefix) => {
                return field => field.caption.indexOf(prefix) >= 0
            }
            const matchesFieldName = _matchesFieldName(prefix)
            const _lastNonEmptyToken = (tokens: Array<any>, currentTokenIdx: number) => {
                return tokens.slice(0, currentTokenIdx).reverse().find((token) => (token.type !== 'text' || token.value.trim() !== ''))
            }
            const lastNonEmptyToken = _lastNonEmptyToken(tokens, currentTokenIdx)
            const isFollowingExistsOperator = lastToken => (lastToken?.value === `${existsOperator[0].caption}`)
            const isFollowingFieldName = lastToken => (lastToken?.type === 'keyword' && lastToken.value.endsWith(':'))
            const getValueList = target => {
                const key = (target?.value || '').slice(0, -1)
                return this.valueMaps[key] || []
            }
            if (isFollowingFieldName(currentToken) && !isFollowingExistsOperator(currentToken)) {
                return getValueList(currentToken).filter(matchesFieldName)
            }
            if (isFollowingFieldName(lastToken) && !isFollowingExistsOperator(lastToken)) {
                return getValueList(lastToken).filter(matchesFieldName)
            }
            if (isFollowingExistsOperator(lastToken)) {
                return this.fieldData.filter(matchesFieldName)
            }
            if (currentToken?.type === 'string' || (currentToken?.type === 'keyword' && !prefix)) {
                return []
            }
            if (!lastNonEmptyToken || lastNonEmptyToken?.type === 'keyword.operator') {
                return [...existsOperator, ...fieldData, ...operators].filter(matchesFieldName)
            }
            if (['string', 'text'].includes(lastToken?.type)) {
                return [...combiningOperators, ...operators, ...existsOperator, ...fieldData].filter(matchesFieldName)
            }
            return []
        }
        dealFieldValue(val) {
            return val.replace(/(\/)/g, '\\$1')
        }
    }
</script>
<style lang="scss" scoped>
.ace-editor {
    width: 100%;
}
/* stylelint-disable */
.ace-queryinput {
    border: 1px solid #a6a6a6;
    border-radius: 2px;
    background: #fff;
    min-height: 32px;
}
</style>
<style>
.ace_editor.ace_autocomplete {
    width: 600px !important;
    margin-top: 8px;
}

.ace_multiselect .ace_selection.ace_start {
    box-shadow: 0 0 3px 0 #ffffff;
}

.ace_gutter {
    background: #ffffff;
    color: #515151;
}

.ace_print-margin {
    width: 1px;
    background: #ffffff;
}

.ace_cursor {
    color: #515151;
    display: block;
}

.ace_hidden-cursors {
    display: none;
}

.ace_marker-layer .ace_selection {
    background: #f3f3f3;
}

.ace_marker-layer .ace_step {
    background: #e1b900;
}

.ace_marker-layer .ace_bracket {
    margin: -1px 0 0 -1px;
    border: none;
}

.ace_marker-layer .ace_active-line {
    background: #ffffff;
}

.ace_gutter-active-line {
    background: #ffffff;
}

.ace_marker-layer .ace_selected-word {
    border: 1px solid #cdcdcd;
}

.ace_invisible {
    color: #ffffff;
}

.ace_keyword,
.ace_meta,
.ace_storage,
.ace_storage.ace_type,
.ace_support.ace_type {
    color: #702785;
}

.ace_keyword.ace_operator {
    color: #00427f;
}

.ace_constant.ace_character,
.ace_constant.ace_language,
.ace_constant.ace_numeric,
.ace_keyword.ace_other.ace_unit,
.ace_support.ace_constant,
.ace_variable.ace_parameter {
    color: #990606;
}

.ace_constant.ace_other {
    color: #000;
}

.ace_invalid {
    color: #000;
    background-color: #ffffff;
}

.ace_invalid.ace_deprecated {
    color: #702785;
    background-color: #9b9b9b;
}

.ace_fold {
    background-color: #702785;
    border-color: #9b9b9b;
}

.ace_entity.ace_name.ace_function,
.ace_support.ace_function,
.ace_variable,
.ace_term {
    color: #0063be;
}

.ace_completion-highlight {
    color: #0063be !important;
}

.ace_support.ace_class,
.ace_support.ace_type {
    color: #e1b900;
}

.ace_heading,
.ace_markup.ace_heading,
.ace_string {
    color: #009a3a;
}

.ace_entity.ace_name.ace_tag,
.ace_entity.ace_other.ace_attribute-name,
.ace_meta.ace_tag,
.ace_string.ace_regexp,
.ace_variable {
    color: #702785;
}

.ace_comment {
    color: #9b9b9b;
}

.ace_indent-guide {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bdu3f/BwAlfgctduB85QAAAABJRU5ErkJggg==) right repeat-y;
}

.ace-placeholder {
    position: absolute;
    left: 6px;
    top: 8px;
    font-size: 12px;
    color: #9b9b9b;
    cursor: text;
}

.ace_marker {
    border-bottom: 2px dashed;
    position: absolute;
    border-radius: 0;
    margin-top: 1px;
}

.ace_marker.ace_validation_error {
    border-color: #ad0707;
}

.ace_marker.ace_validation_warning {
    border-color: #e1b900;
}
.ace_content {
    top: 8px;
}
.ace_autocomplete > .ace_scroller > .ace_content {
    top: 0 !important;
}
.ace_scrollbar-h {
    display: none;
}
.ace_scroller.ace_scroll-left {
    box-shadow: none !important;
}
</style>
