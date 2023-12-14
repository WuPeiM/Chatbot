<template>
    <div class="input-container">
        <bk-form-item
            class="custom-input-widget"
            :label="option.name"
            :required="option.required"
            :property="option.key">
            <bk-input :value="formModel[option.key]" v-bind="option" @change="changeInputValue"></bk-input>
        </bk-form-item>
        <span class="desc">{{ option.desc }}</span>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Inject } from 'vue-property-decorator'

    @Component({
        name: 'custom-input'
    })
    export default class CustomInput extends Vue {
        @Inject() formModel: any
        @Prop({
            type: Object,
            default: () => ({
                name: '',
                required: false,
                property: ''
            })
        })
        option: any
        created() {
            this.formModel[this.option.key] = this.option.default || ''
        }
        changeInputValue(value) {
            this.formModel[this.option.key] = value
        }
    }
</script>

<style scoped lang="scss">
.input-container {
    display: flex;
    margin-bottom: 15px;
    .custom-input-widget {
        width: 500px;
        /deep/.bk-label {
            width: 150px !important;
        }
        /deep/.bk-form-content {
            margin-left: 150px !important;
        }
    }
    .desc {
        font-size: 12px;
        color: #9d9d9d;
        margin-left: 10px;
        flex: 1;
        height: 32px;
        display: flex;
        align-items: center;
    }
}
</style>
