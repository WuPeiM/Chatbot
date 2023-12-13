<template>
    <bk-form
        :label-width="labelWidth"
        :model="formData"
        :rules="rules"
        ref="customValidateForm">
        <bk-form-item>
            <bk-checkbox
                :true-value="true"
                :false-value="false"
                v-model="formData.flatten">
                扁平结果
            </bk-checkbox>
            <div class="tip-text">无论是将JSON对象扁平化到单个日志消息字段,还是扩展到多个领域.</div>
        </bk-form-item>
        <bk-form-item
            label="分隔符"
            :required="true"
            :property="'list_separator'"
            :error-display-type="'normal'">
            <bk-input :style="{ width: `${inputWidth}px` }" v-model="formData.list_separator"></bk-input>
            <div class="tip-text">用什么字符串来连接一个JSON列表.</div>
        </bk-form-item>
        <bk-form-item
            label="键分割符"
            :required="true"
            :property="'key_separator'"
            :error-display-type="'normal'">
            <bk-input :style="{ width: `${inputWidth}px` }" v-model="formData.key_separator"></bk-input>
            <div class="tip-text">用什么字符串去区分不同的JSON对象 (仅在 非 扁平结构中使用).</div>
        </bk-form-item>
        <bk-form-item
            label="键/值分隔符"
            :required="true"
            :property="'kv_separator'"
            :error-display-type="'normal'">
            <bk-input :style="{ width: `${inputWidth}px` }" v-model="formData.kv_separator"></bk-input>
            <div class="tip-text">串联JSON对象的键/值对时使用何种字符串 (仅在扁平结构中使用).</div>
        </bk-form-item>
        <bk-form-item
            label="JSON键前缀">
            <bk-input :style="{ width: `${inputWidth}px` }" v-model="formData.key_prefix"></bk-input>
            <div class="tip-text">JSON对象键的前缀.</div>
        </bk-form-item>
        <bk-form-item>
            <bk-checkbox
                :true-value="true"
                :false-value="false"
                v-model="formData.replace_key_whitespace">
                替换Key为空的键值
            </bk-checkbox>
            <div class="tip-text">存储提取的消息时，将丢弃包含空白的字段键。选中此框可将JSON键中的空白替换为另一个字符.</div>
        </bk-form-item>
        <bk-form-item
            label="键替换内容">
            <bk-input :style="{ width: `${inputWidth}px` }" v-model="formData.key_whitespace_replacement"></bk-input>
            <div class="tip-text">替换消息键中的空白时要使用的字符。请确保替换字符在Lucene中有效，例如-或\u</div>
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
                    <div
                        v-if="JSON.stringify(previewValue) !== '{}'"
                        style="display: flex;flex-wrap: wrap;">
                        <div
                            style="margin-bottom: 10px;margin-right: 20px;"
                            v-for="(value, key) in previewValue"
                            :key="key">
                            <div style="font-weight: 700;">{{key}}</div>
                            <div>{{value}}</div>
                        </div>
                    </div>
                    <span v-else>'什么都不会被提取出来'</span>
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
    export default class jsonConfiguration extends Vue {
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
            flatten: false, // 扁平结果
            list_separator: ',', // 分割符
            key_separator: '_', // 键分割符
            kv_separator: '=', // 键/值分隔符
            replace_key_whitespace: false, // 替换Key为空的键值
            key_whitespace_replacement: '_', // 键替换内容
            key_prefix: '' // JSON键前缀
        }
        rules = {
            list_separator: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ],
            key_separator: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ],
            kv_separator: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ]
        }
        testLoading: boolean = false
        previewValue: any = {}
        showPreview: boolean = false
        test() {
            this.testLoading = true
            this.$api.extractor.jsonTester({
                string: this.testValue,
                ...this.formData
            }).then(res => {
                const { result, message, data } = res
                if (!result) {
                    this.showPreview = false
                    this.$error(message)
                    return false
                }
                this.showPreview = true
                this.previewValue = data.matches
            }).finally(() => {
                this.testLoading = false
            })
        }
    }
</script>
