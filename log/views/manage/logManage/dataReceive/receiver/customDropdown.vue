<template>
    <div>
        <bk-select
            :disabled="false"
            v-model="internalValue"
            ext-cls="select-custom"
            placeholder="请选择"
            ext-popover-cls="select-popover-custom"
            searchable>
            <bk-option
                v-for="option in list"
                :key="option.id"
                :id="option.id"
                :name="option.name">
            </bk-option>
        </bk-select>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from 'vue-property-decorator'
    @Component({
        name: 'custom-dropdown'
    })
    export default class Text extends Vue {
        @Prop({
            default: () => ''
        })
        value: any
        @Prop({
            type: Object,
            default: () => ({})
        })
        customData: any
        type: string = 'number'
        list: any[] = []
        get internalValue(): any {
            return this.value
        }
        set internalValue(value: any) {
            this.$emit('input', value)
        }
        mounted() {
            for (const k in this.customData.additional_info.values) {
                this.list.push({
                    id: this.customData.additional_info.values[k],
                    name: k
                })
            }
        }
    }
</script>
