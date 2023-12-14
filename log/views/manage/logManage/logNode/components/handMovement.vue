<template>
    <bk-sideslider
        :width="650"
        :is-show.sync="isShow"
        :quick-close="true"
        ext-cls="common-dialog-wrapper">
        <div slot="header">
            {{ title }}
        </div>
        <div
            class="content"
            slot="content"
            v-bkloading="{ isLoading: loading, zIndex: 10 }">
            <template v-if="detail.operationType !== 'controller'">
                <div class="mb10" style="font-size: 14px;color: #63656e;font-weight: 700;">安装方式:</div>
                <bk-radio-group class="mb10" v-model="installWay">
                    <bk-radio-button :value="detail.os_type === 'LINUX' ? 'Linux' : 'Windows'">
                        {{ detail.os_type === 'LINUX' ? 'Linux' : 'Windows' }}
                    </bk-radio-button>
                </bk-radio-group>
            </template>
            <div class="show-result">
                <bk-alert
                    v-if="controllerType === 'unload'"
                    class="mb25"
                    type="warning"
                    title="请确定已经手动卸载控制器，系统将自动获取控制器卸载情况，已卸载的主机将从列表中移除，未卸载的主机仍展示在列表中，并可以进行正常操作">
                </bk-alert>
                <div class="text-box" v-if="commandList.length">
                    <div :class="['custom-step', index !== commandList.length - 1 && 'custom-step-space']"
                        v-for="(item, index) in commandList"
                        :key="index">
                        <div class="step-number">{{index + 1}}</div>
                        <div class="step-content">
                            <div class="step-content-title">{{item.title}}</div>
                            <div class="step-result" v-if="!item.download_url">
                                <bk-icon
                                    v-copy="item.content"
                                    class="operate-icon-copy"
                                    type="clipboard" />
                                <span>{{item.content}}</span>
                            </div>
                            <div
                                v-else
                                class="download-text"
                                @click="downloadFile(item.download_url)">
                                <bk-icon type="arrows-down-shape" />
                                {{item.content}}
                            </div>
                        </div>
                    </div>
                </div>
                <bk-exception
                    v-else
                    class="exception-wrap-item exception-part"
                    type="empty"
                    scene="part">
                </bk-exception>
            </div>
        </div>
        <div slot="footer">
            <bk-button
                theme="default"
                @click="isShow = false">
                关闭
            </bk-button>
            <bk-button
                v-if="controllerType === 'unload'"
                style="margin-left: 15px;"
                theme="primary"
                @click="handleUnloadController">
                已完成
            </bk-button>
        </div>
    </bk-sideslider>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    @Component({
        name: 'hand-movement'
    })
    export default class handMovement extends Vue {
        isShow: boolean = false
        detail: any = {}
        loading: boolean = false
        installWay: string = 'Linux'
        commandList: any[] = []
        title: string = '手动安装'
        controllerType: string = ''
        show(row) {
            this.isShow = true
            this.detail = row
            if (row.operationType === 'controller') {
                const { title, commandList, controllerType } = row
                this.title = title
                this.commandList = commandList.map(r => ({
                    ...r,
                    content: r.content.replace(/\${host}/g, window.HOST + window.APP_CODE)
                }))
                this.controllerType = controllerType
                return false
            }
            this.installWay = this.detail.os_type === 'LINUX' ? 'Linux' : 'Windows'
            this.getManagementCommands()
        }
        downloadFile(url) {
            window.open(url)
        }
        getManagementCommands() {
            this.loading = true
            this.$api.logNode.getInstallStep({
                ip: this.detail.inner_ip,
                bk_cloud_id: this.detail.bk_cloud_id,
                os_type: this.detail.os_type
            }).then(res => {
                const { result, data } = res
                if (!result) {
                    return false
                }
                this.commandList = data
            }).finally(() => {
                this.loading = false
            })
        }
        handleUnloadController() {
            this.isShow = false
            this.$emit('unloadController', { type: 'unload', name: '卸载', is_manual: true })
        }
    }
</script>

<style lang="scss" scoped>
    .content {
        height: calc(100vh - 60px);
        display: flex;
        flex-direction: column;
        padding: 20px;
    }
    .custom-step {
        display: flex;
        position: relative;
        .step-number {
            width: 24px;
            height: 24px;
            text-align: center;
            line-height: 24px;
            border-radius: 50%;
            color: #fff;
            z-index: 1;
            vertical-align: top;
            background-color: #3a84ff;
            border-color: #3a84ff;
            margin-right: 8px;
        }
        .step-content {
            flex: 1;
            width: 0;
            padding-bottom: 24px;
            .step-content-title {
                color: #63656e;
                font-size: 14px;
                height: 22px;
                line-height: 22px;
            }
            .step-result {
                margin-top: 12px;
                padding: 12px;
                border-radius: 2px;
                background: #f5f7fa;
                display: flex;
                .bk-icon {
                    margin-right: 8px;
                    cursor: pointer;
                    display: inline-block;
                }
            }
            .download-text {
                font-size: 14px;
                cursor: pointer;
                color: #3a84ff;
                margin: 15px 0 10px 0;
            }
        }
    }
    .custom-step-space {
        &::after {
            content: "";
            position: absolute;
            left: 12px;
            top: 32px;
            height: calc(100% - 40px);
            width: 1px;
            background-color: #dcdee5;
        }
    }
    .show-result {
        flex: 1;
        height: 0;
        overflow: auto;
        position: relative;
        .text-box {
            width: 100%;
            max-height: none;
            min-height: 22px;
            line-height: 18px;
            font-size: 12px;
            color: #979ba5;
            overflow-x: hidden;
            overflow-y: auto;
            word-break: break-all;
            padding-right: 10px;
        }
    }
</style>
