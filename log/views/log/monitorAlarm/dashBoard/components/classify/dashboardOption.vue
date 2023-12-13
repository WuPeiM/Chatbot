<template>
    <div class="mt20">
        <bk-form-item
            required
            label="最大值"
            :property="'max'"
            :error-display-type="'normal'">
            <div style="display: flex;">
                <bk-input
                    :min="0"
                    type="number"
                    :clearable="true"
                    v-model="formData.max">
                </bk-input>
                <span class="unit-span">{{ unit }}</span>
            </div>
        </bk-form-item>
        <bk-form-item
            required
            label="最小值"
            :property="'min'"
            :error-display-type="'normal'">
            <div style="display: flex;">
                <bk-input
                    :min="0"
                    type="number"
                    :clearable="true"
                    v-model="formData.min"
                    @change="handleChangeMin">
                </bk-input>
                <span class="unit-span">{{ unit }}</span>
            </div>
            <p class="form-error-tip mt10" v-if="isConfirm && compareMinAndMax">
                最小值应比最大值小, 请重新填写
            </p>
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
    import { Component, Vue, Prop } from 'vue-property-decorator'

    @Component({
        components: {}
    })
    export default class DashBoardOption extends Vue {
        @Prop({ type: String }) unit: string
        @Prop({ type: Object }) formData: any
        @Prop({ type: Boolean }) isConfirm: boolean
        @Prop({ type: Object }) rules: any

        get compareMinAndMax() {
            return Number(this.formData.min) >= Number(this.formData.max)
        }

        get validateMap() {
            const validate = {}
            const color = this.formData.matchColor || []
            color.forEach((item, index) => {
                validate[index] = !!(item.color && (item.value || item.value === 0))
            })
            return validate
        }

        // 校验阈值配色 1.最小阈值应和最小值相同 2.最大阈值应比最大值小 3.阈值数组中不应存在相同的值
        get compareMatchValue() {
            // 1 校验
            const lastMatch = this.formData.matchColor.at(-1)?.value
            if (Number(lastMatch) !== Number(this.formData.min)) {
                return {
                    error: true,
                    tip: '最小阈值应与最小值相同, 请重新填写'
                }
            }
            // 2 校验
            const firstMatch = this.formData.matchColor.at(0)?.value
            if (Number(firstMatch) >= Number(this.formData.max)) {
                return {
                    error: true,
                    tip: '最大阈值应比最大值小, 请重新填写'
                }
            }
            // 3 校验
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

        created() {
            this.initCompFormItem()
            this.initCompFormRule()
        }

        initCompFormItem() {
            // 仪表盘添加配置： 最大值(max) 最小值 (min) 阈值配色(matchColor)
            const INIT_FORM = {
                max: '100',
                min: '0',
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

        initCompFormRule() {
            const validateRule: Array<{
                key: string,
                tip: string | Function,
            }> = [
                { key: 'max', tip: '请输入最大值' },
                { key: 'min', tip: '请输入最小值' }
            ]
            validateRule.forEach(option => {
                this.rules[option.key] = [
                    {
                        message: option.tip,
                        trigger: 'blur',
                        required: true
                    }
                ]
            })
        }

        validateMatchTip(val) {
            return val.color ? '请输入阈值的值' : '请选择阈值的颜色'
        }

        handleValidate() {
            return Object.values(this.validateMap).includes(false) || (this.compareMinAndMax || this.compareMatchValue?.error)
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
</style>
