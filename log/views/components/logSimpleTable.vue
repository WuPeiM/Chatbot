<template>
    <div class="log-wrapper-main-detail">
        <div
            class="table-wrap"
            :style="{
                height: maxHeight
            }">
            <table>
                <tbody class="log-content" v-for="(item,ind) in data" :key="ind">
                    <tr>
                        <td>
                            <div class="log-content-detail">
                                <div class="detail-title">
                                    <div class="title-id">
                                        <span class="cw-icon weops-you-jian mr5"></span>{{ item.message._id }}
                                    </div>
                                </div>
                                <div class="detail-wrapper">
                                    <div class="detail-wrapper-desc">
                                        <div class="desc-item">
                                            <b>时间</b>
                                            <div class="row-content">{{item.message.timestamp }}</div>
                                        </div>
                                        <div class="desc-item">
                                            <b>储存在索引中</b>
                                            <div class="row-content">{{ item.index }}</div>
                                        </div>
                                    </div>
                                    <div class="detail-wrapper-table">
                                        <div class="table-row disabled-popover" v-for="(field,fieldKey,fieldInd) in item.message" :key="fieldInd">
                                            <template>
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
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from 'vue-property-decorator'
    import moment from 'moment'

    @Component
    export default class LogTable extends Vue {
        @Prop({ type: Array, default: () => [] }) data: Array<any>
        @Prop({ type: String, default: () => 'calc(100vh - 600px)' }) maxHeight: string

        formatTime(item, id) {
            return id === 'timestamp' ? moment(new Date(item)).format('YYYY-MM-DD HH:mm:ss') : (item || '--')
        }
    }
</script>

<style lang="scss" scoped>
.log-wrapper-main-detail {
    margin-top: 10px;
    background: #fff;
    padding-left: 10px;
    width: 100%;
    border: 1px solid #ddd;

    .table-wrap {
        overflow: auto;
        margin-bottom: 10px;
        width: 100%;

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

            .log-content-detail {
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

                        /deep/.table-row {
                            border-bottom: 1px solid #ededed;
                            padding: 8px 0;
                            cursor: text;

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

                            .row-content {
                                font-size: 12px;
                                padding-top: 4px;
                                line-height: 20px;
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
