<template>
    <div class="task-detail" v-bkloading="{ isLoading: tableLoading, zIndex: 10 }">
        <div class="title-box">
            <bk-icon
                type="arrows-left-shape"
                class="mr10"
                @click="goBack" />
            <span>手动安装日志节点</span>
        </div>
        <select-input
            class="search-select"
            :data="searchFilterList"
            @search="handleSearchData"
            @change="handleSearchData">
        </select-input>
        <div class="table-header">
            <div class="left-info">
                <span>安装日志节点</span>
                <span>{{`(共 ${dataList.length} 个)`}}</span>
            </div>
        </div>
        <com-table
            ref="comTable"
            :data="resultList"
            :columns="columns"
            :max-height="maxHeight">
            <template slot="type" slot-scope="{ row }">
                {{ typeMap[row.os_type] || '--' }}
            </template>
            <template slot="status" slot-scope="{ row }">
                <span :style="{ color: row.active_status ? '#70d670' : '#3b84ff' }"> {{ row.active_status ? '安装成功' : '安装中' }} </span>
            </template>
            <template slot="operation" style="color: #3A84FF;" slot-scope="{ row }">
                <bk-button
                    class="mr10"
                    theme="primary"
                    text
                    @click="handMovement(row)">
                    查看指引
                </bk-button>
            </template>
        </com-table>
        <hand-movement ref="handMovement"></hand-movement>
    </div>
</template>

<script lang="ts">
    import {Component, Emit, Vue} from 'vue-property-decorator'
    import ComTable from '@/components/comTable.vue'
    import HandMovement from './handMovement.vue'
    import SelectInput from './selectInput/index.vue'
    @Component({
        components: {
            ComTable,
            HandMovement,
            SelectInput
        }
    })
    export default class ManualInstallNode extends Vue {
        columns: {
            label: string,
            key: string,
            align: string,
            minWidth?: string,
            scopedSlots?: string,
            width?: string
        }[] = [
            {
                label: 'IP',
                key: 'inner_ip',
                align: 'left',
                minWidth: '200'
            },
            {
                label: '操作系统类型',
                key: 'os_type',
                align: 'left',
                minWidth: '100px',
                scopedSlots: 'type'
            },
            {
                label: '业务',
                key: 'bk_biz_name',
                align: 'left',
                minWidth: '100'
            },
            {
                label: '执行状态',
                key: 'status',
                align: 'left',
                minWidth: '200',
                scopedSlots: 'status'
            },
            {
                label: '操作',
                key: 'operation',
                align: 'left',
                width: '160px',
                scopedSlots: 'operation'
            }
        ]
        typeMap = {
            'LINUX': 'Linux',
            'WINDOWS': 'Windows'
        }
        tableLoading: boolean = false
        maxHeight: number | string = ''
        searchFilterList: {
            name: string,
            id: string,
            show: boolean,
            children?: Array<any>
        }[] = [
            {
                name: 'IP',
                id: 'inner_ip',
                show: true
            },
            {
                name: '执行状态',
                id: 'active_status',
                children: [
                    {
                        name: '安装中',
                        id: 0
                    },
                    {
                        name: '安装成功',
                        id: 1
                    }
                ],
                show: true
            }
        ]
        searchParams: Array<any> = []
        dataList: Array<any> = []
        timer: any = null
        get resultList() {
            return this.dataList.filter(item => {
                return this.searchParams.every(condition => {
                    const field = condition.id
                    const value = condition.value
                    if (condition.multiable) {
                        return value.includes(item[field])
                    }
                    if (typeof value === 'string' && typeof item[field] === 'string') {
                        return item[field].toLowerCase().includes(value.toLowerCase())
                    }
                    return item[field] === value
                })
            })
        }
        mounted() {
            const PAGE_OCCUPIED_HEIGHT: number = 60
            this.maxHeight = window.innerHeight - PAGE_OCCUPIED_HEIGHT
            window.onresize = () => {
                this.maxHeight = window.innerHeight - PAGE_OCCUPIED_HEIGHT
            }
        }
        beforeDestroy() {
            if (this.timer) {
                clearTimeout(this.timer)
            }
            Object.assign(this.$data, this.$options.data.call(this))
        }
        show(data) {
            this.tableLoading = true
            this.dataList = this.$copy(data)
            const nodes = data.map(row => row.inner_ip + '-' + row.bk_cloud_id)
            this.searchSidecar(nodes)
        }
        async searchSidecar(nodes = []) {
            try {
                const res = await this.$api.logNode.searchSidecar({
                    nodes
                })
                const { result, data } = res
                if (!result) {
                    return false
                }
                this.dataList.forEach(row => {
                    const key = row.inner_ip + '-' + row.bk_cloud_id
                    row['active_status'] = data[key]?.active ? 1 : 0
                })
                const activeList = this.dataList.filter(row => row.active_status)
                this.createProbeNode(activeList)
                this.timer = setTimeout(() => {
                    this.searchSidecar(nodes)
                }, 5000)
            } finally {
                this.tableLoading = false
            }
        }
        async createProbeNode(list = []) {
            if (!list.length) {
                return false
            }
            const res = await this.$api.logNode.createProbeNode({
                is_manual: true,
                hosts: list.map(item => ({
                    bk_cloud_id: item.bk_cloud_id,
                    inner_ip: item.inner_ip,
                    bk_host_id: item.bk_host_id,
                    os_type: item.os_type
                }))
            })
            const { result, message } = res
            if (!result) {
                this.$error(message)
                return false
            }
        }
        handMovement(row) {
            const handMovement: any = this.$refs.handMovement
            handMovement.show(row)
        }
        handleSearchData(value) {
            this.searchParams = value
        }
        goBack() {
            const len = this.dataList.filter(row => !row.active_status).length
            if (len) {
                this.$bkInfo({
                    title: '温馨提示',
                    subTitle: `有${len}个节点还未检测到安装完成，退出当前界面将停止检测，若您已经手动安装完成，请保持当前页面并耐心等待3-5分钟`,
                    confirmFn: () => {
                        try {
                            this.setCurrentMode()
                            return true
                        } catch (e) {
                            console.warn(e)
                            return false
                        }
                    }
                })
            } else {
                this.setCurrentMode()
            }
        }
        @Emit('setCurrentMode')
        setCurrentMode() {
            return ''
        }
    }
</script>

<style lang="scss" scoped>
    .task-detail {
        height: 100%;
        .title-box {
            display: flex;
            align-items: center;
            font-size: 16px;
            margin-bottom: 20px;
            .bk-icon {
                color: #3a84ff;
                cursor: pointer;
            }
            .tag {
                font-size: 12px;
                padding: 1px 5px;
                border-radius: 4px;
                margin-left: 10px;
            }
        }
        .table-header {
            margin-top: 20px;
            margin-bottom: -1px;
            background: #f0f1f5;
            border: 1px solid #dcdee5;
            border-radius: 2px 2px 0 0;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            font-size: 12px;
            .left-info {
                font-weight: 700;
                span:nth-child(1) {
                    color: #63656e;
                }
                span:nth-child(2) {
                    color: #979ba5;
                }
            }
        }
        .status-tag {
            display: inline-block;
            margin-right: 13px;
            width: 8px;
            height: 8px;
            border: 1px solid #979ba5;
            border-radius: 4px;
        }
    }
</style>
