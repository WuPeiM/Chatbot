<template>
    <div>
        <bk-sideslider
            title="导出所有搜索结果"
            :is-show.sync="visible"
            :quick-close="true"
            :width="600"
            ext-cls="common-dialog-wrapper"
            :before-close="handleClose"
        >
            <div slot="content" class="common-dialog-wrapper-main">
                <p>以下设置基于消息表格: 所有消息</p>
                <p>导出支持由装饰器创建的字段，这些字段是消息表的一部分，但它们目前不出现在字段列表中。如果要导出修饰字段，只需输入其名称即可。</p>
                <p>完成配置后，单击开始下载。</p>
                <bk-form :label-width="110" form-type="vertical" :model="formData">
                    <bk-form-item label="要导出的字段">
                        <bk-tag-input
                            v-model="formData.field"
                            :list="fieldList"
                            placeholder="请选择要导出的字段"
                            :trigger="'focus'"
                            :allow-create="true"
                            :has-delete-icon="true"
                            :allow-next-focus="false">
                        </bk-tag-input>
                    </bk-form-item>
                    <bk-form-item label="消息限制">
                        <bk-input
                            type="number"
                            :min="1"
                            :precision="0"
                            v-model="formData.limit"
                            placeholder="请输入消息限制">
                        </bk-input>
                    </bk-form-item>
                </bk-form>
                <p class="limit-desc">消息以块的形式加载。如果定义了限制，则将检索直到达到限制的所有块。这意味着传递的消息总数可能高于定义的限制。</p>
            </div>
            <div slot="footer">
                <bk-button @click="handleClose" class="mr10">取消</bk-button>
                <bk-button theme="primary" :disabled="downloadDisabled" :loading="loading" @click="handleDownLoad">开始下载</bk-button>
            </div>
        </bk-sideslider>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
@Component({})
export default class DownloadModal extends Vue {
    visible: boolean = false
    formData: any = {
        field: ['timestamp', 'source', 'message'],
        limit: ''
    }
    fieldList = []
    params: any = {}
    loading: boolean = false

    get downloadDisabled() {
        return !this.formData.field.length
    }

    // 显示弹窗
    show({ allFields, executeResult }) {
        const fieldData = this.$copy(allFields)
        fieldData.forEach(item => {
            item.name = item.id
        })
        this.visible = true
        this.fieldList = fieldData
        this.params = executeResult
    }
    handleClose() {
        this.visible = false
    }
    // 获取隐藏/显示字段列表
    async handleDownLoad() {
        const target = Object.values(Object.values(this.params.results)[0].search_types).find(item => item.type === 'messages')
        this.loading = true
        try {
            const params = {
                id: this.params.search_id,
                typeId: target.id,
                body: {
                    execution_state: { parameter_bindings: {} },
                    limit: this.formData.limit,
                    fields_in_order: this.formData.field
                }
            }
            const res = await this.$api.log.createDownloadId(params)
            const { result, message, data } = res
            if (!result) {
                return this.$error(message)
            }
            this.download({ id: data, name: 'log' + Date.now() })
        } finally {
            this.loading = false
        }
    }
    async download(params) {
        const apiUrl = window.siteUrl + `syslog/download_files/${params.id}/${params.name}.csv/`
        window.open(apiUrl)
    }
}
</script>

<style lang="scss" scoped>
.limit-desc {
    color: rgb(131, 131, 131);
}

/deep/.bk-label-text {
    font-weight: 800;
}
</style>
