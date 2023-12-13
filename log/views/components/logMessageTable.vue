<template>
    <div class="log-wrapper-main-detail">
        <div class="log-wrapper-nav-area" v-if="isTop">
            <bk-pagination
                class="nav-area-page"
                :current.sync="pagination.current"
                :count.sync="pagination.count"
                :limit="pagination.limit"
                @change="handlePageChange"
                @limit-change="limitChange"
            >
            </bk-pagination>
            <i v-if="!!pagination.count" class="cw-icon weops-download download-btn" @click="handleLog('downloadModal')"></i>
        </div>
        <div
            class="table-wrap"
            :style="{
                height: maxHeight,
                width: maxWidth
            }"
            v-if="data.length">
            <table>
                <thead class="log-columns">
                    <tr>
                        <th v-for="item in columns" :key="item.id">
                            <div class="log-columns-item">
                                <span class="column-name hide-text" v-bk-overflow-tips>{{item.value}}</span>
                                <span class="column-icon" v-if="!item.hide">
                                    <span v-if="item.sort" :class="['cw-icon','weops-ascending-order',item.active && 'active']" @click="handleSort(item)" />
                                    <span v-else :class="['cw-icon','weops-descending-order',item.active && 'active']" @click="handleSort(item)" />
                                </span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody class="log-content" v-for="(item,ind) in data" :key="ind">
                    <tr :class="['log-content-column',!showMessageRow && 'show-detail']" @click="showDetail(item)">
                        <td class="content-column-value" v-for="sec in columns" :key="sec.id"><span v-html="formatTime(item.message[sec.id],sec.id)" /></td>
                    </tr>
                    <tr v-if="showMessageRow">
                        <td :colspan="columns.length" class="log-content-description">
                            <div class="description" v-html="item.message.message" @click="showDetail(item,'showMessageRow')" />
                        </td>
                    </tr>
                    <tr>
                        <td :colspan="columns.length" v-if="item.showMore">
                            <div class="log-content-detail">
                                <div class="detail-title">
                                    <div class="title-id">
                                        <span class="cw-icon weops-you-jian mr5"></span>{{ item.message._id }}
                                    </div>
                                    <div class="title-operate">
                                        <bk-dropdown-menu ref="dropdown" v-if="showNearbyInfo">
                                            <bk-button
                                                theme="primary"
                                                size="small"
                                                slot="dropdown-trigger"
                                                icon-right="icon-angle-down">
                                                显示附近的信息
                                            </bk-button>
                                            <ul class="bk-dropdown-list" slot="dropdown-content">
                                                <li v-for="time in frequency" :key="time.id" @click="showMoreInfo(item,time)">
                                                    <span>
                                                        {{ time.name }}
                                                    </span>
                                                </li>
                                            </ul>
                                        </bk-dropdown-menu>
                                        <bk-button
                                            v-copy="item.message.message"
                                            theme="primary"
                                            size="small">
                                            复制
                                        </bk-button>
                                    </div>
                                </div>
                                <div class="detail-wrapper">
                                    <div class="detail-wrapper-desc">
                                        <div class="desc-item">
                                            <b>时间</b>
                                            <div class="row-content">{{item.message.timestamp }}</div>
                                        </div>
                                        <div class="desc-item">
                                            <b>接收器</b>
                                            <div class="row-content">syslog-udp on</div>
                                        </div>
                                        <div class="desc-item">
                                            <b>储存在索引中</b>
                                            <div class="row-content">{{ item.index }}</div>
                                        </div>
                                    </div>
                                    <div class="detail-wrapper-table">
                                        <div :class="['table-row',!enablePopover && 'disabled-popover']" v-for="(field,fieldKey,fieldInd) in item.message" :key="fieldInd">
                                            <slot
                                                v-if="enablePopover"
                                                name="operate"
                                                :field="field"
                                                :fieldKey="fieldKey"
                                                :item="item">
                                            </slot>
                                            <template v-else>
                                                <div class="table-row-label">
                                                    <span class="label">{{ fieldKey }}</span>
                                                </div>
                                                <div class="row-content">
                                                    <span v-html="field" />
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <bk-exception
            v-else
            type="empty"
            scene="part"
            :class="{ 'exception-gray': false }">
        </bk-exception>
        <div class="log-wrapper-nav-area pagination-bottom" v-if="!isTop && data.length">
            <bk-pagination
                class="nav-area-page"
                :current.sync="pagination.current"
                :count.sync="pagination.count"
                :limit="pagination.limit"
                @change="handlePageChange"
                @limit-change="limitChange"
            >
            </bk-pagination>
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from 'vue-property-decorator'
    import moment from 'moment'

    @Component({
        name: 'LogMessageTable',
        components: {}
    })
    export default class LogTable extends Vue {
        @Prop({ type: Array, default: () => [] }) columns: Array<any>
        @Prop({
            type: Object,
            default: () => {
                return {
                    current: 1,
                    limit: 20,
                    count: 0,
                    position: 'top'
                }
            }
        })
        pagination: any
        @Prop({ type: Array, default: () => [] }) data: Array<any>
        @Prop({ type: Boolean, default: () => true }) showMessageRow: boolean
        @Prop({ type: Boolean, default: () => true }) enablePopover: boolean
        @Prop({ type: Boolean, default: () => true }) showNearbyInfo: boolean
        @Prop({ type: String, default: () => 'calc(100vh - 402px)' }) maxHeight: string
        @Prop({ type: String, default: () => 'calc(100vw - 328px)' }) maxWidth: string

        frequency: Array<any> = [
            { name: '1秒', id: 1 / 60 },
            { name: '5秒', id: 5 / 60 },
            { name: '30秒', id: 30 / 60 },
            { name: '1分钟', id: 1 },
            { name: '5分钟', id: 5 }
        ]

        get isTop() {
            return this.pagination?.position === 'top'
        }

        formatTime(item, id) {
            return id === 'timestamp' ? moment(new Date(item)).format('YYYY-MM-DD HH:mm:ss') : (item || '--')
        }
        // 当页码发生变化时触发
        handlePageChange(page) {
            this.$emit('handlePageChange', page)
        }
        // 当每页展示条数发生变化时触发
        limitChange(size) {
            this.$emit('limitChange', size)
        }
        // 显示附近信息
        showMoreInfo(item, time) {
            // 获取几分钟前到某个点的时间，和某个点到几分钟后的时间
            const getBeforeAndAfterTime = (time, minutes) => {
                const now = new Date(time)
                const minutesAgo = new Date(now.getTime() - minutes * 60 * 1000)
                const minutesAfter = new Date(now.getTime() + minutes * 60 * 1000)
                return [minutesAgo, minutesAfter]
            }
            const nearTime = getBeforeAndAfterTime(item.message.timestamp, time.id).map(item => moment(item).format('YYYY-MM-DD HH:mm:ss'))
            const startTime = nearTime.at()
            const endTime = nearTime.at(-1)
            const { href } = this.$router.resolve({
                name: 'Log',
                query: {
                    timerange: JSON.stringify({
                        from: startTime,
                        to: endTime,
                        type: 'absolute'
                    })
                }
            })
            window.open(href, '_blank')
        }
        // 下载
        handleLog(type) {
            this.$emit('handleLog', type)
        }
        // 排序
        handleSort(item) {
            this.$emit('handleSort', item)
        }
        // 展开详情
        showDetail(item, type) {
            if (type || !this.showMessageRow) {
                this.$set(item, 'showMore', !item.showMore)
            }
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
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .nav-area-page {
            display: flex;
            flex-direction: row-reverse;
        }

        .download-btn {
            cursor: pointer;
        }

        /deep/.page-item {
            &:nth-last-child(2) {
                display: none;
            }
        }
    }

    .pagination-bottom {
        justify-content: center !important;
    }

    .table-wrap {
        overflow: auto;
        margin-bottom: 10px;

        table {
            table-layout: fixed;
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;

            td,
            th {
                width: 240px;
                box-sizing: border-box;
                word-wrap: break-word;
                word-break: break-all;
            }

            thead tr th {
                position: sticky;
                top: 0;
                background: #e6e6e6;
                height: 30px;
                line-height: 30px;
                z-index: 9;
                text-align: left;

                &:nth-child(1) {
                    padding-left: 4px;
                }
            }

            .log-columns {
                .log-columns-item {
                    display: flex;
                    align-items: center;

                    .column-name {
                        max-width: 210px;
                    }

                    .column-icon {
                        font-size: 14px;
                        cursor: pointer;
                        display: inline-block;

                        .weops-descending-order,
                        .weops-ascending-order {
                            margin-left: 6px;
                            color: #b4b4b4;
                        }

                        .active {
                            color: #000;
                        }
                    }
                }
            }

            .log-content-column {
                td {
                    padding: 10px 10px 0 0;

                    &:nth-child(1) {
                        font-weight: 500;
                    }
                }

                .content-column-value {
                    vertical-align: top;
                }
            }

            .show-detail {
                cursor: pointer;

                td {
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                }
            }

            .log-content-description {
                .description {
                    color: #3a84ff;
                    cursor: pointer;
                    border-bottom: 1px solid #ddd;
                    padding: 5px 0 10px 0;
                    font-size: 13px;
                    line-height: 20px;
                    white-space: pre-line;
                }
            }

            .log-content-detail {
                border-bottom: 1px solid #ddd;

                .detail-title {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 6px 0;

                    .title-id {
                        display: flex;
                        align-items: center;
                        font-size: 16px;
                    }

                    /deep/ .bk-dropdown-menu {
                        top: -1px;

                        .bk-dropdown-list li span {
                            display: block;
                            height: 24px;
                            line-height: 24px;
                            padding: 0 16px;
                            color: #63656e;
                            font-size: 12px;
                            text-decoration: none;
                            white-space: nowrap;
                            cursor: pointer;

                            &:hover {
                                color: #3a84ff;
                            }
                        }
                    }
                }

                .detail-wrapper {
                    display: flex;

                    .detail-wrapper-desc {
                        padding-right: 10px;

                        .desc-item {
                            width: 200px;
                            margin-bottom: 10px;
                            word-wrap: break-word;

                            .row-content {
                                font-size: 12px;
                                padding-top: 2px;
                                line-height: 20px;
                            }
                        }
                    }

                    .detail-wrapper-table {
                        width: 100%;
                        word-wrap: break-word;

                        /deep/.detail-wrapper-popover {
                            display: inline-block;
                        }

                        /deep/.table-row {
                            border-bottom: 1px solid #ededed;
                            padding: 8px 0;
                            cursor: pointer;

                            &:nth-child(1) {
                                padding-top: 0;
                            }

                            &:nth-last-child(1) {
                                border-bottom: none;
                            }

                            .label {
                                font-weight: 600;
                                color: #6a6a6a;
                            }

                            .table-row-label,
                            .row-content {
                                .show-more {
                                    display: none;
                                    font-size: 12px !important;
                                    transform: scale(0.8);
                                }

                                &:hover {
                                    .show-more {
                                        display: inline-block;
                                    }
                                }
                            }

                            .row-content {
                                font-size: 12px;
                                padding-top: 4px;
                                line-height: 20px;

                                .lighten {
                                    background: #ffffb4;
                                }
                            }
                        }

                        .disabled-popover {
                            cursor: text;
                        }
                    }
                }
            }
        }
    }
}
</style>
