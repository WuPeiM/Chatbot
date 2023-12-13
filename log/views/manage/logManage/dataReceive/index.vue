<template>
    <div class="log-manage">
        <page-explanation
            title="数据接收"
            content="节点通过接收器接收数据。在此处启动或停止接收器" />
        <div class="receiver-area">
            <bk-select
                :disabled="false"
                v-model="receiverValue"
                style="width: 250px;"
                ext-cls="select-custom"
                placeholder="选择接收器"
                ext-popover-cls="select-popover-custom"
                searchable>
                <bk-option
                    v-for="option in receiverList"
                    :key="option.type"
                    :id="option.type"
                    :name="option.name">
                </bk-option>
            </bk-select>
            <bk-button
                :disabled="!receiverValue"
                theme="success"
                type="submit"
                class="mr10 ml10"
                @click="operateReceiver(receiverMap[receiverValue], 'add')">
                启动新的接收器
            </bk-button>
            <bk-button
                theme="primary"
                class="mr10"
                @click="importLogFile">
                本地上传日志文件
            </bk-button>
        </div>
        <div class="show-area">
            <div class="filter-box">
                <bk-input
                    placeholder="按标题过滤"
                    style="width: 180px;"
                    :clearable="true"
                    v-model="filterVal"
                    :show-clear-only-hover="true"
                    @clear="filterReceiverList('filter')"
                    @enter="filterReceiverList('filter')">
                </bk-input>
                <bk-button
                    :theme="'primary'"
                    :title="'过滤'"
                    class="mr10 ml10"
                    @click="filterReceiverList()">
                    过滤
                </bk-button>
            </div>
            <div class="receiver-content" v-bkloading="{ isLoading: loading, zIndex: 10 }">
                <div v-for="item in drawReceiverList" :key="item.type">
                    <div class="title">
                        <span>{{item.name}}接收器</span>
                        <span>{{item.type === 'global' ? globalReceiver.length : localReceiver.length}} 个接收器</span>
                    </div>
                    <receiver-detail
                        :class="[index !== (item.type === 'global' ? globalReceiver.length - 1 : localReceiver.length - 1) && 'receiver-line']"
                        v-for="(tex, index) in item.type === 'global' ? globalReceiver : localReceiver"
                        :key="tex.id"
                        :receiver-detail="tex"
                        :node-state-number="nodeStateNumber"
                        ref="receiverDetail"
                        @operate-receiver="operateReceiver"
                        @update-list="getClusterList">
                    </receiver-detail>
                </div>
            </div>
        </div>
        <receiver-form
            :node-list="nodeList"
            :receiver-list="receiverList"
            ref="receiverForm"
            @update-list="getClusterList">
        </receiver-form>
        <importLogFile ref="importLogFile" />
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    import ReceiverForm from './component/receiverForm.vue'
    import ReceiverDetail from './component/receiverDetail.vue'
    import PageExplanation from '@/components/pageExplanation.vue'
    import ImportLogFile from './component/importLogFile.vue'
    @Component({
        components: {
            ReceiverForm,
            ReceiverDetail,
            PageExplanation,
            ImportLogFile
        }
    })
    export default class LogManage extends Vue {
        receiverValue: string | number = ''
        receiverList: any[] = []
        receiverMap: any = {}
        filterVal: string = ''
        globalReceiver: any[] = []
        localReceiver: any[] = []
        allReceiver: any[] = []
        drawReceiverList = [
            {
                name: '全局',
                type: 'global'
            },
            {
                name: '本地',
                type: 'local'
            }
        ]
        nodeList: any[] = []
        nodeStateNumber: number = 0
        metricsList: Array<string> = [
            'incomingMessages',
            'emptyMessages',
            'open_connections',
            'total_connections',
            'written_bytes_1sec',
            'written_bytes_total',
            'read_bytes_1sec',
            'read_bytes_total'
        ]
        loading: boolean = false
        clusterMetricsTimer: any = null
        clusterStatesTimer: any = null
        mounted() {
            this.getAllTypes()
            this.getClusterNodes()
        }
        beforeDestroy() {
            clearTimeout(this.clusterMetricsTimer)
            clearTimeout(this.clusterStatesTimer)
        }
        importLogFile() {
            const importLogFile: any = this.$refs.importLogFile
            importLogFile.show()
        }
        filterReceiverList() {
            if (this.filterVal.trim().length) {
                this.globalReceiver = this.globalReceiver.filter(item => item.title.indexOf(this.filterVal) !== -1)
                this.localReceiver = this.localReceiver.filter(item => item.title.indexOf(this.filterVal) !== -1)
            } else {
                this.resetReceiver()
            }
        }
        resetReceiver() {
            this.globalReceiver = this.allReceiver.filter(item => item.global)
            this.localReceiver = this.allReceiver.filter(item => !item.global)
        }
        getClusterNodes() {
            this.$api.logManage.getClusterNodes().then(res => {
                if (!res.result) {
                    return false
                }
                this.nodeList = res.data.nodes.map(item => {
                    item.name = `${item.short_node_id} / ${item.hostname}`
                    return item
                })
                this.getClusterList()
            })
        }
        getClusterList() {
            this.loading = true
            this.receiverValue = ''
            this.$api.logManage.getClusterList().then(async res => {
                if (!res.result) {
                    return false
                }
                this.nodeStateNumber = Object.keys(res.data).length
                this.allReceiver = res.data['inputs']
                this.getClusterStates()
            }).finally(() => {
                this.loading = false
            })
        }
        getAllClusterMetrics() {
            const metrics = []
            this.allReceiver.forEach(item => {
                this.metricsList.forEach(tex => {
                    metrics.push(`${item.type}.${item.id}.${tex}`)
                })
            })
            this.$api.logManage.getAllClusterMetrics(
                {
                    metrics
                }
            ).then(res => {
                if (!res.result) {
                    return false
                }
                this.handleMetricsData(this.globalReceiver, res.data)
                this.handleMetricsData(this.localReceiver, res.data)
            })
        }
        handleMetricsData(list, metrics) {
            list.forEach(item => {
                this.$set(item, 'metrics', [])
                this.$set(item, 'allMetric', {})
                for (const k in metrics) {
                    const target = this.nodeList.find(nev => nev.node_id === k)
                    const node: any = {
                        nodeKey: target?.name,
                        isMaster: target?.is_master,
                        metricsDetail: {}
                    }
                    metrics[k].metrics.forEach(tex => {
                        if (tex.full_name.indexOf(item.id) !== -1) {
                            if (tex.name === 'incomingMessages') {
                                node.metricsDetail.oneMinuteMsg = Math.ceil(tex.metric.rate.one_minute)
                                this.computedMsgTotal(item.allMetric, 'oneMinuteMsg', node.metricsDetail.oneMinuteMsg)
                            } else {
                                if (tex.name === 'emptyMessages') {
                                    node.metricsDetail[tex.name] = Math.ceil(tex.metric.count)
                                } else {
                                    node.metricsDetail[tex.name] = Math.ceil(tex.metric.value)
                                }
                                this.computedMsgTotal(item.allMetric, tex.name, node.metricsDetail[tex.name])
                            }
                        }
                    })
                    item.metrics.push(node)
                }
                for (const k in item.allMetric) {
                    if (!['oneMinuteMsg', 'emptyMessages'].includes(k)) {
                        item.allMetric[k] = this.formatBytes(item.allMetric[k])
                    }
                }
                item.metrics.forEach(tex => {
                    for (const k in tex.metricsDetail) {
                        if (!['oneMinuteMsg', 'emptyMessages'].includes(k)) {
                            tex.metricsDetail[k] = this.formatBytes(tex.metricsDetail[k])
                        }
                    }
                })
            })
        }
        formatBytes(bytes) {
            if (bytes >= 1099511627776) {
                return (bytes / 1099511627776).toFixed(1) + ' GiB'
            } else if (bytes >= 1048576) {
                if ((bytes / 1048576) > 1024) {
                    return (bytes / 1048576 / 1024).toFixed(1) + ' MiB'
                } else {
                    return (bytes / 1048576).toFixed(1) + ' MiB'
                }
            } else if (bytes >= 1024) {
                return (bytes / 1024).toFixed(1) + ' KiB'
            } else {
                return bytes.toFixed(1) + ' B'
            }
        }
        computedMsgTotal(obj, key, value) {
            if (Object.keys(obj).includes(key)) {
                obj[key] += value
            } else {
                obj[key] = value
            }
        }
        getClusterStates(notNeedReset?) {
            this.$api.logManage.getClusterStates().then(res => {
                if (!res.result) {
                    return false
                }
                if (!notNeedReset) {
                    this.handleClusterStates(this.allReceiver, res.data)
                    this.resetReceiver()
                } else {
                    this.handleClusterStates(this.globalReceiver, res.data, true)
                    this.handleClusterStates(this.localReceiver, res.data, true)
                }
                if (this.clusterStatesTimer) {
                    clearTimeout(this.clusterStatesTimer)
                }
                this.clusterStatesTimer = setTimeout(() => {
                    this.getClusterStates(true)
                }, 2000)
                if (this.clusterMetricsTimer) {
                    clearTimeout(this.clusterMetricsTimer)
                }
                this.clusterMetricsTimer = setTimeout(() => {
                    this.getAllClusterMetrics()
                }, 2000)
            })
        }
        handleClusterStates(list, states, notNeedReset?) {
            list.forEach(item => {
                this.$set(item, 'stateMap', {})
                if (!notNeedReset) {
                    this.$set(item, 'metrics', [])
                    this.$set(item, 'allMetric', {})
                }
                for (const k in states) {
                    states[k].forEach(tex => {
                        if (tex.message_input.title === item.title) {
                            const target = this.nodeList.find(nev => nev.node_id === k)
                            tex.nodeKey = target?.name
                            tex.isMaster = target?.is_master
                            if (item.stateMap[tex.state]) {
                                item.stateMap[tex.state].push(tex)
                            } else {
                                item.stateMap[tex.state] = [tex]
                            }
                        }
                    })
                }
            })
        }
        getAllTypes() {
            this.$api.logManage.getAllTypes().then(res => {
                if (!res.result) {
                    return false
                }
                for (const k in res.data) {
                    this.receiverList.push(res.data[k])
                }
                this.receiverMap = res.data
            })
        }
        operateReceiver(data, type) {
            const receiverForm: any = this.$refs.receiverForm
            receiverForm.show(data, type)
        }
    }
</script>

<style lang="scss" scoped>
    .log-manage {
        height: 100%;
        overflow-y: auto;
        .receiver-line {
            border-bottom: 1px solid #7894ce;
            padding-bottom: 20px;
        }
        .receiver-area,
        .show-area {
            background-color: #fff;
            margin-bottom: 10px;
            border-radius: 4px;
            padding: 15px;
        }
        .receiver-area {
            display: flex;
        }
        .show-area {
            .receiver-content {
                margin-top: 20px;
                .title {
                    margin-bottom: 20px;
                    span:nth-child(1) {
                        font-size: 22px;
                    }
                    span:nth-child(2) {
                        font-size: 14px;
                        color: #838383;
                        margin-left: 15px;
                    }
                }
            }
        }
    }
</style>
