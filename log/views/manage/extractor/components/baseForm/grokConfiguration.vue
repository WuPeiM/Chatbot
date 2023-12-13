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
                v-model="formData.named_captures_only">
                只提取指定字段
            </bk-checkbox>
            <div class="tip-text">只提取Grok表达式中指定名称的字段.</div>
        </bk-form-item>
        <bk-form-item
            label="Grok表达式"
            :required="true"
            :property="'grok'"
            :error-display-type="'normal'">
            <div class="grok-box">
                <div class="grok-input">
                    <div class="title">Grok表达式</div>
                    <bk-input
                        :type="'textarea'"
                        :rows="5"
                        v-model="formData.grok_pattern">
                    </bk-input>
                    <div class="tip-text">
                        Grok表达式会对日志消息进行匹配，例如: '%{IP:client}' 或者 '.*?'
                    </div>
                </div>
                <div class="grok-select">
                    <div class="title">过滤</div>
                    <bk-select
                        :loading="grokLoading"
                        style="width: 250px;"
                        v-model="selectGrok"
                        searchable
                        @change="changeGrok">
                        <bk-option
                            v-for="option in grokList"
                            :key="option.id"
                            :id="option.name"
                            :name="option.name">
                            <div style="height: 24px;line-height: 24px;display: flex;justify-content: space-between;align-items: center;">
                                <span>{{option.name}}</span>
                                <bk-icon
                                    style="font-size: 16px;"
                                    type="plus-circle-shape"
                                    @click.stop="addGrok(option.name)" />
                            </div>
                            <div style="height: 24px;line-height: 24px;" class="hide-text" v-bk-overflow-tips>{{option.pattern}}</div>
                        </bk-option>
                    </bk-select>
                </div>
            </div>
        </bk-form-item>
        <bk-form-item>
            <bk-button
                :disabled="!formData.grok_pattern"
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
                    <div v-if="previewValue.length" style="display: flex;flex-wrap: wrap;">
                        <div
                            style="margin-bottom: 10px;margin-right: 20px;"
                            v-for="(item, index) in previewValue"
                            :key="index">
                            <div style="font-weight: 700;">{{item.name}}</div>
                            <div>{{item.match}}</div>
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
    export default class grokConfiguration extends Vue {
        @Prop({
            type: Number,
            default: () => 140
        })
        labelWidth: number
        @Prop({ type: String, default: () => '' }) testValue: string
        formData: any = {
            named_captures_only: false,
            grok_pattern: ''
        }
        rules = {
            grok: [
                {
                    validator: () => {
                        return this.formData.grok_pattern
                    },
                    message: '必填项',
                    trigger: 'blur'
                }
            ]
        }
        selectGrok = ''
        grokList: any[] = []
        grokLoading: boolean = false
        testLoading: boolean = false
        previewValue: any[] = []
        showPreview: boolean = false
        mounted() {
            this.getGrokList()
        }
        changeGrok(value) {
            this.addGrok(value)
        }
        addGrok(value) {
            this.formData.grok_pattern += `%{${value}}`
        }
        test() {
            this.testLoading = true
            this.$api.extractor.grokTester({
                string: this.testValue,
                pattern: this.formData.grok_pattern,
                named_captures_only: this.formData.named_captures_only
            }).then(res => {
                const { result, message, data } = res
                if (!result) {
                    this.$error(message)
                    return false
                }
                if (!data.matched) {
                    this.$warn('grok提取失败,请检查参数.')
                    this.showPreview = false
                    return false
                }
                this.showPreview = true
                this.previewValue = data.matches
            }).finally(() => {
                this.testLoading = false
            })
        }
        getGrokList() {
            this.grokLoading = true
            this.$api.extractor.getGrokList().then(res => {
                const { result, data } = res
                if (!result) {
                    return false
                }
                this.grokList = data.patterns || []
            }).finally(() => {
                this.grokLoading = false
            })
        }
    }
</script>

<style lang="scss" scoped>
    .grok-box {
        display: flex;
        .title {
            font-size: 14px;
        }
        .grok-input {
            width: 400px;
            margin-right: 20px;
        }
    }
</style>
