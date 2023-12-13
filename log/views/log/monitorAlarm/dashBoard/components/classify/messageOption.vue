<template>
    <div class="message-option mt20">
        <bk-form-item
            required
            label="日志分组"
            property="logGroup"
            :error-display-type="'normal'">
            <bk-select
                v-model="paramsFormData.logGroup"
                :loading="groupLoading"
                multiple
                display-tag
                searchable>
                <bk-option v-for="option in groupList"
                    :key="option.id"
                    :id="option.id"
                    :name="option.title">
                </bk-option>
            </bk-select>
        </bk-form-item>
        <bk-form-item
            label="查询语句"
            property="aceEditorVal"
            required
            :error-display-type="'normal'">
            <div :class="[!!paramsFormData.aceEditorVal && 'hide-placeholder', 'ace-editor-container']">
                <ace-editor
                    ref="aceEditor"
                    placeholder="在此处输入您的搜索查询"
                    :fields="allFields"
                    :value="paramsFormData.aceEditorVal"
                    @change="handleChangeField" />
            </div>
        </bk-form-item>
        <div class="param-wrap">
            <div class="param-title">
                <div class="title-wrap">
                    <span>展示字段</span>
                    <div class="line"></div>
                    <i class="bk-icon icon-plus" @click="handleAddField"></i>
                </div>
            </div>
            <div class="param-content">
                <div
                    class="param-item"
                    :key="index"
                    v-for="(field, index) in paramsFormData.displayFields">
                    <bk-form-item
                        label="字段"
                        required
                        :rules="rules.field(field)"
                        error-display-type="normal">
                        <bk-select
                            searchable
                            :loading="fieldLoading"
                            v-model="paramsFormData.displayFields[index]">
                            <bk-option
                                v-for="option in allFields"
                                :key="option.id"
                                :id="option.id"
                                :name="option.value">
                            </bk-option>
                        </bk-select>
                    </bk-form-item>
                    <bk-form-item label="名称">
                        <bk-input
                            placeholder="指定显示名称"
                            v-model="paramsFormData.displayNames[index]">
                        </bk-input>
                    </bk-form-item>
                    <div class="operate">
                        <i class="bk-icon icon-delete" @click="handleRemoveField(index)" />
                    </div>
                </div>
            </div>
        </div>
        <bk-form-item label="排序字段" required property="sortField" :error-display-type="'normal'">
            <bk-select
                :loading="fieldLoading"
                v-model="paramsFormData.sortField"
                searchable>
                <bk-option
                    v-for="option in allFields"
                    :key="option.id"
                    :id="option.id"
                    :name="option.value">
                </bk-option>
            </bk-select>
        </bk-form-item>
        <bk-form-item label="排序方式" required property="sortWay" :error-display-type="'normal'">
            <bk-select
                v-model="paramsFormData.sortWay">
                <bk-option
                    v-for="option in sortWayList"
                    :key="option.id"
                    :id="option.id"
                    :name="option.name">
                </bk-option>
            </bk-select>
        </bk-form-item>
        <bk-form-item label="在新行中展示信息" required property="displayMsgWay" :error-display-type="'normal'">
            <bk-select
                v-model="paramsFormData.displayMsgWay">
                <bk-option
                    v-for="option in displayMsgWayList"
                    :key="option.id"
                    :id="option.id"
                    :name="option.name">
                </bk-option>
            </bk-select>
        </bk-form-item>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator'
    // @ts-ignore
    import AceEditor from '@log/views/components/aceEditor'
    import { ViewForm } from '../../types/index'

    const INIT_FORM = {
        logGroup: [], // 日志分组
        aceEditorVal: '*', // 查询时ace组件的值
        displayFields: ['timestamp', 'source', 'message'], // 展示字段
        displayNames: ['', '', ''],
        sortField: 'timestamp', // 排序字段
        sortWay: 'DESC', // 排序方式
        displayMsgWay: 'no' // 是否在新行展示信息
    }

    @Component({
        components: {
            AceEditor
        }
    })
    export default class MessageOption extends Vue {
        @Prop({ type: Object }) formData: ViewForm
        @Prop({ type: Object }) rules: any

        fieldLoading: boolean = false
        groupLoading: boolean = false
        allFields: Array<any> = []
        groupList: Array<any> = []
        paramsFormData = this.$Copy(INIT_FORM)
        sortWayList = [
            { id: 'ASC', name: '降序' },
            { id: 'DESC', name: '升序' }
        ]
        displayMsgWayList = [
            { id: 'no', name: '否' },
            { id: 'yes', name: '是' }
        ]
        created() {
            this.initParamRules()
            const logParams = this.formData.logParams || {}
            for (const key in this.paramsFormData) {
                if (logParams.hasOwnProperty(key) && !['logGroup', 'displayFields'].includes(key)) {
                   this.paramsFormData[key] = logParams[key]
                }
            }
            this.getLogFields()
            this.getLogGroup()
        }

        mounted() {
            const aceEditor: any = this.$refs.aceEditor
            aceEditor.setDefaultVal(this.formData.logParams?.aceEditorVal || '*')
        }

        // 父组件编辑提交前校验
        validSubmit() {
            this.formData.logParams = this.paramsFormData
            return true
        }

        async getLogFields() {
            this.fieldLoading = true
            try {
                const params = {
                    timerange: {
                        from: 900,
                        type: 'relative'
                    }
                }
                const { result, message, data } = await this.$api.log.getLogFields(params)
                if (!result) return this.$error(message)
                this.allFields = data.map(item => ({
                    value: item.name,
                    id: item.name,
                    type: item.type?.type || 'string'
                }))
                this.paramsFormData.displayFields = this.formData.logParams?.displayFields || INIT_FORM.displayFields
            } finally {
                this.fieldLoading = false
            }
        }
        // 获取分组列表
        async getLogGroup() {
            this.groupLoading = true
            try {
                const res = await this.$api.logGroup.getUserStreams()
                if (!res.result) {
                    return this.$error(res.message)
                }
                this.groupList = res.data
                this.paramsFormData.logGroup = this.formData.logParams?.logGroup || this.groupList.map(item => item.id)
            } finally {
                this.groupLoading = false
            }
        }
        // 搜索框change事件
        handleChangeField(val) {
            this.paramsFormData.aceEditorVal = val
            const formRef: any = this.$parent
            formRef.validateField('aceEditorVal')
        }
        initParamRules() {
            const requireList = ['sortField', 'sortWay', 'aceEditorVal', 'displayMsgWay', 'logGroup']
            const that = this
            requireList.forEach(name => {
                this.rules[name] = [
                    {
                        message: '必填字段',
                        trigger: 'blur',
                        validator: () => {
                            return !!that.paramsFormData[name]?.length
                        }
                    }
                ]
            })
            this.rules.field = (item) => [
                {
                    message: '请选择字段',
                    trigger: 'blur',
                    validator: function() {
                        return !!item
                    }
                }
            ]
        }
        handleAddField() {
            this.paramsFormData.displayFields.push('')
            this.paramsFormData.displayNames.push('')
        }

        handleRemoveField(index) {
            this.paramsFormData.displayFields.splice(index, 1)
            this.paramsFormData.displayNames.splice(index, 1)
        }
    }
</script>

<style lang="scss" scoped>
.ace-editor-container {
    display: flex;
    .ace-editor {
        /deep/ {
            .ace-queryinput {
                border: 1px solid #c4c6cc;
                color: #63656e;

                .ace-placeholder {
                    font-family: "PingFang SC";
                    color: #c6ccd8;
                }
            }
        }
    }

    &.hide-placeholder {
        .ace-editor {
            /deep/ {
                .ace-queryinput {
                    .ace-placeholder {
                        display: none;
                    }
                }
            }
        }
    }
}

/deep/ .bk-form-item.is-error {
    .ace-queryinput {
        border-color: #ff5656;
        color: #ff5656;
    }
}
</style>
