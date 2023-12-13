<template>
    <bk-form
        :label-width="labelWidth"
        :model="formData"
        :rules="rules"
        ref="customValidateForm">
        <bk-form-item
            label="开始位置"
            :required="true"
            :property="'begin_index'"
            :error-display-type="'normal'">
            <bk-input
                type="number"
                :style="{ width: `${inputWidth}px` }"
                v-model="formData.begin_index">
            </bk-input>
            <div class="tip-text">从什么地方开始提取的字符.</div>
        </bk-form-item>
        <bk-form-item
            label="结束位置"
            :required="true"
            :property="'end_index'"
            :error-display-type="'normal'">
            <bk-input
                type="number"
                :style="{ width: `${inputWidth}px` }"
                v-model="formData.end_index">
            </bk-input>
            <div class="tip-text">提取到哪个位置结束。例如: 1,5 可以把分割 ilovelogs 切割为 love.</div>
        </bk-form-item>
        <bk-form-item>
            <bk-button
                :disabled="(!formData.begin_index && formData.begin_index !== 0) || (!formData.end_index && formData.end_index !== 0)"
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
    export default class subStringConfiguration extends Vue {
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
            begin_index: 0,
            end_index: 1
        }
        rules = {
            begin_index: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ],
            end_index: [
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
            this.$api.extractor.substringTester({
                string: this.testValue,
                start: this.formData.begin_index,
                end: this.formData.end_index
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
