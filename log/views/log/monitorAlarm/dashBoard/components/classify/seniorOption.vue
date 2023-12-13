<template>
    <div class="mt20 senior-option">
        <bk-form-item
            required
            label="Trino语句"
            :property="'trinoDesc'"
            :error-display-type="'normal'">
            <div class="trino-wrap">
                <bk-input
                    v-model="formData.trinoDesc"
                    placeholder="请输入Trino语句"
                    type="textarea"
                    :rows="13" />
                <div :class="['operate', !formData.trinoDesc && 'disabled']" v-if="!isSingle">
                    <bk-spin v-show="trinoLoading" :spinning="false" size="mini"></bk-spin>
                    <bk-icon v-show="!trinoLoading" type="right-shape" @click="handleExecute" />
                </div>
            </div>
        </bk-form-item>
        <template v-if="!isSingle && !isTable">
            <div class="param-wrap">
                <div class="param-title">
                    <div class="title-wrap">
                        <span>{{ getLabel('source') }}</span>
                        <div class="line"></div>
                    </div>
                </div>
                <div class="param-content">
                    <div class="param-item">
                        <bk-form-item
                            required
                            label="字段"
                            property="sourceField"
                            :error-display-type="'normal'">
                            <bk-select :loading="trinoLoading" v-model="formData.sourceField">
                                <bk-option
                                    v-for="field in fieldKeys"
                                    :key="field"
                                    :id="field"
                                    :name="field"
                                    :disabled="[formData.targetField, formData.measureField].includes(field)">
                                </bk-option>
                            </bk-select>
                        </bk-form-item>
                        <bk-form-item label="名称" v-if="!isSankeyAndTopo">
                            <bk-input
                                clearable
                                placeholder="指定显示名称"
                                v-model="formData.sourceName">
                            </bk-input>
                        </bk-form-item>
                    </div>
                </div>
            </div>
            <div
                class="param-wrap"
                v-if="formData.view_type !== 'senior-pie'">
                <div class="param-title">
                    <div class="title-wrap">
                        <span>{{ getLabel('target') }}</span>
                        <div class="line"></div>
                    </div>
                </div>
                <div class="param-content">
                    <div class="param-item">
                        <bk-form-item
                            required
                            label="字段"
                            property="targetField"
                            :error-display-type="'normal'">
                            <bk-select :loading="trinoLoading" v-model="formData.targetField">
                                <bk-option
                                    v-for="field in fieldKeys"
                                    :key="field"
                                    :id="field"
                                    :name="field"
                                    :disabled="[formData.sourceField, formData.measureField].includes(field)">
                                </bk-option>
                            </bk-select>
                        </bk-form-item>
                        <bk-form-item label="名称" v-if="!isSankeyAndTopo">
                            <bk-input
                                clearable
                                placeholder="指定显示名称"
                                v-model="formData.targetName">
                            </bk-input>
                        </bk-form-item>
                    </div>
                </div>
            </div>
            <div
                class="param-wrap"
                v-if="formData.view_type !== 'senior-topo'">
                <div class="param-title">
                    <div class="title-wrap">
                        <span>{{ getLabel('measure') }}</span>
                        <div class="line"></div>
                    </div>
                </div>
                <div class="param-content">
                    <div class="param-item">
                        <bk-form-item
                            required
                            label="字段"
                            property="measureField"
                            :error-display-type="'normal'">
                            <bk-select :loading="trinoLoading" v-model="formData.measureField">
                                <bk-option
                                    v-for="field in fieldKeys"
                                    :key="field"
                                    :id="field"
                                    :name="field"
                                    :disabled="[formData.sourceField, formData.targetField].includes(field)">
                                </bk-option>
                            </bk-select>
                        </bk-form-item>
                    </div>
                </div>
            </div>
            <div class="param-wrap" v-else>
                <div class="param-title">
                    <div class="title-wrap">
                        <span>连线数值</span>
                        <div class="line"></div>
                    </div>
                </div>
                <div class="param-content">
                    <div class="param-item">
                        <bk-form-item
                            label="字段"
                            required
                            property="measureField"
                            :error-display-type="'normal'">
                            <bk-select :loading="trinoLoading" v-model="formData.measureField">
                                <bk-option
                                    v-for="field in fieldKeys"
                                    :key="field"
                                    :id="field"
                                    :name="field"
                                    :disabled="[formData.sourceField, formData.targetField].includes(field)">
                                </bk-option>
                            </bk-select>
                        </bk-form-item>
                        <bk-form-item
                            label="阈值配色"
                            property="threshold"
                            :error-display-type="'normal'">
                            <div class="form-color-item">
                                <bk-select v-model="formData.threshold.sign">
                                    <bk-option id=">" name=">" />
                                    <bk-option id="=" name="=" />
                                    <bk-option id="<" name="<" />
                                </bk-select>
                                <bk-input
                                    v-model="formData.threshold.value"
                                    clearable />
                                <bk-color-picker
                                    v-model="formData.threshold.color"
                                    :show-value="false" />
                            </div>
                        </bk-form-item>
                    </div>
                </div>
            </div>
        </template>
        <template v-if="isTable">
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
                        v-for="(item, index) in formData.displayField">
                        <bk-form-item
                            label="字段"
                            required
                            :rules="rules.field(item)"
                            error-display-type="normal">
                            <bk-select
                                :loading="trinoLoading"
                                v-model="item.field">
                                <bk-option
                                    v-for="rowField in fieldKeys"
                                    :key="rowField"
                                    :id="rowField"
                                    :name="rowField"
                                    :disabled="optDisabledFun(rowField)">
                                </bk-option>
                            </bk-select>
                        </bk-form-item>
                        <bk-form-item label="名称">
                            <bk-input
                                placeholder="指定显示名称"
                                v-model="item.name">
                            </bk-input>
                        </bk-form-item>
                        <div class="operate">
                            <i
                                class="bk-icon icon-delete"
                                @click="handleRemove(index)" />
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
    import { ViewForm } from '../../types/index'
    import { Component, Vue, Prop } from 'vue-property-decorator'
    import { getTrinoResult } from '../../utils'

    interface Field {
        [key: string]: any;
    }

    const DEF_COLOR = '#E51407'

    @Component({ name: 'SeniorOption' })
    export default class SeniorOption extends Vue {
        @Prop({ type: Object, default: {} }) formData: ViewForm
        @Prop({ type: Boolean }) isConfirm: boolean
        @Prop({ type: Object }) rules: any
        @Prop() rangeType: string
        @Prop({ type: String }) timeRange: string
        @Prop({ default: () => ({}) }) conditionParamsValue: any

        trinoLoading: boolean = false
        fieldList: Array<Field> = []
        fieldKeys: Array<string> = []

        get isSankeyAndTopo() {
            return ['senior-topo', 'senior-sankey'].includes(this.formData.view_type)
        }

        get isSingle() {
            return ['senior-single'].includes(this.formData.view_type)
        }
        get isTable() {
            return ['senior-table'].includes(this.formData.view_type)
        }

        created() {
            this.initCompFormItem()
            this.initCompFormRule()
            this.getMetricPoint()
        }

        handleExecute() {
            this.formData.sourceField = ''
            this.formData.targetField = ''
            this.formData.measureField = ''
            this.getMetricPoint()
        }
        async getMetricPoint() {
            const { formData: { trinoDesc }, rangeType, timeRange } = this
            this.trinoLoading = true
            const data: any = await getTrinoResult(trinoDesc, rangeType, timeRange, this.conditionParamsValue)
            this.fieldKeys = Object.keys(data?.[0] || [])
            this.fieldList = data
            this.trinoLoading = false
        }
        initCompFormItem() {
            const INIT_FORM = {
                trinoDesc: '',
                sourceField: '',
                targetField: '',
                measureField: '',
                displayField: [],
                threshold: { color: DEF_COLOR, value: '', sign: '=' }
            }
            Object.entries(INIT_FORM).forEach(({ 0: key, 1: value }) => {
                if (!this.formData.hasOwnProperty(key)) {
                    this.$set(this.formData, key, value)
                }
            })
        }

        initCompFormRule() {
            const validateRule: Array<{
                key: string,
                tip: string | Function,
                validator?: Function
            }> = [
                { key: 'trinoDesc', tip: '请输入Trino语句' },
                { key: 'sourceField', tip: '必填项' },
                { key: 'targetField', tip: '必填项' },
                { key: 'measureField', tip: '必填项' }
            ]
            validateRule.forEach(option => {
                this.rules[option.key] = [{
                    message: option.tip,
                    trigger: 'blur',
                    required: true,
                    validator: option.validator
                }]
            })
            this.rules.field = (item) => [
                {
                    message: '必填字段',
                    trigger: 'blur',
                    validator: function() {
                        return !!item['field']
                    }
                }
            ]
        }

        getLabel(type) {
            const viewType = this.formData.view_type.split('-')[1]
            const LABEL_MAP = {
                default: { source: '源对象', target: '目标对象', measure: '度量/值' },
                line: { source: '分组/X轴', target: '度量值/Y轴', measure: '维度' },
                bar: { source: '分组/X轴', target: '度量值/Y轴', measure: '维度' },
                pie: { source: '分组', target: '', measure: '度量/值' }
            }
            return (LABEL_MAP[viewType] || LABEL_MAP.default)[type]
        }
        optDisabledFun(field) {
            return !!this.formData.displayField.find(row => row.field === field)
        }
        handleAddField() {
            this.formData.displayField.push({
                field: '',
                name: ''
            })
        }
        handleRemove(index) {
            this.formData.displayField.splice(index, 1)
        }
    }
</script>

<style lang="scss" scoped>
.senior-option {
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
}
.form-color-item {
    display: flex;
    position: relative;
    margin-top: 8px;
    .bk-form-control {
        flex: 1;
    }
    /deep/ .bk-select {
        width: 80px;
        border-radius: 2px 0 0 2px;
        border-right-width: 0;
    }
    /deep/ input {
        border-radius: 0;
    }
    /deep/ .bk-color-picker {
        border-radius: 0 2px 2px 0;
        border-left-width: 0;
    }
}
/deep/ .bk-form-item.is-error .form-color-item {
    .bk-select {
        border-color: #c4c6cc;
    }
    .form-error-tip {
        padding-left: 80px;
    }
}
</style>
