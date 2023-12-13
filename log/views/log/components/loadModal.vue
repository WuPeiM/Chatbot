<template>
    <div>
        <bk-sideslider
            title="加载条件"
            :is-show.sync="visible"
            :quick-close="true"
            :width="600"
            ext-cls="common-dialog-wrapper"
            :before-close="handleClose">
            <div slot="content" class="common-dialog-wrapper-main">
                <div class="search-field">
                    <bk-input
                        class="mr10"
                        v-model="searchField"
                        clearable
                        placeholder="请输入搜索语句"
                        @enter="getFieldList"
                        @clear="getFieldList">
                    </bk-input>
                    <bk-icon type="question-circle-shape" class="tips" @click="showTips" />
                </div>
                <ComTable
                    class="common-table-max-height"
                    v-bkloading="{ isLoading: tableLoading, zIndex: 10 }"
                    ref="healthTable"
                    :data="fieldList"
                    :columns="columns"
                    :max-height="maxHeight"
                    :pagination="pagination"
                    @page-change="handlePageChange"
                    @page-limit-change="limitChange"
                    @row-click="handleRowClick">
                    <template slot="operation" slot-scope="{ row }" style="color: #3A84FF;">
                        <div>
                            <bk-button
                                class="ml10"
                                text
                                @click="handleSearch(row)">
                                查询
                            </bk-button>
                            <bk-button
                                text
                                :disabled="currentId === row.id"
                                @click="handleDelete(row)">
                                删除
                            </bk-button>
                        </div>

                    </template>
                </ComTable>
            </div>
            <div slot="footer">
                <bk-button theme="default" @click="handleClose">取消</bk-button>
            </div>
        </bk-sideslider>
        <TipsModal ref="tipsModal" />
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    import ComTable from '@/components/comTable.vue'
    import TipsModal from './tipsModal.vue'
@Component({
    components: {
        ComTable,
        TipsModal
    }
})
export default class LoadModal extends Vue {
    visible: boolean = false
    maxHeight: string | number = ''
    searchField: string = ''
    fieldList: Array<any> = []
    tableLoading: boolean = false
    pagination: {
        current: number,
        count: number,
        limit: number
    } = {
            current: 1,
            count: 0,
            limit: 20
        }
    columns = [
        {
            label: '标题',
            key: 'title',
            minWidth: '180px'
        },
        {
            label: '操作',
            key: 'operation',
            width: '120px',
            prop: 'operation',
            scopedSlots: 'operation'
        }
    ]
    currentId: string = ''

    mounted() {
        const PAGE_OCCUPIED_HEIGHT = 184
        this.maxHeight = window.innerHeight - PAGE_OCCUPIED_HEIGHT
        window.onresize = () => {
            this.maxHeight = window.innerHeight - PAGE_OCCUPIED_HEIGHT
        }
    }
    get permissionObj() {
        return {
            id: this.$route.name,
            type: 'operateAuth'
        }
    }

    handleSearch(row) {
        const { id } = row
        this.currentId = id
        this.$emit('selectLoadCondition', id)
        this.visible = false
    }
    handleRowClick(row, event, column, rowIndex, columnIndex, type) {
        const isLastColumn = this.columns.length === columnIndex + 1
        if (!isLastColumn || type === 'search') {
            this.$emit('selectLoadCondition', row.id)
            this.visible = false
        }
    }
    async getFieldList() {
        this.tableLoading = true
        try {
            const params = {
                query: this.searchField,
                page: this.pagination.current,
                per_page: this.pagination.limit,
                sort: 'title',
                order: 'asc'
            }
            const res = await this.$api.log.getSearchCondition(params)
            if (!res.result) {
                return this.$error(res.message)
            }
            this.fieldList = res.data.views
            this.pagination.count = res.data.total
        } finally {
            this.tableLoading = false
        }
    }
    showTips() {
        this.$refs.tipsModal.show()
    }
    // 显示弹窗
    show({ currentStateId }) {
        // 当前条件状态id,记录为了禁止删除该条数据
        this.currentId = currentStateId
        this.getFieldList()
        this.visible = true
    }
    handleClose() {
        this.visible = false
    }
    // 删除条件
    async handleDelete(row) {
        // if (!this.$BtnPermission(this.permissionObj)) {
        //     return
        // }
        if (this.currentId === row.id) return false
        this.$bkInfo({
            title: '提示',
            subTitle: '确定删除该条件？',
            theme: 'primary',
            confirmFn: () => {
                this.confirmDeleteCondition(row)
            }
        })
    }
    async confirmDeleteCondition(row) {
        this.tableLoading = true
        const params = {
            id: row.id
        }
        const res = await this.$api.log.delSearchCondition(params)
        if (!res.result) {
            this.$message.error(res.message)
            this.tableLoading = false
            return
        }
        this.$success('删除成功')
        if (this.pagination.current > 1 && this.fieldList.length === 1) {
            this.pagination.current--
        }
        this.getFieldList()
    }
    // 当页码发生变化时触发
    handlePageChange(page) {
        this.pagination.current = page
        this.getFieldList()
    }
    // 当每页展示条数发生变化时触发
    limitChange(size) {
        this.pagination.current = 1
        this.pagination.limit = size
        this.getFieldList()
    }
}
</script>

<style lang="scss" scoped>
.search-field {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .tips {
        cursor: pointer;
    }
}

/deep/.bk-table-row {
    cursor: pointer;
}
</style>
