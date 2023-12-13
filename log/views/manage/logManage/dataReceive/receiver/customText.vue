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
        name: 'custom-text'
    })
    export default class Text extends Vue {
        @Prop({
            type: String,
            default: () => ''
        })
        value: string
        @Prop({
            type: Object,
            default: () => ({})
        })
        customData: any
        type: string = 'text'
        get internalValue(): any {
            return this.value
        }
        set internalValue(value: any) {
            this.$emit('input', value)
        }
        mounted() {
            this.getType(this.customData.attributes[0])
        }
        getType(type) {
            switch (type) {
                case 'textarea':
                    this.type = 'textarea'
                    break
                case 'is_password':
                    this.type = 'password'
                    break
                default:
                    this.type = 'text'
            }
        }
    }
</script>
