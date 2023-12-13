<template>
    <div class="mt20">
        <bk-form-item
            label="条件过滤"
            property="conditionFilter"
            :error-display-type="'normal'">
            <span
                v-if="!formData.conditionFilter.length"
                class="add-btn"
                style="height: 32px;"
                @click="handleAddCondition">
                +
            </span>
            <div
                class="condition-filter-container"
                v-for="(item, index) in formData.conditionFilter"
                :key="index">
                <bk-select
                    searchable
                    v-model="item.dimension_id"
                    style="width: 110px;"
                    :loading="dimensionLoading"
                    ext-cls="select-custom"
                    ext-popover-cls="select-popover-custom"
                    @change="handleChangeDimension">
                    <bk-option
                        v-for="option in dimensionList"
                        :key="option.metric_field"
                        :id="option.metric_field"
                        :disabled="optDisabledFun(option)"
                        :name="option.field_cn_name">
                    </bk-option>
                    <div slot="extension" @click="handleDelete(index)" style="cursor: pointer;">
                        <i class="bk-icon icon-minus-circle"></i>删除
                    </div>
                </bk-select>
                <span class="equal operation">=</span>
                <bk-select
                    searchable
                    multiple
                    display-tag
                    v-model="item.value"
                    style="width: 170px;"
                    :loading="conditionLoadingMaps[item.dimension_id]"
                    ext-cls="select-custom"
                    ext-popover-cls="select-popover-custom">
                    <bk-option
                        v-for="option in (conditionMaps[item.dimension_id] || [])"
                        :key="option.value"
                        :id="option.value"
                        :name="option.label">
                    </bk-option>
                </bk-select>
                <span
                    class="add-btn"
                    v-if="index === formData.conditionFilter.length - 1"
                    @click="handleAddCondition">
                    +
                </span>
                <span
                    v-else
                    class="and operation">
                    AND
                </span>
            </div>
        </bk-form-item>
        <bk-form-item
            required
            :label="index ? '' : '阈值配色'"
            v-for="(item, index) in (formData.matchColor || [])"
            :key="index"
            :property="'matchColor.' + index"
            :error-display-type="'normal'">
            <div class="form-color-item">
                <bk-input
                    :min="0"
                    type="number"
                    :clearable="true"
                    :disabled="index === (formData.matchColor.length - 1)"
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
    import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

    @Component({
        components: {}
    })
    export default class DashBoardOption extends Vue {
        @Prop({ type: String }) unit: string
        @Prop({ type: Object }) formData: any
        @Prop({ type: Boolean }) isConfirm: boolean
        @Prop({ type: Object }) rules: any
        dimensionList: Array<{
            field_cn_name: string,
            metric_field: string
        }> = []
        conditionMaps: any = {}
        conditionLoadingMaps: any = {}
        dimensionLoading: boolean = false

        get validateMap() {
            const validate = {}
            const color = this.formData.matchColor || []
            color.forEach((item, index) => {
                validate[index] = !!(item.color && (item.value || item.value === 0))
            })
            return validate
        }

        // 校验阈值配色 阈值数组中不应存在相同的值
        get compareMatchValue() {
            const matchColor = this.formData.matchColor.map(r => r.value)
            const matchColorSet = Array.from(new Set(matchColor))
            if (matchColorSet.length !== matchColor.length) {
                return {
                    error: true,
                    tip: '阈值数组中存在相同的值, 请重新填写'
                }
            }
            return { error: false }
        }

        @Watch('formData.template')
        changeTemplate() {
            this.formData.conditionFilter = []
            this.getDimensions()
        }

        created() {
            this.initCompFormItem()
            this.initParamRules()
            this.getDimensions()
        }

        mounted() {
            this.formData.conditionFilter.forEach(row => {
                this.getVariableValue(row.dimension_id, 'init')
            })
        }

        initCompFormItem() {
            // 仪表盘添加配置： 最大值(max) 最小值 (min) 阈值配色(matchColor)
            const INIT_FORM = {
                conditionFilter: [],
                matchColor: [
                    { color: '#fd666d', value: '70' },
                    { color: '#37a2da', value: '30' },
                    { color: '#67e0e3', value: '0', disabled: true }
                ]
            }
            Object.entries(INIT_FORM).forEach(({ 0: key, 1: value }) => {
                if (!this.formData.hasOwnProperty(key)) {
                    this.$set(this.formData, key, value)
                }
            })
        }
        initParamRules() {
            this.rules['conditionFilter'] = [
                {
                    validator: () => {
                        const { conditionFilter } = this.formData
                        if (conditionFilter.length && conditionFilter.some(row => row.dimension_id && !row.value?.length)) {
                            return false
                        }
                        return true
                    },
                    message: '请完善条件过滤的值',
                    trigger: 'blur'
                }
            ]
        }
        async getDimensions() {
            if (!this.formData.template) {
                return false
            }
            this.dimensionLoading = true
            try {
                const res = await this.$api.dashBoard.getDimensions({
                    template_id: this.formData.template
                })
                const { data } = res
                this.dimensionList = data
            } finally {
                this.dimensionLoading = false
            }
        }

        validateMatchTip(val) {
            return val.color ? '请输入阈值的值' : '请选择阈值的颜色'
        }

        handleValidate() {
            return Object.values(this.validateMap).includes(false) || this.compareMatchValue?.error
        }

        handleChangeMin(value: string) {
            const lastMatch = this.formData.matchColor.at(-1)
            lastMatch.value = value
            this.handleChangeMatchValue(value)
        }

        handleChangeMatchValue(value: string) {
            if (!value) {
                return false
            }
            this.formData.matchColor.sort((a, b) => Number(b.value) - Number(a.value))
        }

        handleAddMatchColor(index: number) {
            this.formData.matchColor.splice(index, 0, {
                color: '',
                value: ''
            })
        }

        handleRemoveMatchColor(index: number) {
            this.formData.matchColor.splice(index, 1)
        }

        optDisabledFun(option) {
            return this.formData.conditionFilter.some(condition => condition.dimension_id === option.metric_field)
        }

        handleAddCondition() {
            this.formData.conditionFilter.push({
                dimension_id: '',
                value: ''
            })
        }

        async handleChangeDimension(id) {
            if (!id) {
                const cur = this.formData.conditionFilter.find(condition => condition.dimension_id === id)
                cur.value = []
                this.conditionMaps[id] = []
                return false
            }
            await this.getVariableValue(id)
        }

        async getVariableValue(id, type = 'update') {
            this.$set(this.conditionLoadingMaps, id, true)
            const cur = this.formData.conditionFilter.find(condition => condition.dimension_id === id)
            const initValue = cur?.value || []
            cur.value = []
            try {
                const res = await this.$api.dashBoard.getVariableValue({
                    bk_obj_id: this.formData.bk_obj_id,
                    table_id: this.formData.table_id,
                    metric_field: this.formData.metric_id.split('.').slice(-1)[0],
                    dimension_list: this.formData.conditionFilter.map(condition => condition.dimension_id)
                })
                const { data } = res
                if (type === 'init') {
                    this.$nextTick(() => {
                        cur.value = initValue
                    })
                }
                this.conditionMaps[id] = data.find(item => item.dimension === id)?.list || []
            } finally {
                this.conditionLoadingMaps[id] = false
            }
        }

        handleDelete(index) {
            this.formData.conditionFilter.splice(index, 1)
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
.condition-filter-container {
    display: flex;
    margin-bottom: 10px;
    .operation {
        padding: 0 8px;
        border: 1px solid #c4c6cc;
    }
    .and {
        color: #e99e9e;
    }
    .equal {
        color: #3a84ff;
    }
}
.add-btn {
    cursor: pointer;
    padding: 0 17px;
    border: 1px solid #c4c6cc;
    display: inline-block;
}
</style>
