<template>
    <div>
        <bk-sideslider
            title="仪表盘"
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
                        @enter="handleSearch"
                        @clear="handleSearch">
                    </bk-input>
                </div>
                <ComTable
                    class="common-table-max-height"
                    v-bkloading="{ isLoading: loading, zIndex: 10 }"
                    :data="fieldList"
                    :columns="columns"
                    :max-height="maxHeight"
                    :pagination="pagination"
                    @page-change="handlePageChange"
                    @page-limit-change="limitChange">
                    <template slot="operation" slot-scope="{ row }" style="color: #3A84FF;">
                        <div>
                            <bk-button
                                class="ml10"
                                text
                                @click="handleChoose(row)">
                                选择
                            </bk-button>
                        </div>

                    </template>
                </ComTable>
            </div>
            <div slot="footer">
                <bk-button theme="default" @click="handleClose">取消</bk-button>
            </div>
        </bk-sideslider>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    import ComTable from '@/components/comTable.vue'
    @Component({
        components: {
            ComTable
        }
    })
    export default class LoadModal extends Vue {
        visible: boolean = false
        maxHeight: string | number = ''
        searchField: string = ''
        fieldList: Array<any> = []
        loading: boolean = false
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
                key: 'name',
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
        currentPanel: any = {}

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

        handleChoose(row) {
            this.visible = false
            const { searchId, searchValue, ...widget } = this.currentPanel
            localStorage.setItem('dashboard_widget', JSON.stringify({ ...widget, h: Math.ceil(widget.h * (5 / 3)) }))
            const newRouteURL = this.$router.resolve({
                name: 'DashboardLayout',
                query: {
                    id: row.id,
                    subName: row.name
                }
            }).href
            // 使用 window.open() 打开新路由的 URL
            window.open(newRouteURL, '_blank')
        }
        handleSearch() {
            this.pagination.current = 1
            this.getDashBoardList()
        }
        async getDashBoardList() {
            this.loading = true
            try {
                const res = await this.$api.dashBoard.getDashboard({
                    page_size: this.pagination.limit,
                    page: this.pagination.current,
                    search_type: 'all',
                    name: this.searchField
                })
                if (res.result) {
                    const { data: { count, items } } = res
                    this.pagination.count = count
                    this.fieldList = items
                }
            } finally {
                this.loading = false
            }
        }
        // 显示弹窗
        show(row) {
            this.currentPanel = row
            this.getDashBoardList()
            this.visible = true
        }
        handleClose() {
            this.visible = false
        }
        // 当页码发生变化时触发
        handlePageChange(page) {
            this.pagination.current = page
            this.getDashBoardList()
        }
        // 当每页展示条数发生变化时触发
        limitChange(size) {
            this.pagination.current = 1
            this.pagination.limit = size
            this.getDashBoardList()
        }
    }
</script>

<style lang="scss" scoped>
.search-field {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

/deep/.bk-table-row {
    cursor: pointer;
}
</style>
