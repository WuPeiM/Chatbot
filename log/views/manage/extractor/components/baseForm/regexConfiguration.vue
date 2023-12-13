<template>
    <bk-form
        :label-width="labelWidth"
        :model="formData"
        :rules="rules"
        ref="customValidateForm">
        <bk-form-item
            label="正则表达式"
            :required="true"
            :property="'regex_value'"
            :error-display-type="'normal'">
            <div>
                <bk-input
                    :style="{ width: `${inputWidth}px` }"
                    v-model="formData.regex_value"
                    placeholder="^.*string(.+)$">
                </bk-input>
                <bk-button
                    :loading="testLoading"
                    :theme="'primary'"
                    :title="'测试'"
                    class="ml20"
                    @click="test">
                    测试
                </bk-button>
            </div>
            <div class="tip-text">正则表达式用于提取，使用第一个匹配组。</div>
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
    export default class regexConfiguration extends Vue {
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
            regex_value: ''
        }
        rules = {
            regex_value: [
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
            this.$api.extractor.testRegex({
                string: this.testValue,
                regex: this.formData.regex_value
            }).then(res => {
                const { result, message, data } = res
                if (!result) {
                    this.$error(message)
                    return false
                }
                if (!data.matched) {
                    this.showPreview = false
                    this.$warn('正则表达式不匹配!')
                    return false
                }
                this.showPreview = true
                this.previewValue = data.match.match
            }).finally(() => {
                this.testLoading = false
            })
        }
    }
</script>
