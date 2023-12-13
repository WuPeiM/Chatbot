<template>
    <div class="log-wrapper-main-tree">
        <bk-input
            class="tree-input"
            placeholder="请输入字段名称搜索"
            v-model="searchVal"
            clearable>
        </bk-input>
        <div class="log-tree">
            <div class="log-tree-field" v-for="(item,index) in Object.keys(fieldLists)" :key="index">
                <div class="field-title">{{ item === 'hideFields' ? '可选字段' : '展示字段'}}</div>
                <div class="field-content" v-if="fieldLists[item].length">
                    <div class="field-content-list" v-for="sec in fieldLists[item]" :key="sec.id">
                        <div class="tree-field-desc">
                            <slot
                                name="operate"
                                :sec="sec">
                            </slot>
                            <bk-icon :type="sec.isExpanded ? 'angle-up' : 'angle-down'" class="list-operation-icon" @click="showFeildDetail(sec)" />
                        </div>
                        <div v-if="sec.isExpanded" class="tree-field-detail" v-bkloading="{ isLoading: sec.loading, zIndex: 10 }">
                            <template v-if="sec.rows.length">
                                <div class="detail-item" v-for="(row,rowInd) in sec.rows" :key="rowInd">
                                    <div class="statistics">
                                        <span class="statistics-key hide-text" v-bk-overflow-tips>{{ row.key }}</span>
                                        <span class="statistics-value">{{ row.value }}</span>
                                    </div>
                                    <bk-progress :fixed="2" :percent="row.percent"></bk-progress>
                                </div>
                            </template>
                            <div v-else>
                                --
                            </div>
                        </div>
                    </div>
                </div>
                <bk-exception
                    v-else
                    type="empty"
                    scene="part"
                    :class="{ 'exception-gray': false }"
                    class="exception-wrap-item exception-part">
                </bk-exception>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from 'vue-property-decorator'
    import { v4 as uuidv4 } from 'uuid'

    @Component({
        name: 'LogTree',
        components: {}
    })
    export default class LogTree extends Vue {
        @Prop({
            type: Object,
            default: () => {
                return {
                    displayFields: [],
                    hideFields: []
                }
            }
        })
        fieldList: any
        @Prop({type: Array, default: () => []})
        groupList: Array<any>

        searchVal: string = ''

        get fieldLists() {
            const displayFields = this.fieldList.displayFields.filter(item => item.id.includes(this.searchVal))
            const hideFields = this.fieldList.hideFields.filter(item => item.id.includes(this.searchVal))
            return {
                displayFields,
                hideFields
            }
        }

        // 展开字段详情
        showFeildDetail(item) {
            this.$set(item, 'isExpanded', !item.isExpanded)
            if (!this.groupList.length) {
                this.$set(item, 'rows', [])
                return
            }
            item.fieldId = uuidv4()
            if (!item.isExpanded) {
                return
            }
            const rowGroups = [
                {
                    type: 'values',
                    field: item.value,
                    limit: 15
                }
            ]
            this.$emit('showFeildDetail', rowGroups, item)
        }
        // 获取左侧树的统计信息
        async getTreeInfo(params, item) {
            this.$set(item, 'loading', true)
            const res = await this.$api.log.createSearchId(params)
            if (!res.result) {
                this.$set(item, 'loading', false)
                this.$set(item, 'rows', [])
                return this.$error(res.message)
            }
            try {
                const treeInfo = await this.$api.log.getLogData({ id: res.data.id })
                if (!treeInfo.result) {
                    return this.$error(treeInfo.message)
                }
                const logResults = Object.values(treeInfo.data.results)[0]?.search_types || {}
                const rows = logResults[item.fieldId]?.rows || []
                const total = rows.filter(row => row.source === 'leaf').reduce((pre, cur) => {
                    pre += cur.values[0].value
                    return pre
                }, 0)
                item.rows = rows.filter(sec => sec.source === 'leaf').map(leaf => {
                    return {
                        key: leaf.key[0],
                        value: leaf.values[0].value,
                        percent: leaf.values[0].value / total
                    }
                }).sort((a, b) => {
                    return b.percent - a.percent
                }).slice(0, 5)
            } catch (e) {
                this.$set(item, 'rows', [])
            } finally {
                this.$set(item, 'loading', false)
            }
        }
    }
</script>

<style lang="scss" scoped>
.log-wrapper-main-tree {
    .tree-input {
        margin-bottom: 10px;
    }

    .log-tree {
        background: #fff;
        width: 250px;
        min-width: 250px;
        padding: 10px;
        border-right: 1px solid #ededed;
        height: calc(100vh - 378px);
        overflow-y: auto;

        .log-tree-field {
            .field-title {
                padding: 20px 0 4px 6px;
                margin-bottom: 4px;
                font-size: 14px;
                font-weight: bold;
                border-bottom: 1px solid #ddd;
            }

            .field-content {
                padding: 0 6px;
                line-height: 24px;

                .field-content-list {
                    cursor: pointer;

                    .tree-field-desc {
                        display: flex;
                        align-items: center;

                        .list-operation-icon {
                            font-size: 18px !important;
                            font-weight: 500;
                        }
                    }

                    .tree-field-detail {
                        font-size: 12px !important;

                        .detail-item {
                            .statistics {
                                display: flex;
                                justify-content: space-between;

                                .statistics-key {
                                    width: 70%;
                                    margin-right: 10px;
                                }

                                .statistics-value {
                                    max-width: 30%;
                                    color: #96a1b2;
                                }
                            }
                        }

                        /deep/ .progress-text {
                            font-size: 12px !important;
                            width: 20%;
                        }

                        /deep/ .progress-bar.bk-progress-normal {
                            margin-right: 10px;
                        }
                    }

                    /deep/.field-list-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 206px;

                        &:hover {
                            color: #3a84ff;
                        }
                    }

                    /deep/.list-info {
                        display: flex;
                        align-items: center;
                        width: 90%;

                        .list-info-icon {
                            font-weight: 800;
                            margin-right: 4px;
                        }
                    }
                }
            }
        }

        /deep/.tree-popover {

            .bk-tooltip,
            .bk-tooltip-ref {
                display: flex;
                height: 24px;
            }
        }
    }
}
</style>
