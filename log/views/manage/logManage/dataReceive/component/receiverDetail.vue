<template>
    <div class="receiver-detail">
        <div class="header-box">
            <div class="title-info">
                <div>
                    <span class="title">{{receiverDetail.title}}</span>
                    <span class="name">{{receiverDetail.name}}</span>
                </div>
                <div
                    class="state-tag"
                    :style="getStateColor()"
                    v-bk-tooltips="nodeTagConfig"
                    ref="tooltipsHtml">
                    <span v-if="JSON.stringify(receiverDetail.stateMap) === '{}'">
                        0 RUNNING
                    </span>
                    <span v-else>
                        {{showText}}
                    </span>
                </div>
                <div id="node-state-detail" class="node-state-detail">
                    <div class="title-box">
                        {{receiverDetail.title}}的状态
                    </div>
                    <div class="node-box">
                        <div
                            v-for="(item, key) in receiverDetail.stateMap"
                            :key="key">
                            <div
                                class="hide-text node"
                                v-for="(tex, k) in item"
                                v-bk-overflow-tips
                                :key="k">
                                <bk-icon
                                    :type="tex.isMaster ? 'star-shape' : 'sitemap'" :style="{ color: tex.isMaster ? '#ffd200' : '#702785' }"
                                    :title="tex.isMaster ? '这是集群中的主节点' : ''" />
                                <a>{{`${tex.nodeKey}:`}}</a>
                                <span>{{tex.state}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="action-bar">
                <bk-button
                    :theme="'primary'"
                    :title="'显示收到的消息'"
                    class="mr10"
                    @click="goLog">
                    显示收到的消息
                </bk-button>
                <bk-button
                    :theme="'primary'"
                    :title="'管理提取器'"
                    class="mr10"
                    @click="manageExtractor">
                    管理提取器
                </bk-button>
                <bk-button
                    :theme="isStartMode ? 'warning' : 'success'"
                    :title="'启动接收'"
                    class="mr10"
                    :loading="receiveLoading"
                    @click="setReceiveMode">
                    {{`${isStartMode ? '停止' : '启动'}接收`}}
                </bk-button>
                <bk-dropdown-menu
                    ref="dropdown"
                    class="mr15">
                    <bk-button
                        slot="dropdown-trigger"
                        icon-right="icon-angle-down">
                        更多操作
                    </bk-button>
                    <ul class="bk-dropdown-list" slot="dropdown-content">
                        <li @click="editReceiver">
                            <span>
                                编辑输入
                            </span>
                        </li>
                        <li @click="addStaticField">
                            <span>
                                添加静态字段
                            </span>
                        </li>
                        <li @click="deleteReceiver">
                            <span>
                                删除输入
                            </span>
                        </li>
                    </ul>
                </bk-dropdown-menu>
            </div>
        </div>
        <div class="main-box">
            <div class="left-content">
                <div v-if="!receiverDetail.global" class="mb15">
                    <div
                        v-for="(item, key) in receiverDetail.stateMap"
                        :key="key">
                        <div
                            class="hide-text node"
                            v-for="(tex, k) in item"
                            v-bk-overflow-tips
                            :key="k">
                            <span>节点</span>
                            <bk-icon
                                :type="tex.isMaster ? 'star-shape' : 'sitemap'" :style="{ color: tex.isMaster ? '#ffd200' : '#702785' }"
                                :title="tex.isMaster ? '这是集群中的主节点' : ''" />
                            <a>{{tex.nodeKey}}</a>
                        </div>
                    </div>
                </div>
                <ul>
                    <li v-for="(value, key) in receiverDetail.attributes" :key="key">
                        <div class="key">{{`${key} :`}}</div>
                        <div class="value hide-text" v-bk-overflow-tips>
                            <span :style="{ fontStyle: ['', null].includes(value) ? 'italic' : 'normal' }">{{getShowValue(value)}}</span>
                        </div>
                    </li>
                </ul>
                <div class="static-fields" v-if="Object.keys(receiverDetail.static_fields).length">静态字段</div>
                <div
                    class="fields-list"
                    v-for="(value, key) in receiverDetail.static_fields"
                    :key="key">
                    <strong>{{key}}:</strong>
                    <span class="ml5">{{value}}</span>
                    <bk-icon
                        class="close-icon"
                        type="close"
                        @click="deleteStaticFields(key)" />
                </div>
            </div>
            <div class="right-content">
                <div style="font-size: 20px;margin-bottom: 5px;">吞吐量 / 指标</div>
                <div v-if="JSON.stringify(receiverDetail.allMetric) !== '{}'">
                    <div class="mb5">
                        <span>1 分钟平均速率:</span>
                        <span>{{receiverDetail.allMetric.oneMinuteMsg}} 消息/秒</span>
                    </div>
                    <div class="mb5">
                        <span>网络IO:</span>
                        <span>
                            <bk-icon type="down-shape" />
                            <span>{{receiverDetail.allMetric.read_bytes_1sec}}</span>
                            <bk-icon type="up-shape" />
                            <span>{{receiverDetail.allMetric.written_bytes_1sec}}</span>
                        </span>
                        <span style="color: #b4b4b4;">
                            <span>(</span>
                            <span>总数:</span>
                            <bk-icon type="down-shape" />
                            <span>{{receiverDetail.allMetric.read_bytes_total}}</span>
                            <bk-icon type="up-shape" />
                            <span>{{receiverDetail.allMetric.written_bytes_total}}</span>
                            <span>)</span>
                        </span>
                    </div>
                    <div class="mb5">
                        <span>丢弃的空消息数:</span>
                        <span>{{receiverDetail.allMetric.emptyMessages}}</span>
                    </div>
                </div>
                <div v-else>
                    该接收器没有性能指标信息
                </div>
                <div
                    v-if="receiverDetail.global && JSON.stringify(receiverDetail.allMetric) !== '{}'"
                    class="show-btn"
                    @click="isShowDetail = !isShowDetail">{{`${!isShowDetail ? '显示' : '隐藏'}详情`}}
                </div>
                <div class="node-detail" v-if="isShowDetail">
                    <div class="hr"></div>
                    <div
                        class="node"
                        v-for="(item, index) in receiverDetail.metrics"
                        :key="index">
                        <div class="node-title">
                            <bk-icon
                                :type="item.isMaster ? 'star-shape' : 'sitemap'" :style="{ color: item.isMaster ? '#ffd200' : '#702785' }"
                                :title="item.isMaster ? '这是集群中的主节点' : ''" />
                            <a>{{`${item.nodeKey}`}}</a>
                        </div>
                        <div v-if="JSON.stringify(item.metricsDetail) !== '{}'">
                            <div class="mb5">
                                <span>网络IO:</span>
                                <span>
                                    <bk-icon type="down-shape" />
                                    <span>{{item.metricsDetail.read_bytes_1sec}}</span>
                                    <bk-icon type="up-shape" />
                                    <span>{{item.metricsDetail.written_bytes_1sec}}</span>
                                </span>
                                <span style="color: #b4b4b4;">
                                    <span>(</span>
                                    <span>总数:</span>
                                    <bk-icon type="down-shape" />
                                    <span>{{item.metricsDetail.read_bytes_total}}</span>
                                    <bk-icon type="up-shape" />
                                    <span>{{item.metricsDetail.written_bytes_total}}</span>
                                    <span>)</span>
                                </span>
                            </div>
                            <div class="mb5">
                                <span>丢弃的空消息数:</span>
                                <span>{{item.metricsDetail.emptyMessages}}</span>
                            </div>
                        </div>
                        <div v-else>
                            该接收器没有性能指标信息
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <add-static-field ref="addStaticField" @update-list="updateList"></add-static-field>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
    import AddStaticField from './addStaticField.vue'
    @Component({
        name: 'receiver-detail',
        components: {
            AddStaticField
        }
    })
    export default class ReceiverDetail extends Vue {
        @Prop({
            type: Object,
            default: () => ({})
        })
        receiverDetail: any
        @Prop({
            type: Number,
            default: () => 0
        })
        nodeStateNumber: number
        showText: string = ''
        nodeTagConfig: any = {
            allowHtml: true,
            width: 280,
            trigger: 'click',
            theme: 'light',
            content: '#node-state-detail',
            placement: 'bottom',
            extCls: 'node-state-tip'
        }
        isShowDetail: boolean = false
        receiveLoading: boolean = false
        @Watch('receiverDetail.stateMap', {
            immediate: true,
            deep: true
        })
        onReceiverDetailStateMapChanged(val) {
            const arr = []
            for (const k in val) {
                arr.push(this.receiverDetail.global ? `${val[k].length} ${k}` : `${k}`)
            }
            this.showText = arr.join(', ')
        }
        get isStartMode() {
            return this.receiverDetail.stateMap ? this.receiverDetail.stateMap['RUNNING'] : false
        }
        getShowValue(value) {
            if (value === '' || value === null) {
                return '<empty>'
            }
            return value
        }
        goLog() {
            this.$router.push({
                name: 'Log',
                query: {
                    searchField: `gl2_source_input:${this.receiverDetail.id}`
                }
            })
        }
        manageExtractor() {
            this.$router.push({
                name: 'Extractor',
                query: {
                    receiverId: this.receiverDetail.id
                }
            })
        }
        setReceiveMode() {
            const url = this.isStartMode ? 'stopReceive' : 'startReceive'
            this.receiveLoading = true
            this.$api.logManage[url]({
                id: this.receiverDetail.id
            }).then(res => {
                if (!res.result) {
                    this.$error(res.message)
                    return false
                }
                this.$success(`${this.isStartMode ? '暂停' : '启动'}数据接收 ${this.receiverDetail.title} 成功`)
            }).finally(() => {
                this.receiveLoading = false
            })
        }
        addStaticField() {
            const addStaticField: any = this.$refs.addStaticField
            addStaticField.show(this.receiverDetail)
        }
        editReceiver() {
            this.$emit('operate-receiver', this.receiverDetail, 'edit')
        }
        deleteStaticFields(key) {
            this.$bkInfo({
                title: `确实要从 ${this.receiverDetail.title} 移除静态字段'${key}' ?`,
                confirmLoading: true,
                confirmFn: async() => {
                    await this.confirmDeleteStaticFields(key)
                }
            })
        }
        async confirmDeleteStaticFields(key) {
            try {
                const res = await this.$api.logManage.deleteStaticFields({
                    id: this.receiverDetail.id,
                    key
                })
                if (!res.result) {
                    this.$error(res.message)
                } else {
                    this.$success(`从 ${this.receiverDetail.title} 删除静态字段'${key}'成功`)
                    this.$emit('update-list')
                }
                return true
            } catch (e) {
                return false
            }
        }
        deleteReceiver() {
            this.$bkInfo({
                title: `确定要删除输入 ${this.receiverDetail.title}?`,
                confirmLoading: true,
                confirmFn: async() => {
                    await this.confirmDeleteReceiver()
                }
            })
        }
        async confirmDeleteReceiver() {
            try {
                const res = await this.$api.logManage.deleteCluster({
                    id: this.receiverDetail.id
                })
                if (!res.result) {
                    this.$error(res.message)
                } else {
                    this.$success(`接收器 ${this.receiverDetail.title} 删除成功`)
                    this.$emit('update-list')
                }
                return true
            } catch (e) {
                return false
            }
        }
        getStateColor() {
            const warningColor = {
                backgroundColor: '#ffd200',
                color: '#392f00'
            }
            const errorColor = {
                backgroundColor: '#ad0707',
                color: '#fff'
            }
            const successColor = {
                backgroundColor: '#00ae42',
                color: '#fff'
            }
            const stateValues = Object.values(this.receiverDetail.stateMap)
            const stateKeys = Object.keys(this.receiverDetail.stateMap)
            if (this.receiverDetail.global) {
                let allNumber = 0
                stateValues.forEach((item: any) => {
                    allNumber += item.length
                })
                if (allNumber < this.nodeStateNumber) {
                    return warningColor
                } else {
                    if (stateKeys.length === 1) {
                        return stateKeys[0] === 'RUNNING' ? successColor : errorColor
                    } else {
                        return warningColor
                    }
                }
            } else {
                if (stateKeys.includes('FAILED')) {
                    return errorColor
                } else if (stateKeys.includes('RUNNING')) {
                    return successColor
                } else {
                    return warningColor
                }
            }
        }
        updateList() {
            this.$emit('update-list')
        }
    }
</script>

<style lang="scss">
    .node-state-tip {
        .tippy-tooltip {
            padding: 0;
            .title-box {
                padding: 7px 14px;
                font-size: 14px;
                color: #2d2d2d;
                border-bottom: 1px solid #F1ECECFF;
            }
            .node-box {
                padding: 7px 14px;
                font-size: 13px;
                .node {
                    margin-bottom: 3px;
                    .bk-icon {
                        position: relative;
                        top: -1px;
                    }
                }
                a {
                    color: #702785;
                    &:hover {
                        text-decoration: underline;
                    }
                }
            }
        }
    }
</style>

<style lang="scss" scoped>
    .receiver-detail {
        margin-bottom: 20px;
        .header-box {
            display: flex;
            justify-content: space-between;
            .title-info {
                display: flex;
                align-items: center;
                .title {
                    font-size: 22px;
                }
                .name {
                    font-size: 14px;
                    color: #838383;
                    margin-left: 10px;
                }
                .state-tag {
                    cursor: pointer;
                    padding: 2px 6px;
                    background-color: #00ae42;
                    color: #fff;
                    margin-left: 15px;
                    border-radius: 3px;
                    position: relative;
                    top: 3px;
                    font-size: 12px;
                }
            }
        }
        .main-box {
            display: flex;
            padding-top: 10px;
            .left-content {
                width: 0;
                flex: 5;
                .node {
                    margin-bottom: 3px;
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    .bk-icon {
                        margin: 0 5px;
                    }
                }
                a {
                    color: #702785;
                    &:hover {
                        text-decoration: underline;
                    }
                }
                ul {
                    background-color: #f3f3f3;
                    border: 1px solid #a6a6a6;
                    color: #575757;
                    border-radius: 4px;
                    padding: 10px;
                    li {
                        margin-bottom: 5px;
                        list-style: none;
                        display: flex;
                        font-size: 14px;
                        .value {
                            flex: 1;
                            margin-left: 8px;
                        }
                    }
                }
                .static-fields {
                    font-size: 20px;
                    margin: 10px 0 3px;
                }
                .fields-list {
                    display: flex;
                    align-items: center;
                }
                .close-icon {
                    font-size: 20px !important;
                    margin-left: 5px;
                    cursor: pointer;
                }
            }
            .right-content {
                flex: 3;
                margin-left: 30px;
                font-size: 14px;
                width: 0;
                .show-btn {
                    color: #702785;
                    cursor: pointer;
                    font-size: 14px;
                    margin-top: 10px;
                    &:hover {
                        text-decoration: underline;
                    }
                }
                .node-detail {
                    .hr {
                        background-color: #e8e8e8;
                        height: 1px;
                        width: 100%;
                        margin: 20px 0;
                    }
                    .node {
                        font-size: 14px;
                        margin-bottom: 15px;
                        .node-title {
                            color: #702785;
                            margin-bottom: 5px;
                            .bk-icon {
                                position: relative;
                                top: -2px;
                            }
                        }
                    }
                }
            }
        }
    }
    /deep/ .bk-dropdown-menu .bk-dropdown-list li span {
        display: block;
        height: 32px;
        line-height: 33px;
        padding: 0 16px;
        color: #63656e;
        font-size: 12px;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;

        &:hover {
            background-color: #e5efff;
            color: #3a84ff;
        }
    }
</style>
