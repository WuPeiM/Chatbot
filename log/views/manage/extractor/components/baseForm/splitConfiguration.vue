<template>
    <bk-form
        :label-width="labelWidth"
        :model="formData"
        :rules="rules"
        ref="customValidateForm">
        <bk-form-item
            label="分隔符"
            :required="true"
            :property="'split_by'"
            :error-display-type="'normal'">
            <bk-input
                :style="{ width: `${inputWidth}px` }"
                v-model="formData.split_by">
            </bk-input>
            <div class="tip-text">用什么字符进行分隔. 例如： 一个空格符将会把 foo bar baz 分隔成 [foo,bar,baz].</div>
        </bk-form-item>
        <bk-form-item
            label="目标索引"
            :required="true"
            :property="'index'"
            :error-display-type="'normal'">
            <bk-input
                type="number"
                :style="{ width: `${inputWidth}px` }"
                v-model="formData.index">
            </bk-input>
            <div class="tip-text">想要分隔字符串哪一部分?例如: 用空格分隔后的 foo bar baz 的第 2 部分是 bar.</div>
        </bk-form-item>
        <bk-form-item>
            <bk-button
                :disabled="!formData.split_by || (!formData.index && formData.index !== 0)"
                :loading="testLoading"
                :theme="'primary'"
                :title="'测试'"
                @click="test">
                测试
            </bk-button>
        </bk-form-item>
        <bk-form-item v-if="showPreview">
            <div class="preview-box">
                <div class="title">
                    提取器预览
                </div>
                <div class="content">
                    <span>{{previewValue || '什么都不会被提取出来'}}</span>
                </div>
            </div>
        </bk-form-item>
    </bk-form>
</template>

<script lang="ts">
    import {Vue, Component, Prop} from 'vue-property-decorator'
    import { ExtractorMixin } from '../../ts/extractorMixin.ts'
    @Component({
        mixins: [ExtractorMixin]
    })
    export default class splitConfiguration extends Vue {
        @Prop({
            type: Number,
            default: () => 140
        })
        labelWidth: number
        @Prop({
            type: Number,
            default: () => 480
        })
        inputWidth: number
        @Prop({ type: String, default: () => '' }) testValue: string
        formData: any = {
            split_by: '', // 分割符
            index: 1 // 目标索引
        }
        rules = {
            split_by: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ],
            index: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ]
        }
        testLoading: boolean = false
        previewValue: string = ''
        showPreview: boolean = false
        test() {
            this.testLoading = true
            this.$api.extractor.splitTester({
                string: this.testValue,
                ...this.formData
            }).then(res => {
                const { result, message, data } = res
                if (!result) {
                    this.$error(message)
                    this.showPreview = false
                    return false
                }
                if (data.successful) {
                    this.showPreview = true
                    this.previewValue = data.cut
                }
            }).finally(() => {
                this.testLoading = false
            })
        }
    }
</script>
