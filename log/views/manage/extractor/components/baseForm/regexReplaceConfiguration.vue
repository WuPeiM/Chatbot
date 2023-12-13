<template>
    <bk-form
        :label-width="labelWidth"
        :model="formData"
        :rules="rules"
        ref="customValidateForm">
        <bk-form-item
            label="正则表达式"
            :required="true"
            :property="'regex'"
            :error-display-type="'normal'">
            <bk-input
                placeholder="^.*string(.+)$"
                :style="{ width: `${inputWidth}px` }"
                v-model="formData.regex">
            </bk-input>
            <div class="tip-text">正则表达式用于对内容进行提取.</div>
        </bk-form-item>
        <bk-form-item
            label="替换文本"
            :required="true"
            :property="'replacement'"
            :error-display-type="'normal'">
            <bk-input
                placeholder="$1"
                :style="{ width: `${inputWidth}px` }"
                v-model="formData.replacement">
            </bk-input>
            <div class="tip-text">用于匹配文本的替换.</div>
        </bk-form-item>
        <bk-form-item>
            <bk-checkbox
                :true-value="true"
                :false-value="false"
                v-model="formData.replace_all">
                替换所有模式的匹配项
            </bk-checkbox>
            <div class="tip-text">存储提取的消息时，将丢弃包含空白的字段键。选中此框可将JSON键中的空白替换为另一个字符.</div>
        </bk-form-item>
        <bk-form-item>
            <bk-button
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
    export default class regexReplaceConfiguration extends Vue {
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
            regex: '', // 正则表达式
            replace_all: false, // 替换所有模式的匹配项
            replacement: '' // 替换文本
        }
        rules = {
            regex: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ],
            replacement: [
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
            this.$api.extractor.regexReplaceTester({
                string: this.testValue,
                ...this.formData
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
