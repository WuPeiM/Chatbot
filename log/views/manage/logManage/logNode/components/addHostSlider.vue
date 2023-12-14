<template>
    <bk-sideslider
        :width="850"
        :quick-close="true"
        :is-show.sync="visible"
        ext-cls="common-dialog-wrapper">
        <div slot="header">
            添加主机
        </div>
        <div class="add-host-content" slot="content">
            <bk-radio-group class="mb20" v-model="installType" @change="changeRadioGroup">
                <bk-radio-button value="auto">
                    自动安装
                </bk-radio-button>
                <bk-radio-button value="manual">
                    手动安装
                </bk-radio-button>
            </bk-radio-group>
            <div class="add-host-operation">
                <select-input
                    class="search-select"
                    :data="searchData"
                    @search="handleSearchData"
                    @change="handleSearchData" />
            </div>
            <div class="add-host-container mt20" v-bkloading="{ isLoading: loading, zIndex: 10 }">
                <div class="host-table">
                    <host-table
                        size="medium"
                        ref="nodeTable"
                        :data="data"
                        :columns="columns"
                        :row-key="'inner_ip'"
                        :pagination="pagination"
                        @select="handleSelectData"
                        @select-all="handleSelectAllData"
                        @filter-change="handleFilterChange"
                        @page-change="handlePageChange"
                        @page-limit-change="handleLimitChange">
                        <template slot="type" slot-scope="{ row }">
                            {{ typeMap[row.os_type] || '--' }}
                        </template>
                        <template slot="status" slot-scope="{ row }">
                            {{ statusMap[row.status] || '--' }}
                        </template>
                        <template slot="biz" slot-scope="{ row }">
                            {{ row.bk_biz_name || '--' }}
                        </template>
                    </host-table>
                </div>
                <div class="result-content">
                    <div class="header">
                        已选择<span>{{ selectedList.length }}</span>台主机
                        <span class="clear" @click="handleClear">清空</span>
                    </div>
                    <ul>
                        <li :key="item.inner_ip" v-for="(item, index) in selectedList">
                            {{ item.inner_ip }}
                            <bk-icon type="close" @click="removeSelectHost(item, index)" />
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div slot="footer">
            <bk-button
                class="mr10"
                theme="primary"
                :loading="disabled"
                :disabled="disabled"
                @click="handleAddHostConfirm">
                确定
            </bk-button>
            <bk-button
                theme="default"
                :disabled="disabled"
                @click="handleCancel">
                取消
            </bk-button>
        </div>
    </bk-sideslider>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    import SelectInput from './selectInput/index.vue'
    import HostTable from '@/components/comTable.vue'
    import { AGENT_STATUS, HOST_RESOURCE_COLUMNS } from './../field'

    @Component({
        name: 'add-host-slider',
        components: {
            HostTable,
            SelectInput
        }
    })
    export default class AddHostSlider extends Vue {
        visible: boolean = false
        loading: boolean = false
        disabled: boolean = false
        searchData = [
            {
                name: '内网IP',
                id: 'inner_ip'
            },
            {
                name: '主机名称',
                id: 'bk_host_name'
            }
        ]
        pagination = {
            current: 1,
            count: 1,
            limit: 20,
            small: true
        }
        columns = HOST_RESOURCE_COLUMNS
        data: any[] = []
        typeMap = {
            'LINUX': 'Linux',
            'WINDOWS': 'Windows'
        }
        statusMap = AGENT_STATUS
        selectedList = []
        filterParams = [{
            key: 'os_type',
            value: ['LINUX', 'WINDOWS']
        }, {
            key: 'status',
            value: ['RUNNING']
        }]
        searchParams = []
        installType: string = 'auto'

        created() {
            this.getBusiness()
        }

        async getBusiness() {
            const res = await this.$api.Resource.getBusiness()
            const { data, result } = res
            if (result) {
                this.columns.forEach(item => {
                    if (item.key === 'bk_biz_id') {
                        item.filters = data.map(row => ({
                            text: row.bk_biz_name,
                            value: row.bk_biz_id
                        }))
                    }
                })
            }
        }

        showSlider() {
            this.visible = true
            this.selectedList = []
            this.searchParams = []
            this.getResourceHost()
        }

        async getResourceHost() {
            this.loading = true
            try {
                const params = {
                    page: this.pagination.current,
                    pagesize: this.pagination.limit,
                    conditions: this.filterParams.concat(this.searchParams)
                }
                const res = await this.$api.logNode.getHostList(params)
                if (!res.result) {
                    return false
                }
                const { data } = res
                this.data = data.list.map(item => ({
                    ...item,
                    disable: data.exist_host.includes(item.bk_host_id)
                }))
                this.pagination.count = data.total
                const selectMap = Object.fromEntries((this.selectedList || []).map(r => [r.bk_host_id, r]))
                this.$nextTick(() => {
                    this.data.forEach(item => {
                        if (selectMap[item.bk_host_id]) {
                            const hostTable: any = this.$refs.nodeTable
                            hostTable.toggleRowSelection(item, true)
                        }
                    })
                })
            } finally {
                this.loading = false
            }
        }

        handleFilterChange(key) {
            for (const i in key) {
                this.filterParams = this.filterParams.filter(item => item.key !== i)
                if (key[i]?.length) {
                    this.filterParams.push({
                        key: i,
                        value: key[i]
                    })
                }
                // 如果筛选的是agent状态,则value为空时,则筛选[linux,windows]
                if (i === 'os_type' && key[i]?.length === 0) {
                    this.filterParams.push({
                        key: i,
                        value: ['LINUX', 'WINDOWS']
                    })
                }
            }
            this.getResourceHost()
        }

        handlePageChange(page) {
            this.pagination.current = page
            this.getResourceHost()
        }

        handleLimitChange(size) {
            this.pagination.current = 1
            this.pagination.limit = size
            this.getResourceHost()
        }

        handleSearchData(value) {
            this.searchParams = value.map(item => ({
                key: item.id,
                value: [item.value]
            }))
            this.getResourceHost()
        }

        handleSelectData(selection, row) {
            const targetIndex = this.selectedList.findIndex(tex => tex.inner_ip === row.inner_ip)
            if (targetIndex === -1) {
                this.selectedList.push(row)
            } else {
                this.selectedList.splice(targetIndex, 1)
            }
        }

        handleSelectAllData(selection) {
            const findAppoint = (item) => {
                return this.selectedList.find(tex => tex.inner_ip === item.inner_ip)
            }
            if (selection.length === 0) {
                this.selectedList = this.selectedList.filter(item => !findAppoint(item))
            } else {
                (selection || []).forEach(item => {
                    const target = findAppoint(item)
                    if (!target) {
                        this.selectedList.push(item)
                    }
                })
            }
        }
        removeSelectHost(item, index) {
            this.selectedList.splice(index, 1)
            this.$nextTick(() => {
                this.data.forEach(tex => {
                    if (tex.inner_ip === item.inner_ip) {
                        const hostTable: any = this.$refs.nodeTable
                        hostTable.toggleRowSelection(tex, false)
                    }
                })
            })
        }

        handleClear() {
            this.selectedList = []
            this.$refs.nodeTable?.clearSelection()
        }

        handleCancel() {
            this.visible = false
        }

        handleAddHostConfirm() {
            if (!this.selectedList.length) {
                this.$warn('请选择要添加的主机')
                return false
            }
            if (this.installType === 'auto') {
                this.createProbeNode()
            } else {
                this.$emit('add-confirm', this.installType, this.selectedList)
                this.visible = false
            }
        }
        async createProbeNode() {
            this.disabled = true
            try {
                const res = await this.$api.logNode.createProbeNode({
                    hosts: this.selectedList.map(item => ({
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
                this.$emit('add-confirm', this.installType)
                this.$success('主机添加成功')
                this.visible = false
            } finally {
                this.disabled = false
            }
        }
        changeRadioGroup(value) {
            this.selectedList = []
            this.filterParams.forEach(obj => {
                if (obj.key === 'status') {
                    obj.value = value === 'auto' ? ['RUNNING'] : ['TERMINATED', 'NOT_INSTALLED', 'UNKNOWN']
                }
            })
            this.pagination.current = 1
            this.getResourceHost()
        }
    }
</script>

<style scoped lang="scss">
.add-host-content {
    min-height: calc(100vh - 114px);
    padding: 20px;
    .add-host-operation {
        /deep/.bk-compose-form-item {
            width: 100%;
            .search-select-wrap {
                width: calc(100% - 120px) !important;
            }
        }
    }
    .add-host-container {
        width: 100%;
        display: flex;
        .host-table {
            width: 600px;
            /deep/ .bk-table-body-wrapper {
                max-height: calc(100vh - 380px) !important;
                overflow-y: auto;
            }
        }
        .result-content {
            width: 210px;
            border: 1px solid #DCDEE5;
            border-bottom: none;
            background-color: #F5F7FA;
            padding: 12px 24px;
            font-size: 12px;
            max-height: calc(100vh - 270px);
            overflow-y: auto;
            .header {
                margin-bottom: 20px;
                >span {
                    display: inline-block;
                    color: #3a84ff;
                }
                .clear {
                    cursor: pointer;
                    float: right;
                }
            }
            ul {
                li {
                    height: 32px;
                    line-height: 32px;
                    background: #ffffff;
                    border-bottom: 1px solid #f1f1f1;
                    padding-left: 5px;
                    i {
                        display: inline-block;
                        float: right;
                        cursor: pointer;
                        font-size: 18px !important;
                        margin-top: 7px;
                        color: #b6b6b6;
                        &:hover {
                            color: #3a84ff;
                        }
                    }
                }
            }
        }
    }
}
</style>
<style>
.bk-table-filter-panel .panel-checkbox-group {
    max-height: 500px;
    overflow: scroll;
}
</style>
