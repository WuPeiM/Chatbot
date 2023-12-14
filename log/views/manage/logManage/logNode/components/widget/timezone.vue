<template>
    <bk-select class="form-timezone-selector"
        searchable
        v-model="selected"
        :clearable="false"
        :disabled="disabled"
        :multiple="multiple"
        :placeholder="placeholder"
        ref="selector">
        <bk-option
            v-for="(option, index) in timezoneList"
            :key="index"
            :id="option.id"
            :name="option.name">
        </bk-option>
    </bk-select>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
    import TIMEZONE from './timezone.json'
    @Component({
        name: 'form-timezone'
    })
    export default class FormTimeZone extends Vue {
        @Prop({ type: [Array, String, Number], default: '' }) value: any
        @Prop({ type: Boolean, default: false }) disabled: boolean
        @Prop({ type: Boolean, default: false }) multiple: boolean
        @Prop({ type: String, default: '' }) placeholder: string

        timezoneList = TIMEZONE.map(timezone => ({
            id: timezone,
            name: timezone
        }))
        selected = this.multiple ? [] : ''

        @Watch('value')
        changeValue(value: any) {
            if (value !== this.selected) {
                this.selected = value
            }
        }
        @Watch('selected')
        changeSelected(selected: any) {
            this.$emit('input', selected)
            this.$emit('on-selected', selected)
        }
        @Watch('disabled')
        changeDisabled(disabled: boolean) {
            if (!disabled) {
                this.selected = this.getDefaultValue()
            }
        }
        created() {
            this.selected = this.getDefaultValue()
        }
        getDefaultValue() {
            let value = this.value || ''
            if (this.multiple && !value.length) {
                value = ['Asia/Shanghai']
            } else {
                value = value || 'Asia/Shanghai'
            }
            return value
        }
        focus(): void {
            this.$refs.selector.show()
        }
    }
</script>

<style lang="scss" scoped>
    .form-timezone-selector {
        width: 100%;
    }
</style>
