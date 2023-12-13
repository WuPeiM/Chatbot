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
        <bk-form-item
            label="类型"
            required>
            <bk-radio-group v-model="paramsFormData.type" @change="paramsFormData.localeField = ''">
                <bk-radio value="china" class="mr20">中国地图</bk-radio>
                <bk-radio value="world">世界地图</bk-radio>
            </bk-radio-group>
        </bk-form-item>
        <bk-form-item label="地域字段" required property="localeField" :error-display-type="'normal'">
            <bk-select
                :loading="fieldLoading"
                v-model="paramsFormData.localeField"
                searchable>
                <bk-option
                    v-for="option in localeFieldList.filter(item => paramsFormData.type === 'china' ? item.value.endsWith('_region') : item.value.endsWith('_country'))"
                    :key="option.id"
                    :id="option.id"
                    :name="option.value">
                </bk-option>
            </bk-select>
        </bk-form-item>
        <bk-form-item
            required
            :label="index ? '' : '阈值配色'"
            v-for="(item, index) in (paramsFormData.matchColor || [])"
            :key="index"
            :property="'matchColor.' + index"
            :error-display-type="'normal'">
            <div class="form-color-item">
                <bk-input
                    :min="0"
                    type="number"
                    :clearable="true"
                    :disabled="index === (paramsFormData.matchColor.length - 1)"
                    v-model="item.value"
                    :class="{ 'input-error': !validateMap[index] }"
                    @blur="handleChangeMatchValue">
                </bk-input>
                <bk-color-picker
                    v-model="item.color"
                    :show-value="false">
                </bk-color-picker>
                <span class="unit-span">{{ unit }}</span>
                <div class="operation-container">
                    <bk-icon
                        type="plus-circle"
                        @click="handleAddMatchColor(index)" />
                    <bk-icon
                        v-if="!item.disabled"
                        type="minus-circle"
                        @click="handleRemoveMatchColor(index)" />
                </div>
            </div>
            <p class="margin-0" style="color: #ea3636;" v-if="isConfirm && !validateMap[index]">
                {{ validateMatchTip(item) }}
            </p>
        </bk-form-item>
        <p class="result-tip-text" v-if="isConfirm && compareMatchValue.error">
            {{ compareMatchValue.tip }}
        </p>
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
        type: 'china', // 地图类型
        localeField: '', // 地域字段
        matchColor: [
            { color: '#fd666d', value: '70' },
            { color: '#37a2da', value: '30' },
            { color: '#A5C2F3', value: '0', disabled: true }
        ] // 阈值配色
    }

    @Component({
        components: {
            AceEditor
        }
    })
    export default class MessageOption extends Vue {
        @Prop({ type: Object }) formData: ViewForm
        @Prop({ type: Object }) rules: any
        @Prop({ type: Boolean }) isConfirm: boolean
        @Prop({ type: String }) unit: string
        fieldLoading: boolean = false
        groupLoading: boolean = false
        allFields: Array<any> = []
        groupList: Array<any> = []
        localeFieldList: Array<any> = []
        paramsFormData = this.$Copy(INIT_FORM)
        get validateMap() {
            const validate = {}
            const color = this.paramsFormData.matchColor || []
            color.forEach((item: { color: any; value: number }, index: string | number) => {
                validate[index] = !!(item.color && (item.value || item.value === 0))
            })
            return validate
        }
        get compareMatchValue(): any {
            // 校验
            const matchColor = this.paramsFormData.matchColor.map((r: { value: any }) => r.value)
            const matchColorSet = Array.from(new Set(matchColor))
            if (matchColorSet.length !== matchColor.length) {
                return {
                    error: true,
                    tip: '阈值数组中存在相同的值, 请重新填写'
                }
            }
            return { error: false }
        }
        created() {
            this.initParamRules()
            const logParams = this.formData.logParams || {}
            for (const key in this.paramsFormData) {
                if (logParams.hasOwnProperty(key) && !['logGroup', 'localeField'].includes(key)) {
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
        validateMatchTip(val: { color: any }) {
            return val.color ? '请输入阈值的值' : '请选择阈值的颜色'
        }
        handleChangeMatchValue(value: string) {
            if (!value) {
                return false
            }
            this.paramsFormData.matchColor.sort((a: { value: any }, b: { value: any }) => Number(b.value) - Number(a.value))
        }
        handleAddMatchColor(index: number) {
            this.paramsFormData.matchColor.splice(index, 0, {
                color: '',
                value: ''
            })
        }

        handleRemoveMatchColor(index: number) {
            this.paramsFormData.matchColor.splice(index, 1)
        }

        // 父组件编辑提交前校验
        validSubmit() {
            if (Object.values(this.validateMap).includes(false) || this.compareMatchValue?.error) {
                return false
            }
            this.formData.logParams = this.paramsFormData
            return true
        }

        async getLogFields() {
            this.fieldLoading = true
            try {
                const params = {
                    timerange: {
                        range: 0,
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
                this.localeFieldList = this.allFields.filter(item => item.value.endsWith('_region') || item.value.endsWith('_country'))
                this.paramsFormData.localeField = this.formData.logParams?.localeField || INIT_FORM.localeField
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
        handleChangeField(val: any) {
            this.paramsFormData.aceEditorVal = val
            const formRef: any = this.$parent
            formRef.validateField('aceEditorVal')
        }
        initParamRules() {
            const requireList = ['aceEditorVal', 'logGroup', 'localeField']
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
            this.rules.name = [
                {
                    required: true,
                    message: '请输入视图名称',
                    trigger: 'blur'
                }
            ]
        }
    }
</script>

<style lang="scss" scoped>
.operation-container {
    width: 80px;
    text-align: right;
    i {
        font-size: 18px !important;
        &:hover {
            cursor: pointer;
            color: $cw-color-primary;
        }
    }
}
.result-tip-text {
    margin-left: 100px;
    font-size: 12px;
    color: #ea3636;
    line-height: 18px;
}
.form-color-item {
    display: flex;
    position: relative;
    margin-bottom: 10px;
    .bk-color-picker {
        position: absolute;
        left: 5px;
        border: none !important;
        /deep/.bk-color-picker-icon {
            display: none !important;
        }
        /deep/.bk-color-picker-color-square {
            width: 14px;
            height: 14px;
            border-radius: 50%;
        }
    }
    /deep/.bk-color-picker-show-dropdown {
        box-shadow: none !important;
    }
    /deep/input {
        padding-left: 36px !important;
    }
    /deep/.input-error {
        input {
            border-color: #ff5656;
            color: #ff5656;
        }
    }
}
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
