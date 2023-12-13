<template>
    <div>
        <bk-checkbox
            :true-value="true"
            :false-value="false"
            v-model="internalValue">
            {{customData.human_name}}
        </bk-checkbox>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from 'vue-property-decorator'
    @Component({
        name: 'custom-boolean'
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
        get internalValue(): any {
            return this.value
        }
        set internalValue(value: any) {
            this.$emit('input', value)
        }
    }
</script>
