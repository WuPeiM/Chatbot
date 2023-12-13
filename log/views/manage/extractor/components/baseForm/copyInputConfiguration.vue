<template>
    <bk-form :label-width="labelWidth">
        <bk-form-item>
            <div class="source-field-tip">整个输入将被逐字复制.</div>
        </bk-form-item>
    </bk-form>
</template>

<script lang="ts">
    import {Vue, Component, Prop} from 'vue-property-decorator'

    @Component({})
    export default class copyInputConfiguration extends Vue {
        @Prop({
            type: Number,
            default: () => 140
        })
        labelWidth: number
    }
</script>

<style scoped lang="scss">
    .source-field-tip {
        padding: 15px;
        border-radius: 4px;
        border: 1px solid #7894ce;
        background-color: #fafafa;
    }
</style>
