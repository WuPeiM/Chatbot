<template>
    <div class="conditional-option mt20">
        <bk-form-item
            label="参数名称"
            required
            property="paramName"
            error-display-type="normal">
            <bk-input
                clearable
                v-model="formData.paramName"
                placeholder="请输入参数名称">
            </bk-input>
        </bk-form-item>
        <template v-if="formData.view_type === 'dropdown-list'">
            <bk-form-item
                label="类型"
                required
                property="type"
                error-display-type="normal">
                <bk-radio-group
                    v-model="formData.type"
                    @change="handleChangeType">
                    <bk-radio-button value="single">
                        单选
                    </bk-radio-button>
                    <bk-radio-button value="multiple">
                        多选
                    </bk-radio-button>
                </bk-radio-group>
            </bk-form-item>
            <bk-form-item
                label="取值配置"
                required
                property="valType"
                error-display-type="normal">
                <bk-radio-group
                    v-model="formData.valType"
                    @change="handleChangeValType">
                    <bk-radio-button value="custom">
                        自定义
                    </bk-radio-button>
                    <bk-radio-button value="trino">
                        trino
                    </bk-radio-button>
                </bk-radio-group>
                <div class="custom-config-table" v-if="formData.valType === 'custom'">
                    <table cellspacing="0" border="0">
                        <thead>
                            <tr>
                                <th style="width: 20%;">
                                    备选项值
                                </th>
                                <th style="width: 20%;">
                                    备选项名称
                                </th>
                                <th style="width: 40%;">
                                    操作
                                    <bk-icon
                                        type="plus"
                                        :class="{ 'disabled': isValidate }"
                                        @click="handleAddValue" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in formData.list" :key="index">
                                <td
                                    class="val-td"
                                    v-for="col in [0, 1]"
                                    :key="`${index}_${col}`"
                                    @click="handleValCol(index, col, true)">
                                    <span
                                        v-if="!singleConfigStatus[`${index}-${col}`]">
                                        {{ item[col ? 'label' : 'value'] }}
                                    </span>
                                    <bk-input
                                        v-else
                                        size="small"
                                        :class="{
                                            'validate-tip': isValidate && !item[col ? 'label' : 'value']
                                        }"
                                        :ref="`colInput_${index}_${col}`"
                                        v-model="item[col ? 'label' : 'value']"
                                        @enter="handleValCol(index, col, false)"
                                        @blur="handleValCol(index, col, false)">
                                    </bk-input>
                                    <span
                                        v-if="isValidate && !item[col ? 'label' : 'value']"
                                        class="validate-tip-span">
                                        选项必填项
                                    </span>
                                </td>
                                <td>
                                    <span
                                        :class="{
                                            'operate': true,
                                            'val-default': item.default,
                                            'disable-default': isValidate && (!item['label'] || !item['value'])
                                        }"
                                        @click="handleValDefault(item, index)">
                                        {{ item.default ? '取消' : '设为' }}默认值
                                    </span>
                                    <span
                                        class="operate ml5"
                                        @click="handleValDelete(index)">
                                        删除
                                    </span>
                                </td>
                            </tr>
                            <tr v-if="!formData.list.length">
                                <td colspan="3">
                                    <bk-exception
                                        class="exception-wrap-item exception-part"
                                        type="empty"
                                        scene="part"
                                        :class="{ 'exception-gray': false }">
                                    </bk-exception>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="mt20 trino-wrap" v-else>
                    <bk-input
                        v-model="formData.trinoContent"
                        placeholder="请输入trino语句"
                        type="textarea"
                        :rows="13" />
                    <div :class="['operate', !formData.trinoContent && 'disabled']">
                        <bk-spin v-show="trinoLoading" :spinning="false" size="mini" />
                        <bk-icon v-show="!trinoLoading" type="right-shape" @click="handleExecute" />
                    </div>
                </div>
            </bk-form-item>
            <template v-if="formData.valType === 'trino'">
                <bk-form-item
                    required
                    label="备选项值"
                    property="optionValue"
                    :error-display-type="'normal'">
                    <bk-select
                        searchable
                        :loading="trinoLoading"
                        v-model="formData.optionValue">
                        <bk-option
                            v-for="field in fieldOptions"
                            :key="field"
                            :id="field"
                            :name="field">
                        </bk-option>
                    </bk-select>
                </bk-form-item>
                <bk-form-item
                    required
                    label="备选项名称"
                    property="optionLabel"
                    :error-display-type="'normal'">
                    <bk-select
                        searchable
                        :loading="trinoLoading"
                        v-model="formData.optionLabel">
                        <bk-option
                            v-for="field in fieldOptions"
                            :key="field"
                            :id="field"
                            :name="field">
                        </bk-option>
                    </bk-select>
                </bk-form-item>
            </template>
        </template>
        <bk-form-item
            label="参数说明"
            error-display-type="normal">
            <bk-input
                :rows="5"
                type="textarea"
                v-model="formData.paramDesc"
                placeholder="请输入参数说明">
            </bk-input>
        </bk-form-item>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator'
    // @ts-ignore
    import { ViewForm } from '../types/index'
    import { getTrinoResult } from '../../utils'

    @Component({
        name: 'conditional-option'
    })
    export default class ConditionalOption extends Vue {
        @Prop({ type: Object }) formData: ViewForm
        @Prop({ type: Object }) rules: any
        @Prop({ type: Boolean }) isConfirm: boolean
        @Prop() rangeType: string
        @Prop({ type: String }) timeRange: string
        @Prop({ default: () => ({}) }) conditionParamsValue: any
        trinoLoading: boolean = false
        isValidate: boolean = false
        singleConfigStatus = {}
        fieldOptions: any = []
        originParamsName: string = ''

        created() {
            this.initCompFormItem()
            this.initParamRules()
            this.getMetricPoint()
        }

        initCompFormItem() {
            const isDropDownList = this.formData.view_type === 'dropdown-list'
            const INIT_FORM = {
                paramName: '',
                paramDesc: '',
                ...isDropDownList ? {
                    valType: 'custom',
                    type: 'single',
                    list: [],
                    trinoContent: '',
                    optionLabel: '',
                    optionValue: ''
                } : {}
            }
            Object.entries(INIT_FORM).forEach(({ 0: key, 1: value }) => {
                if (!this.formData.hasOwnProperty(key)) {
                    this.$set(this.formData, key, value)
                }
            })
            this.originParamsName = this.formData.paramName
        }
        initParamRules() {
            const formOptions: Array<{
                key: string,
                tip: string
            }> = [{
                key: 'optionLabel',
                tip: '请选择备选项名称'
            }, {
                key: 'optionValue',
                tip: '请选择备选项值'
            }]
            formOptions.forEach(option => {
                this.rules[option.key] = [
                    {
                        required: true,
                        message: option.tip,
                        trigger: 'blur'
                    }
                ]
            })
            // 校验取值配置
            this.rules['valType'] = [
                {
                    validator: () => {
                        // 如果是自定义类型,list内的value和label不能有为空的情况, 是trino类型, trinoContent不能为空
                        if (this.formData.valType === 'custom') {
                            const { list } = this.formData
                            const isValidate = list.some(item => !item.value || !item.label)
                            return list.length && !isValidate
                        } else {
                            return !!this.formData.trinoContent
                        }
                    },
                    message: '请完善取值配置内容',
                    trigger: 'blur'
                }
            ]
            // 参数名称校验
            this.rules['paramName'] = [
                {
                    required: true,
                    message: '请输入参数名称',
                    trigger: 'blur'
                },
                {
                    validator: () => {
                        const { paramName } = this.formData
                        const isValidate = this.originParamsName !== paramName && this.conditionParamsValue.hasOwnProperty(paramName)
                        return !isValidate
                    },
                    message: '已存在该参数名的条件组件',
                    trigger: 'blur'
                }
            ]
        }
        // 父组件编辑提交前校验
        validSubmit() {
            return true
        }
        handleAddValue() {
            if (this.isValidate) return false
            this.formData.list.push({
                value: '1',
                label: '1',
                default: false
            })
        }
        handleValCol(row: number, col: number, status: boolean) {
            const key = `${row}-${col}`
            // 判断当前的输入框是否为空(在离开框后)
            const isValidate = !status && !this.formData.list[row][col ? 'label' : 'value']
            if (!status) {
                this.isValidate = isValidate
                if (isValidate) return false
            }
            this.$set(this.singleConfigStatus, key, status)
            if (status) {
                Object.keys(this.singleConfigStatus).forEach((k) => {
                    if (k !== key) {
                        this.singleConfigStatus[k] = false
                    }
                })
                this.$nextTick(_ => {
                    const input: any = this.$refs[`colInput_${row}_${col}`]
                    input?.[0]?.focus()
                })
            }
        }
        handleValDelete(row: number) {
            this.formData.list.splice(row, 1)
            this.isValidate = !this.formData.list.every(r => r.label && r.value)
        }
        handleValDefault(item: any, index: number) {
            if (this.isValidate && (!item['label'] || !item['value'])) {
                return false
            }
            if (this.formData.type === 'single') {
                this.formData.list.forEach((row, i) => {
                    if (index !== i) {
                        row.default = false
                    }
                })
            }
            item.default = !item.default
        }
        handleChangeType(val) {
            if (val === 'single') {
                let isFirstDefaultFound = false
                this.formData.list.forEach((item) => {
                    if (item.default && !isFirstDefaultFound) {
                        isFirstDefaultFound = true
                    } else {
                        item.default = false
                    }
                })
            }
        }
        handleChangeValType(val) {
            // 切换类型时重置数据
            if (this.formData.valType === 'custom') {
                this.formData.trinoContent = ''
                this.formData.optionLabel = ''
                this.formData.optionValue = ''
            } else {
                this.formData.list = []
            }
        }
        handleExecute() {
            this.formData.optionLabel = ''
            this.formData.optionValue = ''
            this.getMetricPoint()
        }
        async getMetricPoint() {
            const { formData: { trinoContent }, rangeType, timeRange } = this
            this.trinoLoading = true
            const data = await getTrinoResult(trinoContent, rangeType, timeRange, this.conditionParamsValue)
            this.fieldOptions = Object.keys(data?.[0] || [])
            this.trinoLoading = false
        }
    }
</script>

<style lang="scss" scoped>
.conditional-option {
    .trino-wrap {
        display: flex;
        .operate {
            width: 22px;
            height: 22px;
            overflow: hidden;
            line-height: 22px;
            cursor: pointer;
            margin-left: 4px;
            font-size: 20px;
            .bk-icon {
                cursor: pointer;
            }
            &.disabled {
                cursor: not-allowed;
                color: #c4c6cc;
                pointer-events: none;
            }
        }
    }
    .custom-config-table {
        width: 100%;
        margin-top: 20px;
        table {
            width: 100%;
            .icon-plus {
                font-size: inherit;
                padding: 3px 10px;
                background: #3a84ff;
                border-radius: 3px;
                color: #ffffff;
                float: right;
                margin-top: 5px;
                margin-right: 10px;
                cursor: pointer;
                &.disabled {
                    background: #cbdffe;
                }
            }
            thead {
                color: #63656e;
                font-weight: 700;
            }
            th {
                border-bottom: 1px solid #dfe0e5;
                height: 43px;
                background-color: #fafbfd;
                font-size: 12px;
            }
            td {
                text-align: center;
                font-size: 12px;
                &.val-td {
                    cursor: move;
                    .validate-tip {
                        /deep/.bk-form-input {
                            border: 1px solid #ea3636;
                        }
                    }
                    .validate-tip-span {
                        color: #ea3636;
                        font-size: 10px;
                    }
                }
                .operate {
                    display: inline-block;
                    color: #3a84ff;
                    cursor: pointer;
                    &.val-default {
                        color: #ea3636;
                    }
                    &.disable-default {
                        color: #c0bfc4;
                    }
                }
            }
        }
    }
}
</style>
