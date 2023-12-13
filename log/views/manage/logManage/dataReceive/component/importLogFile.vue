<template>
    <div>
        <bk-sideslider
            :width="500"
            :is-show.sync="visible"
            :quick-close="true"
            ext-cls="common-dialog-wrapper"
            title="批量导入"
            :transfer="false"
            :before-close="cancel"
        >
            <div slot="content" class="common-dialog-wrapper-main">
                <bk-upload
                    v-if="!filesLength"
                    :key="uploadKey"
                    :with-credentials="true"
                    :custom-request="handleUpload"
                    :files="formData.fileList"
                    :url="''"
                    accept=".csv,.txt,.log"
                    :multiple="false"
                    ext-cls="upload-sec"
                    :size="102400"
                    tip="支持上传txt、csv、log格式文件，且文件大小不超过200MB"
                    ref="uploadFiles"
                ></bk-upload>
                <div v-else>
                    <ul class="review-list">
                        <li class="review-item" v-for="(item, index) in formData.fileList" :key="index">
                            <div class="review-item-name">
                                <bk-icon type="file" class="file-icon" />
                                <span class="file-name hide-text" v-bk-overflow-tips>{{item.name}}</span>
                            </div>
                            <div class="review-item-delete">
                                <bk-icon type="close-circle" @click.stop="handleDeleteFile(item, index)" />
                            </div>
                        </li>
                    </ul>
                    <bk-checkbox
                        v-if="showCheckbox"
                        :true-value="true"
                        :false-value="false"
                        v-model="formData.flak">
                        首行作为字段名
                    </bk-checkbox>
                </div>
            </div>
            <div slot="footer">
                <bk-button :loading="loading" :disabled="loading || !filesLength" :theme="'primary'" class="mr10" @click="confirm">
                    确认
                </bk-button>
                <bk-button @click="cancel">
                    取消
                </bk-button>
            </div>
        </bk-sideslider>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Emit } from 'vue-property-decorator'

    @Component
    export default class ImportLogFile extends Vue {
        visible: boolean = false
        formData: {
            fileList: Array<any>,
            flak: boolean
        } = {
                fileList: [],
                flak: true
            }
        loading: boolean = false
        uploadKey: string = 'uploadKey'

        get filesLength() {
            return this.formData.fileList?.length
        }

        get filesSize() {
            const _filesSize = this.formData.fileList.reduce((pre, cur) => {
                return cur.size + pre
            }, 0)
            return this.getOriginSize({ size: _filesSize })
        }

        get showCheckbox() {
            return this.formData.fileList[0]?.name?.endsWith('.csv')
        }

        handleUpload(res) {
            // 所有文件累加大小不能超过200Mb
            const filesSize = res.fileList.reduce((pre, cur) => {
                return cur.size * 1000 / 1024 / 1024 + pre
            }, 0)
            if (filesSize > 200) {
                this.uploadKey = 'uploadKey' + new Date()
                this.$error('上传的文件不能超过200Mb！')
                return
            }
            this.formData.flak = true
            this.$set(this.formData, 'fileList', res.fileList)
        }

        getOriginSize(row) {
            const originSize = (row.size * 1000 / 1024)
            const flag = originSize >= 1024
            const size = flag ? (originSize / 1024).toFixed(2) : originSize.toFixed(2)
            return `${size}${flag ? 'MB' : 'KB'}`
        }

        handleDeleteFile(row, index) {
            this.formData.fileList.splice(index, 1)
        }

        show(data) {
            Object.assign(this.$data, this.$options.data.call(this))
            this.visible = true
        }

        confirm() {
            const params = new FormData()
            if (this.showCheckbox) {
                params.append('flak', this.formData.flak)
            }
            this.formData.fileList.forEach(item => {
                params.append('file', item.origin)
            })
            this.uploadFiles(params)
        }

        async uploadFiles(params) {
            this.loading = true
            try {
                const res = await this.$api.logManage.importLog(params)
                if (!res.result) {
                    this.$error(res.message)
                    this.loading = false
                    return
                }
                this.visible = false
                this.$success('导入成功')
            } finally {
                this.loading = false
            }
        }

        cancel() {
            this.visible = false
            Object.assign(this.$data, this.$options.data.call(this))
        }

        @Emit('updateList')
        updateList() {
            return ''
        }
    }
</script>
<style lang="scss" scoped>
.review-list {
    margin: 20px 0;

    .review-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        border: 1px solid #ebeef5;
        background: #fafbfd;
        border-radius: 2px;

        .review-item-name {
            display: flex;
            align-items: center;
            width: 90%;

            .file-name {
                width: 90%;
            }

            .file-icon {
                font-size: 24px !important;
                margin-right: 4px;
            }
        }

        .review-item-delete {
            width: 20%;
            text-align: right;

            .bk-icon {
                cursor: pointer;

                &:hover {
                    color: #3a84ff;
                }
            }
        }
    }
}
</style>
