<template>
    <div class="log-wrapper-main-detail" v-bkloading="{ isLoading: loading, zIndex: 99 }">
        <div class="log-wrapper-nav-area">
            <bk-pagination
                class="nav-area-page"
                :current.sync="pagination.current"
                :count.sync="pagination.count"
                :limit="pagination.limit"
                @change="handlePageChange"
                @limit-change="limitChange"
            >
            </bk-pagination>
            <span v-if="pagination.count" class="ml10">共 {{ pagination.count }} 条</span>
        </div>
        <com-table
            :style="{
                width: maxWidth
            }"
            ref="clusterTable"
            :data="clusterList"
            :columns="columns"
        >
            <template slot="Count" slot-scope="{ row }">
                <span class="add-patten" @click="addPatten(row)">{{ row.size }}</span>
            </template>
            <template slot="Percentage" slot-scope="{ row }">
                <span>{{ row.percentage >= 100 ? 100 : (row.percentage || 0) }}%</span>
            </template>
        </com-table>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
    import ComTable from '@/components/comTable.vue'

    @Component({
        name: 'LogCluster',
        components: {
            ComTable
        }
    })
    export default class LogTable extends Vue {
        @Prop({ type: String, default: () => 'calc(100vw - 328px)' }) maxWidth: string
        @Prop({ type: Object, default: () => ({}) })
        currentSearchInfo: any

        pattenCount: number = 0.3
        columns: Array<any> = [
            {
                label: '数量',
                key: 'size',
                sortable: true,
                width: '100px'
                // scopedSlots: 'Count'
            },
            {
                label: '占比',
                key: 'percentage',
                width: '100px',
                scopedSlots: 'Percentage'
            },
            {
                label: 'Patten',
                key: 'template',
                align: 'left',
                renderHeader: (h, params) => {
                const patten = h('span', {
                    style: {
                        display: 'flex',
                        flex: 1
                    }
                }, '分类')
                const title = h('span', {
                    style: {
                        marginRight: '10px',
                        color: '#3a84ff'
                    }
                }, '分类数量：')
                const less = h('span', {
                    style: {
                        margin: '0 10px',
                        color: '#3a84ff'
                    }
                }, '少')
                const btn = h('bk-slider', {
                    props: {
                        showTip: true,
                        step: 0.1,
                        showInterval: true,
                        value: this.pattenCount,
                        minValue: 0.2,
                        maxValue: 0.8
                    },
                    style: {
                        width: '200px'
                    },
                    on: {
                        input: this.handleInput,
                        change: this.changePatten
                    }
                }, '')
                const more = h('span', {
                    style: {
                        margin: '0 10px',
                        color: '#3a84ff'
                    }
                }, '多')
                    return h('div',
                    {style: {
                        display: 'flex',
                        alignItems: 'center'
                    }},
                    [patten, title, less, btn, more]
                    )
                }
            }
        ]
        clusterList = []
        allData = []
        pagination = {
            current: 1,
            limit: 20,
            count: 0
        }
        loading: boolean = false

        @Watch('currentSearchInfo.searchId', {
            immediate: true,
            deep: true
        })
        onSearchIdChanged(val) {
            if (this.currentSearchInfo.total <= 100000 && this.currentSearchInfo.total > 0) {
                this.handleSearch()
            }
        }

        getParams() {
            const { searchId, queryId, messageId, total, effectiveTimerange } = this.currentSearchInfo
            return {
                search_id: searchId,
                query_id: queryId,
                search_type_id: messageId,
                time_range: effectiveTimerange,
                total_count: total,
                sim_th: this.pattenCount
            }
        }
        async handleSearch() {
            this.loading = true
            const params = this.getParams()
            const res = await this.$api.log.getLogClusterData(params)
            .finally(() => {
                this.loading = false
            })
            const { result, message, data } = res
            if (!result) {
                return this.$error(message)
            }
            this.clusterList = data.data
            this.allData = data.data
            this.pagination.count = data.count
        }
        searchData() {
            const list = this.$copy(this.allData)
            this.pagination.count = list.length
            this.clusterList = list.filter((item, index) =>
                index < this.pagination.current * this.pagination.limit && index >= this.pagination.limit * (this.pagination.current - 1)
            )
        }
        addPatten(item) {
            this.$emit('addPatten', item.template)
        }
        handleInput(val) {
            this.pattenCount = val
        }
        changePatten(val) {
            this.pagination.current = 1
            this.handleSearch()
        }
        // 当页码发生变化时触发
        handlePageChange(page) {
            this.pagination.current = page
            this.searchData()
        }
        // 当每页展示条数发生变化时触发
        limitChange(size) {
            this.pagination.current = 1
            this.pagination.limit = size
            this.searchData()
        }
    }
</script>

<style lang="scss" scoped>
.log-wrapper-main-detail {
    background: #fff;
    padding: 10px 10px 0 10px;
    width: 100%;
    .log-wrapper-nav-area {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        .nav-area-page {
            display: flex;
            flex-direction: row-reverse;
        }
        .nav-area-count {
            text-align: left;
        }
    }
    .add-patten {
        display: inline-block;
        border-bottom: 1px solid #3a84ff !important;
        color: #3a84ff;
        cursor: pointer;
    }
    /deep/ .bk-slider-runway {
        background: #fff;
    }
    /deep/.bk-table-header-label {
        width: 100%;
    }
    /deep/.bk-table-body-wrapper {
        max-height: calc(100vh - 460px);
        overflow-y: scroll;
    }
    /deep/.bk-slider-button.horizontal {
        z-index: 10 !important;
    }
    /deep/.bk-slider-interval {
        background-color: #c0c4cc;
    }
}
</style>
