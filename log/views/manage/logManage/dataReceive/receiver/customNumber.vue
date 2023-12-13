<template>
    <div>
        <bk-input
            v-model="internalValue"
            :type="type"
            clearable
            show-clear-only-hover>
        </bk-input>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from 'vue-property-decorator'
    @Component({
        name: 'custom-number'
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
            this.$emit('input', Number(value))
        }
    }
</script>
