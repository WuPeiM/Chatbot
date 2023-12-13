<template>
    <bk-dialog
        :width="600"
        v-model="visible"
        theme="primary"
        :mask-close="false"
        header-position="left"
        title="选择提取器类型">
        <bk-select
            v-model="extractor"
            ext-cls="select-custom"
            ext-popover-cls="select-popover-custom"
            searchable>
            <bk-option
                v-for="option in extractorType"
                :key="option.id"
                :id="option.id"
                :name="option.name">
            </bk-option>
        </bk-select>
        <template slot="footer">
            <bk-button
                :disabled="!extractor"
                :theme="'primary'"
                :title="'确认'"
                class="mr10"
                @click="confirm">
                确认
            </bk-button>
            <bk-button
                :theme="'default'"
                type="submit"
                :title="'取消'"
                @click="close">
                取消
            </bk-button>
        </template>
    </bk-dialog>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    import { extractorType } from '@log/views/manage/extractor/ts/extractorMap.ts'
    @Component({
        name: 'select-extractor'
    })
    export default class SelectExtractor extends Vue {
        visible: boolean = false
        extractorType = extractorType
        extractor: string = ''
        logMsg: any = {}
        confirm() {
            const routeToOpen = {
                name: 'AddExtractor',
                query: {
                    message: this.logMsg.fieldValue,
                    extractorType: this.extractor,
                    receiverId: this.stripHtmlTags(this.logMsg.logInfo.message.gl2_source_input),
                    sourceField: this.logMsg.id
                }
            }
            const routeURL = this.$router.resolve(routeToOpen).href
            const newWindow = window.open(routeURL, '_blank')
            if (newWindow) {
                // 新窗口成功打开
                this.close()
            } else {
                // 新窗口被浏览器阻止
                alert('新窗口被浏览器阻止，请检查你的浏览器设置')
            }
        }
        show(data) {
            this.visible = true
            this.logMsg = data
        }
        stripHtmlTags(input) {
            // 使用正则表达式匹配HTML标签
            const regex = /<[^>]*>/g
            // 使用replace方法将HTML标签替换为空字符串
            return typeof input === 'string' ? input.replace(regex, '') : JSON.stringify(input)
        }
        close() {
            this.visible = false
        }
    }
</script>
