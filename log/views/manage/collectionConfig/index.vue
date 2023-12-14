<template>
    <div class="collect-config-wrapper">
        <page-explanation
            title="采集配置"
            content="您可以针对不同的日志采集对象创建采集配置，采集配置作用于日志探针后，该探针将根据采集配置进行日志数据的采集">
        </page-explanation>
        <div class="collect-config-header">
            <bk-button
                v-permission="permission"
                class="mr10"
                theme="primary"
                @click="handleAdd">
                新建配置
            </bk-button>
            <select-input
                class="search-select"
                :data="searchData"
                @search="handleSearch"
                @change="handleSearch" />
        </div>
        <config-table
            v-bkloading="{ isLoading: loading, zIndex: 10 }"
            class="mt10"
            ref="configTable"
            :data="data"
            :columns="columns"
            :pagination="pagination"
            @filter-change="handleFilterChange"
            @page-change="handlePageChange"
            @page-limit-change="handleLimitChange">
            <template slot="node" slot-scope="{ row }">
                <bk-button text theme="primary" @click="showNodeTable('useNode', row)">
                    {{ row.use_nodes.count }}
                </bk-button>
            </template>
            <template slot="operation" slot-scope="{ row }">
                <bk-button
                    text
                    v-permission="permission"
                    class="mr10"
                    theme="primary"
                    @click="showNodeTable('apply', row)">
                    应用
                </bk-button>
                <bk-button
                    text
                    v-permission="permission"
                    class="mr10"
                    theme="primary"
                    @click="updateConfigurations(row)">
                    修改
                </bk-button>
                <bk-button
                    text
                    v-permission="permission"
                    class="mr10"
                    theme="primary"
                    @click="handleCopyConfigurations(row)">
                    复制
                </bk-button>
                <bk-button
                    text
                    v-permission="permission"
                    class="mr10"
                    :disabled="!!row.use_nodes.count"
                    theme="primary"
                    @click="handleDelete(row)">
                    删除
                </bk-button>
            </template>
        </config-table>
        <bk-dialog
            v-model="setting.visible"
            title="复制"
            :header-position="'left'"
            theme="primary"
            :mask-close="false"
            :loading="setting.loading"
            @confirm="handleConfirm">
            <bk-form
                ref="copyForm"
                :label-width="70"
                :rules="setting.rules"
                :model="setting.data">
                <bk-form-item
                    label="名称"
                    :required="true"
                    :property="'name'"
                    :error-display-type="'normal'">
                    <bk-input v-model="setting.data.name"></bk-input>
                </bk-form-item>
            </bk-form>
        </bk-dialog>
        <bk-sideslider
            :width="800"
            :is-show.sync="visible"
            :quick-close="true">
            <div slot="header">
                {{ operationNodeType === 'apply' ? '应用' : '已用节点' }}
                <span class="sub-title">- {{ currentConfiguration.name || '--' }}</span>
            </div>
            <div slot="content">
                <node-table
                    class="p20"
                    :type="operationNodeType"
                    :configuration="currentConfiguration"
                    ref="nodeTable"
                    @apply-success="getConfigurations" />
            </div>
        </bk-sideslider>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    import SelectInput from '../logManage/logNode/components/selectInput/index.vue'
    import PageExplanation from '@/components/pageExplanation.vue'
    import { Pagination, SearchKeys } from '@log/types/index'
    import ConfigTable from '@/components/comTable.vue'
    import { COLLECTION_CONFIG_COLUMNS } from '../logManage/logNode/field'
    import NodeTable from '../logManage/logNode/index.vue'

    @Component({
        name: 'collection-config',
        components: {
            NodeTable,
            ConfigTable,
            SelectInput,
            PageExplanation
        }
    })
    export default class CollectionConfig extends Vue {
        loading: boolean = false
        columns: any = COLLECTION_CONFIG_COLUMNS
        searchData: SearchKeys[] = [
            {
                name: '配置名称',
                id: 'name'
            },
            {
                name: '探针类型',
                id: 'collector_name'
            }
        ]
        pagination: Pagination = {
            current: 1,
            count: 1,
            limit: 20
        }
        data = []
        visible: boolean = false
        searchParams: any = {}
        filterParams: any = {}
        operationNodeType: string = 'apply'
        currentConfiguration: any = {}
        setting = {
            visible: false,
            loading: false,
            rules: {
                name: [
                    {
                        required: true,
                        message: '请输入名称',
                        trigger: 'blur'
                    }
                ]
            },
            data: {
               name: '',
               id: null
            }
        }

        get permission() {
            return {
                id: this.$route.name,
                type: 'operateAuth'
            }
        }
        created() {
            const { id } = this.$route.params
            this.searchParams = { configurations_id: id }
            this.getConfigurations()
        }

        async getConfigurations() {
            this.loading = true
            try {
                const res = await this.$api.logNode.getConfigurations({
                    page: this.pagination.current,
                    page_size: this.pagination.limit,
                    query: {
                        ...this.searchParams,
                        ...this.filterParams
                    }
                })
                const { result, message, data } = res
                if (!result) {
                    this.data = []
                    this.$error(message)
                    return false
                }
                this.data = data.data
                this.pagination.count = data.count
            } finally {
                this.loading = false
            }
        }
        handleAdd() {
            if (!this.$BtnPermission(this.permission)) {
                return false
            }
            this.$router.push({
                name: 'AddConfig'
            })
        }

        handleSearch(params) {
            this.pagination.current = 1
            this.searchParams = Object.fromEntries(params.map(item => [item.id, item.value]))
            this.getConfigurations()
        }

        handleFilterChange(params) {
            this.pagination.current = 1
            Object.keys(params).forEach(key => {
                if (Array.isArray(params[key])) {
                    params[key] = params[key][0]
                }
            })
            this.filterParams = params
            this.getConfigurations()
        }

        handlePageChange(page) {
            this.pagination.current = page
            this.getConfigurations()
        }

        handleLimitChange(size) {
            this.pagination.current = 1
            this.pagination.limit = size
            this.getConfigurations()
        }
        updateConfigurations(row) {
            if (!this.$BtnPermission(this.permission)) {
                return false
            }
            this.$router.push({
                name: 'UpdateConfig',
                query: {
                    id: row.id,
                    collector_name: row.collector_name,
                    os_type: row.os_type
                }
            })
        }
        showNodeTable(type: string, row: any) {
            if (type === 'apply' && !this.$BtnPermission(this.permission)) {
                return false
            }
            this.operationNodeType = type
            this.visible = true
            this.currentConfiguration = row
        }
        async handleCopyConfigurations(row) {
            if (!this.$BtnPermission(this.permission)) {
                return false
            }
            this.setting.visible = true
            this.setting.data.name = ''
            this.setting.data.id = row.id
        }
        handleConfirm() {
            this.setting.loading = true
            this.$refs.copyForm.validate().then(async validator => {
                const res = await this.$api.logNode.copyConfigurations(this.setting.data)
                this.setting.loading = false
                const { result, message } = res
                if (!result) {
                    this.$error(message)
                    return false
                }
                this.setting.visible = false
                this.$success('复制成功')
                await this.getConfigurations()
            }, validator => {
                this.setting.loading = false
            })
        }
        handleDelete(row) {
            if (!this.$BtnPermission(this.permission)) {
                return false
            }
            this.$bkInfo({
                title: `确认删除配置: ${row.name}？`,
                confirmLoading: true,
                confirmFn: async() => {
                    try {
                        await this.deleteConfigurations(row)
                        return true
                    } catch (e) {
                        console.warn(e)
                        return false
                    }
                }
            })
        }
        async deleteConfigurations(row) {
            const res = await this.$api.logNode.deleteConfigurations({
                id: row.id
            })
            const { result, message } = res
            if (!result) {
                this.$error(message)
                return false
            }
            this.getConfigurations()
            this.$success(`删除配置${row.name}成功`)
        }
    }
</script>

<style scoped lang="scss">
.collect-config-wrapper {
    .collect-config-header {
        display: flex;
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
}
</style>
