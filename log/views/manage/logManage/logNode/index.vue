<template>
    <div :class="['log-node-wrapper', (!isAllType && 'log-node-slider'), (activePanel === 'manualDetail' && 'manual-install-container')]">
        <template v-if="activePanel === 'allList'">
            <page-explanation
                v-if="isAllType"
                title="日志节点"
                content="您可以在Agent节点主机安装日志组件成为日志节点，并对日志节点进行管理，例如启动/停止探针、修改配置文件等">
            </page-explanation>
            <div class="log-node-operation mt10">
                <div v-if="isAllType">
                    <bk-button
                        class="mr10"
                        theme="primary"
                        v-permission="permission"
                        @click="addHost">
                        添加主机
                    </bk-button>
                    <bk-dropdown-menu ref="dropdown" class="mr10">
                        <bk-button
                            theme="default"
                            slot="dropdown-trigger"
                            icon-right="icon-angle-down">
                            控制器操作
                        </bk-button>
                        <ul class="bk-dropdown-list" slot="dropdown-content">
                            <li>
                                <span
                                    v-permission="permission"
                                    :key="item.type"
                                    v-for="item in sidecarActions"
                                    @click="handleControler(item)">
                                    {{ item.name }}控制器
                                </span>
                            </li>
                        </ul>
                    </bk-dropdown-menu>
                    <bk-dropdown-menu ref="dropdown" class="mr10">
                        <bk-button
                            theme="default"
                            slot="dropdown-trigger"
                            icon-right="icon-angle-down">
                            探针操作
                        </bk-button>
                        <ul class="bk-dropdown-list" slot="dropdown-content">
                            <li>
                                <span
                                    v-permission="permission"
                                    @click="installProbe('install')">
                                    安装探针
                                </span>
                            </li>
                            <li>
                                <span
                                    v-permission="permission"
                                    @click="updateProbe('start')">
                                    启动探针
                                </span>
                            </li>
                            <li>
                                <span
                                    v-permission="permission"
                                    @click="updateProbe('config')">
                                    修改配置
                                </span>
                            </li>
                            <li>
                                <span
                                    v-permission="permission"
                                    @click="batchProbe('restart')">
                                    重启探针
                                </span>
                            </li>
                            <li>
                                <span
                                    v-permission="permission"
                                    @click="batchProbe('stop')">
                                    停止探针
                                </span>
                            </li>
                            <li>
                                <span
                                    v-permission="permission"
                                    @click="batchProbe('unload')">
                                    卸载探针
                                </span>
                            </li>
                        </ul>
                    </bk-dropdown-menu>
                </div>
                <select-input
                    class="search-select"
                    :data="searchData"
                    @search="handleSearch"
                    @change="handleSearch" />
            </div>
            <div class="log-node-container" v-bkloading="{ isLoading: loading, zIndex: 10 }">
                <node-table
                    class="mt10"
                    ref="nodeTable"
                    :data="data"
                    :columns="columns"
                    :pagination="pagination"
                    @select="handleSelectData"
                    @select-all="handleSelectData"
                    @filter-change="handleFilterChange"
                    @page-change="handlePageChange"
                    @page-limit-change="handleLimitChange">
                    <template slot="type" slot-scope="{ row }">
                        {{ coversionType[row.os_type] || '--' }}
                    </template>
                    <template slot="ip" slot-scope="{ row }">
                        <bk-button text theme="primary" @click="handleClickRow(row)">
                            {{ row.inner_ip || '--' }}
                        </bk-button>
                    </template>
                    <template slot="status" slot-scope="{ row }">
                        <div class="col-status">
                            <span :style="getStyle(row.status, 'agent')" />
                            {{ row.status_display || '--' }}
                        </div>
                    </template>
                    <template slot="sidecar" slot-scope="{ row }">
                        <div class="col-status">
                            <span :style="getStyle(row.sidecar_status, 'sidecar')" />
                            {{ sidecarStatus[row.sidecar_status] || '--' }}
                        </div>
                    </template>
                    <template slot="probe" slot-scope="{ row, colKey }">
                        <div
                            class="col-status probe-status"
                            :class="{ 'disable-contains': getProbeConfig(row, colKey).text === '未安装' }">
                            <span
                                v-bk-tooltips="{ content: showMessageTip(row, colKey), width: 250 }"
                                :disabled="!showMessageTip(row, colKey)">
                                <span class="flag" :style="getProbeStyle(row, colKey)" />
                            </span>
                            <div
                                :class="{
                                    'link-txt': getProbeConfig(row, colKey).link
                                }"
                                @click="toCheckConfig(row, colKey)">
                                <text-ellipsis
                                    :is-link="getProbeConfig(row, colKey).link"
                                    :value="getProbeConfig(row, colKey).text" />
                            </div>
                        </div>
                    </template>
                    <template slot="install_type" slot-scope="{ row }">
                        {{ row.is_manual ? '手动安装' : '自动安装' }}
                    </template>
                    <template slot="operation" slot-scope="{ row }">
                        <bk-button
                            v-permission="permission"
                            text
                            theme="primary"
                            :disabled="applyDisabledStatus(row)"
                            @click="handleApply(row)">
                            应用
                        </bk-button>
                    </template>
                </node-table>
            </div>
        </template>
        <add-host-slider
            ref="addHostSlider"
            @add-confirm="handleAddConfirm" />
        <probe-operation
            ref="probeOperation"
            :selected-list="selectedHostList"
            :probe-list="probeList"
            @success="getNodeList" />
        <detail-info
            ref="detailInfo"
            :current-node="currentNode" />
        <manual-install-node
            v-if="activePanel === 'manualDetail'"
            ref="manualInstallNode"
            @setCurrentMode="handleSetCurrtenMode" />
        <hand-movement
            ref="handMovement"
            @unloadController="handleUnloadController" />
    </div>
</template>

<script lang="ts">
    import throttle from 'lodash/throttle'
    import { Vue, Component, Prop } from 'vue-property-decorator'
    import PageExplanation from '@/components/pageExplanation.vue'
    import SelectInput from './components/selectInput/index.vue'
    import NodeTable from '@/components/comTable.vue'
    import AddHostSlider from './components/addHostSlider.vue'
    import ProbeOperation from './components/probeOperation.vue'
    import DetailInfo from './components/instanceInfo.vue'
    import { SearchKeys, Pagination, Probe } from '@log/types/index'
    import TextEllipsis from './components/textEllipsis.vue'
    import ManualInstallNode from './components/manualInstallNode.vue'
    import handMovement from './components/handMovement.vue'
    import {
        AGENT_STATUS,
        AGENT_STATUS_COLORS,
        NODE_COLUMNS,
        SIDECAR_CAR_COLORS,
        PROBE_STATUS_COLORS,
        SIDECAR_ACTIONS,
        PROBE_STATUS,
        SICECAR_STATUS,
        NODE_SEARCH_DATA,
        CONTRILLER_COMMAND_LIST
    } from './field'

    @Component({
        name: 'log-node',
        components: {
            TextEllipsis,
            ProbeOperation,
            AddHostSlider,
            PageExplanation,
            SelectInput,
            NodeTable,
            DetailInfo,
            ManualInstallNode,
            handMovement
        }
    })
    export default class LogNode extends Vue {
        // all: 日志节点\useNode: 已使用节点\apply: 应用
        @Prop({ type: String, default: 'all' }) type: string
        // 从配置列表查看应用和已用节点的日志节点列表的参数
        @Prop({ type: Object, default: () => ({}) }) configuration: any
        searchData: SearchKeys[] = NODE_SEARCH_DATA
        pagination: Pagination = {
            current: 1,
            count: 1,
            limit: 20
        }
        coversionType = {
            LINUX: 'Linux',
            WINDOWS: 'Windows'
        }
        sidecarActions = SIDECAR_ACTIONS
        sidecarStatus = SICECAR_STATUS
        columns = JSON.parse(JSON.stringify(NODE_COLUMNS))
        data: any[] = []
        loading: boolean = false
        statusMap = AGENT_STATUS
        probeList: Probe[] = []
        searchParams: any = []
        filterParams: any = []
        selectedHostList = []
        currentNode = {}
        timer: any = null
        activePanel: string = 'allList'

        get permission() {
            return {
                id: this.$route.name,
                type: 'operateAuth'
            }
        }

        get selectedHostIds() {
            return this.selectedHostList.map(r => r.bk_host_id)
        }

        get isAllType() {
            return this.type === 'all'
        }

         created() {
            this.getBusiness()
            this.getProbeList()
        }

        mounted() {
            if (this.isAllType) {
                this.timer = setInterval(() => {
                    this.getNodeList(false, 'timer')
                }, 30000)
            }
        }

        async getBusiness() {
            try {
                this.loading = true
                const res = await this.$api.Server.getBizs()
                if (res.result) {
                    const data = res.data.map(row => ({
                        id: row.bk_biz_id,
                        name: row.bk_biz_name
                    }))
                    const current = this.searchData.find(({ id }) => id === 'bk_biz_id')
                    current['children'] = data
                }
            } finally {
                this.loading = false
            }
        }

        async getProbeList() {
            this.loading = true
            try {
                const res = await this.$api.logNode.getProbeList()
                const { data, result, message } = res
                if (!result) {
                    this.$error(message)
                    return false
                }
                this.probeList = data
                // 根据name值处理探针类型数组,将探针类型添加到表头展示
                this.handleColumnByProbe()
            } finally {
                await this.getNodeList(false)
            }
        }

        probeReduction() {
            return this.probeList.reduce((result, current) => {
                if (!result[current.name]) {
                    result[current.name] = true
                    result.push(current)
                }
                return result
            }, [])
        }

        handleColumnByProbe() {
            const name = this.configuration?.collector_name
            const commonColumnProps = {
                align: 'left',
                noNeedTip: true,
                minWidth: '80px',
                scopedSlots: 'probe'
            }
            if (name) {
                this.columns.push({
                    label: name,
                    key: name,
                    ...commonColumnProps
                })
            } else {
                this.probeReduction().forEach(item => {
                    this.columns.push({
                        label: item.name,
                        key: item.name,
                        ...commonColumnProps
                    })
                })
            }
            if (this.type === 'apply') {
                this.columns.push({
                    label: '操作',
                    key: 'operation',
                    fixed: 'right',
                    align: 'left',
                    width: '80px',
                    scopedSlots: 'operation'
                })
            }
            if (!this.isAllType) {
                this.columns.shift()
            }
            this.$nextTick(_ => {
                this.$refs.nodeTable?.updateColumns(this.columns)
            })
        }

        async getNodeList(status = true, type = 'init', extParams = {}) {
            if (status) {
                this.loading = status
            }
            let params = {
                page: this.pagination.current,
                page_size: this.pagination.limit,
                conditions: this.filterParams.concat(this.searchParams)
            }

            if (!this.isAllType) {
                params['nodes'] = this.configuration?.use_nodes?.nodes
                params = { ...params, ...extParams }
            }

            const urlMap: any = {
                all: 'getNodeList',
                useNode: 'getUseNode',
                apply: 'getNoUsedNodes'
            }
            try {
                const res = await this.$api.logNode[urlMap[this.type]](params)
                const { data, result, message } = res
                if (!result) {
                    this.$error(message)
                    return false
                }
                this.pagination.count = data.total
                this.data = data.list
                if (type === 'timer') {
                    this.$nextTick(() => {
                        this.data.forEach((item) => {
                            if (this.selectedHostIds.includes(item.bk_host_id)) {
                                this.selectedHostList = this.selectedHostList.map(row => {
                                    if (row.bk_host_id === item.bk_host_id) {
                                        return item
                                    }
                                    return row
                                })
                                this.$refs.nodeTable?.toggleRowSelection(item, true)
                            }
                        })
                    })
                } else {
                    this.selectedHostList = []
                }
            } finally {
                this.loading = false
            }
        }

        handleAddConfirm(type, selected) {
            if (type === 'auto') {
                this.pagination.current = 1
                this.getNodeList()
            } else {
                this.activePanel = 'manualDetail'
                this.$nextTick(() => {
                    const manualInstallNode: any = this.$refs.manualInstallNode
                    manualInstallNode?.show(selected)
                })
            }
        }

        handleSetCurrtenMode() {
            this.activePanel = 'allList'
            this.pagination.current = 1
            this.getNodeList()
        }

        handlePageChange(page) {
            this.pagination.current = page
            this.getNodeList()
        }

        handleLimitChange(size) {
            this.pagination.current = 1
            this.pagination.limit = size
            this.getNodeList()
        }

        addHost() {
            if (!this.$BtnPermission(this.permission)) {
                return false
            }
            this.$refs.addHostSlider?.showSlider()
        }

        handleSearch(params) {
            this.pagination.current = 1
            this.searchParams = params.map(item => ({
                key: item.id,
                value: Array.isArray(item.value) ? item.value : [item.value]
            }))
            this.getNodeList()
        }

        getStyle(value, type) {
            const colors = {
                agent: AGENT_STATUS_COLORS,
                sidecar: SIDECAR_CAR_COLORS
            }
            return { background: colors[type][value] }
        }

        showMessageTip(row, key) {
            const current = (row?.probes || []).find(r => r.probe_type === key)
            if (!current || !row?.node_details || !row.node_details?.status) return ''
            const status = row.node_details?.status?.collectors.find(item => item.collector_id === current.probe_id)
            if (status) return status.message
            return ''
        }

        getProbeStyle(row, key) {
            const current = (row?.probes || []).find(r => r.probe_type === key)
            if (!current) {
                return { background: '#b2b5bd' }
            }
            return { background: PROBE_STATUS_COLORS[current.probe_status] }
        }

        // 匹配对应的探针,如果探针配置存在,则需要有跳转的状态link为true
        getProbeConfig(row, key) {
            const current = (row?.probes || []).find(r => r.probe_type === key)
            if (!current || current.probe_status === '1') {
                return { text: '未安装', link: false }
            }
            if (current.probe_config && !['1', '2', '3'].includes(current.probe_status)) {
                return { text: current.probe_config, link: true }
            }
            return { text: PROBE_STATUS[current.probe_status], link: false }
        }

        toCheckConfig(row, key) {
            if (!this.getProbeConfig(row, key)?.link) {
                return false
            }
            const current = (row?.probes || []).find(r => r.probe_type === key)
            this.$router.push({
                name: 'CollectionConfig',
                params: {
                    id: current.config_id
                }
            })
        }

        handleClickRow(row) {
            this.currentNode = {
                name: row.inner_ip,
                bkBizId: row.bk_biz_id,
                bkCloudId: row.bk_cloud_id
            }
            this.$nextTick(() => {
                this.$refs.detailInfo?.show()
            })
        }

        async handleControler(row) {
            throttle(function() {
                if (!this.$BtnPermission(this.permission)) {
                    return false
                }
                if (!this.selectedHostIds.length) {
                    this.$warn('请先选择操作的主机')
                    return false
                }
                const { type, name } = row
                if (type !== 'start' && this.isDiffInstallType()) {
                    this.$warn('请确保所选日志节点的安装方式相同')
                    return false
                }
                // 手动安装的服务器，不支持启动控制器
                if (this.selectedHostList.some(r => r.is_manual) && type === 'start') {
                    this.$warn('手动安装的服务器，不支持启动控制器')
                    return false
                }
                if (type !== 'start' && this.selectedHostList[0]?.is_manual) {
                    const params = {
                        operationType: 'controller',
                        controllerType: type,
                        title: `${name}控制器`,
                        commandList: CONTRILLER_COMMAND_LIST[type]
                    }
                    const handMovement: any = this.$refs.handMovement
                    handMovement.show(params)
                    return false
                }
                this.$bkInfo({
                    title: `是否确认${name}控制器?`,
                    confirmLoading: true,
                    confirmFn: async() => {
                        await this.handleSidecarAction(row)
                    }
                })
            }, 1000).call(this)
        }

        async handleUnloadController(row) {
            const res = await this.$api.logNode.searchSidecar({
                nodes: this.selectedHostList.map(row => row.inner_ip + '-' + row.bk_cloud_id)
            })
            const { result, data } = res
            if (!result) {
                return false
            }
            const selectList = this.selectedHostList.filter(row => {
                const key = row.inner_ip + '-' + row.bk_cloud_id
                return !data[key]?.active
            })
            await this.handleSidecarAction(row, selectList)
        }

        async handleSidecarAction(row, list = this.selectedHostList) {
            if (!list.length) {
                return false
            }
            const res = await this.$api.logNode.sidecarAction({
                action: row.type,
                is_manual: row?.is_manual,
                hosts: list.map(r => ({
                    ip: r.inner_ip,
                    bk_cloud_id: r.bk_cloud_id,
                    os_type: r.os_type,
                    id: r.id
                }))
            })
            const { result, message } = res
            if (!result) {
                this.$error(message)
                return false
            }
            this.$success(`${row.name}控制器中`)
            await this.getNodeList()
        }

        handleSelectData(selection) {
            this.selectedHostList = selection
        }

        handleFilterChange(key) {
            this.pagination.current = 1
            for (const i in key) {
                this.filterParams = this.filterParams.filter(item => item.key !== i)
                if (key[i]?.length) {
                    this.filterParams.push({
                        key: i,
                        value: key[i]
                    })
                }
            }
            this.getNodeList()
        }

        filterProbeByStatus(_status) {
            const osTypeMap = {
                WINDOWS: 'windows',
                LINUX: 'linux'
            }
           return this.probeList.filter(row => row.os_type === osTypeMap[this.selectedHostList[0].os_type]).filter(item => {
                return this.selectedHostList.every(row => {
                    const current = (row?.probes || []).find(i => i.probe_type === item.name)
                    return current && _status.includes(current.probe_status)
                })
            })
        }

        isDiffType() {
            return this.selectedHostList.some(row => row.os_type !== this.selectedHostList[0].os_type)
        }

        isDiffInstallType() {
            return this.selectedHostList.some(row => row.is_manual !== this.selectedHostList[0].is_manual)
        }

        // 安装探针
        installProbe(type) {
            if (!this.$BtnPermission(this.permission)) {
                return false
            }
            if (!this.selectedHostIds.length) {
                this.$warn('请先选择操作的主机')
                return false
            }
            const isNormal = this.selectedHostList.every(item => item.sidecar_status === '3')
            if (!isNormal) {
                this.$warn('请确保所选日志节点的控制器状态正常')
                return false
            }
            // 判断所选主机的列表是否都是相同的操作系统
            if (this.isDiffType()) {
                this.$warn('请确保所选日志节点的操作系统相同')
                return false
            }
            const osTypeMap = {
                WINDOWS: 'windows',
                LINUX: 'linux'
            }
            const list = this.probeList.filter(row => row.os_type === osTypeMap[this.selectedHostList[0].os_type]).filter(item => {
                return this.selectedHostList.every(row => {
                    const current = (row?.probes || []).find(i => i.probe_type === item.name)
                    return !current || ['1', '3'].includes(current?.probe_status)
                })
            })
            // 过滤出所选节点都没有安装的探针
            this.$refs.probeOperation.show(list, type)
        }

        // 启动探针和修改配置
        updateProbe(type) {
            if (!this.$BtnPermission(this.permission)) {
                return false
            }
            if (!this.selectedHostIds.length) {
                this.$warn('请先选择操作的主机')
                return false
            }
            // 判断所选主机的列表是否都是相同的操作系统
            if (this.isDiffType()) {
                this.$warn('请确保所选日志节点的操作系统相同')
                return false
            }
            // 找到所选日志节点里,都是未启动状态的探针类型
            // 同时还需要判断所有探针列表里面是否有顾虑出的探针类型的相同操作系统
            const list = this.filterProbeByStatus(['4', '5', '6', '7'])
            this.$refs.probeOperation.show(list, type)
        }

        // 重启\停止\卸载探针
        batchProbe(type) {
            if (!this.$BtnPermission(this.permission)) {
                return false
            }
            if (!this.selectedHostIds.length) {
                this.$warn('请先选择操作的主机')
                return false
            }
            // 判断所选主机的列表是否都是相同的操作系统
            if (this.isDiffType()) {
                this.$warn('请确保所选日志节点的操作系统相同')
                return false
            }
            // 手动安装的服务器，不支持卸载探针
            if (this.selectedHostList.some(r => r.is_manual) && type === 'unload') {
                this.$warn('手动安装的服务器，不支持卸载探针')
                return false
            }
            // 筛选出所选日志节点都安装过的探针类型
            const list = this.filterProbeByStatus(['4', '5', '6', '7', '8', '9'])
            this.$refs.probeOperation.show(list, type)
        }

        applyDisabledStatus(row) {
            const name = this.configuration?.collector_name
            const probeStatus = row.probes.find(row => row.probe_type === name)
            return !probeStatus || probeStatus?.probe_status === '1'
        }

        async handleApply(row) {
            if (!this.$BtnPermission(this.permission)) {
                return false
            }
            const res = await this.$api.logNode.associativeConfiguration({
                collector_id: this.configuration.collector_id,
                id: this.configuration.id,
                node_names: [`${row.inner_ip}-${row.bk_cloud_id}`]
            })
            const { message, result } = res
            if (!result) {
                this.$error(message)
                return false
            }
            this.$success('应用成功')
            const params = {
                node: this.configuration?.use_nodes?.nodes.push({
                    node_id: row.node_id,
                    node_name: row.node_name
                })
            }
            await this.getNodeList(true, 'init', params)
            this.$emit('apply-success')
        }

        destroyed() {
            if (this.timer) clearInterval(this.timer)
        }
    }
</script>

<style scoped lang="scss">
.log-node-wrapper {
    .log-node-operation {
        display: flex;
        .bk-button {
            font-size: 12px;
        }
        /deep/ .bk-dropdown-menu {
            li {
                span {
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
            }
        }
        .search-select {
            flex: 1;
            /deep/.bk-compose-form-item {
                width: 100%;
                .search-select-wrap {
                    width: calc(100% - 120px) !important;
                }
            }
        }
    }
    /deep/ .bk-table-body-wrapper {
        max-height: calc(100vh - 345px) !important;
        overflow-y: auto;
    }
    .col-status {
        display: flex;
        align-items: center;
        /deep/.bk-button-text {
            line-height: 22px;
        }
        >span, .flag {
            display: inline-block;
            margin-right: 5px;
            width: 8px;
            height: 8px;
            border-radius: 6.5px;
            vertical-align: top;
        }
    }
    .probe-status {
        >div {
            flex: 1;
        }
        .link-txt {
            cursor: pointer;
            color: #3a84ff;
            width: calc(100% - 13px);
        }
    }
    .disable-contains {
        .flag {
            background: #cecece !important;
        }
        >div {
            color: #cecece;
        }
    }
    &.log-node-slider {
        /deep/ .bk-table-body-wrapper {
            max-height: calc(100vh - 270px) !important;
            overflow-y: auto;
        }
    }
    &.manual-install-container {
        padding: 20px;
        width: 100%;
        height: calc(100vh - 100px);
        background: #fff;
    }
}
</style>
