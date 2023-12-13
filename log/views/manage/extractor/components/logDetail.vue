<template>
    <div class="log-content-detail">
        <div v-if="messageList.length">
            <div class="detail-title">
                <div class="title-id">
                    <span class="cw-icon weops-you-jian mr5"></span>{{messageId}}
                </div>
                <bk-icon
                    :type="isExpand ? 'up-shape' : 'down-shape'"
                    @click="isExpand = !isExpand" />
            </div>
            <div v-if="isExpand" class="detail-wrapper">
                <div class="detail-wrapper-desc">
                    <div class="desc-item">
                        <b>时间</b>
                        <div class="row-content">{{messageTime}}</div>
                    </div>
                    <div class="desc-item">
                        <b>接收器</b>
                        <div class="row-content">{{extractorDetail.name}}</div>
                    </div>
                    <div class="desc-item">
                        <b>储存在索引中</b>
                        <div class="row-content">{{messageIndex}}</div>
                    </div>
                </div>
                <div class="detail-wrapper-table">
                    <div class="table-row" v-for="(item, index) in messageList" :key="index">
                        <div class="table-row-label">
                            <span class="label">{{ item.label }}</span>
                        </div>
                        <div class="row-content">
                            <span>{{item.content}}</span>
                        </div>
                        <bk-dropdown-menu
                            ext-cls="action-dropdown"
                            trigger="click"
                            @show="dropdownShow"
                            @hide="dropdownHide"
                            ref="dropdown">
                            <div class="dropdown-trigger-text" slot="dropdown-trigger">
                                <span>选择提取器类型</span>
                                <i :class="['bk-icon icon-angle-down',{ 'icon-flip': isDropdownShow }]"></i>
                            </div>
                            <ul class="bk-dropdown-list" slot="dropdown-content">
                                <li
                                    v-for="tex in typeof item.content === 'string' ? extractorType : noExtractorList"
                                    :key="tex.id">
                                    <a
                                        href="javascript:;"
                                        :class="[typeof item.content !== 'string' && 'disabled-row']"
                                        @click="addExtractor(item, tex.id)">
                                        {{tex.name}}
                                    </a>
                                </li>
                            </ul>
                        </bk-dropdown-menu>
                    </div>
                </div>
            </div>
        </div>
        <bk-exception
            v-else
            class="exception-wrap-item exception-part"
            type="empty"
            scene="part">
        </bk-exception>
    </div>
</template>
<script lang="ts">
    import {Vue, Component, Prop, Watch} from 'vue-property-decorator'
    import { extractorType } from '../ts/extractorMap'
    @Component({})
    export default class logDetail extends Vue {
        @Prop({
            type: Object,
            default: () => ({})
        })
        logMessage: any
        @Prop({
            type: Object,
            default: () => ({})
        })
        extractorDetail: any
        isDropdownShow: boolean = false
        messageId: string = ''
        messageIndex: string = ''
        messageTime: string = ''
        messageList = []
        isExpand: boolean = true
        extractorType = extractorType
        noExtractorList = [
            {
                id: 'no-extractor',
                name: '该提取器只适用于字符串类型字段.'
            }
        ]
        messageSpecialField: any = {}
        @Watch('logMessage', {
            deep: true,
            immediate: true
        })
        onLogMessageChanged(val) {
            this.messageList = []
            this.messageSpecialField = {}
            if (val.to) {
                this.messageTime = this.$FormatTime('yyyy-MM-dd hh:mm:ss', val.to)
            }
            if (val.messages && val.messages.length) {
                this.messageIndex = val.messages[0].index
                const message = val.messages[0].message
                this.messageId = message['_id']
                for (const k in message) {
                    if (!['streams', '_id'].includes(k) && !k.startsWith('gl2_')) {
                        this.messageList.push({
                            label: k,
                            content: message[k]
                        })
                    } else {
                        this.messageSpecialField[k] = message[k]
                    }
                }
            }
        }
        addExtractor(item, extractorType) {
            if (typeof item.content !== 'string') {
                return false
            }
            this.$router.push({
                name: 'AddExtractor',
                query: {
                    message: item.content,
                    extractorType,
                    receiverId: this.$route.query.receiverId,
                    sourceField: item.label
                }
            })
        }
        dropdownShow() {
            this.isDropdownShow = true
        }
        dropdownHide() {
            this.isDropdownShow = false
        }
    }
</script>

<style scoped lang="scss">
    .log-content-detail {
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 16px;
        .detail-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            .title-id {
                display: flex;
                align-items: center;
                font-size: 16px;
            }
            .bk-icon {
                font-size: 20px !important;
                cursor: pointer;
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

                .action-dropdown {
                    position: absolute;
                    right: 0;
                    top: 15px;
                }

                /deep/.detail-wrapper-popover {
                    display: inline-block;
                }

                /deep/.table-row {
                    border-bottom: 1px solid #ededed;
                    padding: 8px 0;
                    cursor: pointer;
                    position: relative;

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
        .disabled-row {
            cursor: not-allowed !important;
            background-color: #f3f3f3;
            color: #737373 !important;
        }
    }
</style>
