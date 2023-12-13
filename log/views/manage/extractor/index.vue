<template>
    <div class="extractor" v-bkloading="{ isLoading: pageLoading, zIndex: 10 }">
        <page-explanation
            :title="`${extractorDetail.title || '--'} 的提取器`"
            content="日志提取器将会应用在这个接收器上的每一条日志消息.使用日志提取器,可以将任意的文本数据进行提取及转换到特定的字段,便于稍后筛选及分析.例子:从日志消息中提取 HTTP返回码,将其转换成数字字段http_response_code,并附加到日志上." />
        <div class="add-extractor">
            <div class="title">添加提取器</div>
            <div class="tip">加载一个样例信息,您可以决定通过接收器加载最新日志消息,还是手动选择日志消息的ID</div>
            <bk-button
                :disabled="isStartExtraction"
                :theme="'primary'"
                :title="'开始提取'"
                class="mt10 mb10"
                @click="isStartExtraction = true">
                开始提取
            </bk-button>
            <bk-tab v-if="isStartExtraction" :active.sync="active" type="card">
                <bk-tab-panel
                    v-for="(panel, index) in panels"
                    v-bind="panel"
                    :key="index">
                    <div style="font-size: 14px;">
                        {{panel.name === 'latestData' ? '单击“加载消息”以加载此输入在过去一小时内收到的最新消息。' : '输入搜索条件，单击“加载消息”以加载该条件搜索到的第一条日志。'}}
                    </div>
                    <div style="display: flex;" class="mt10">
                        <search-time
                            v-if="panel.name === 'conditionalSearch'"
                            class="mr20"
                            ref="searchTime">
                        </search-time>
                        <bk-input
                            v-if="panel.name === 'latestData'"
                            style="width: 460px;"
                            disabled
                            v-model="latestDataValue">
                        </bk-input>
                        <bk-input
                            v-else
                            style="width: 460px;"
                            v-model="conditionalSearchValue">
                        </bk-input>
                        <bk-button
                            :theme="'primary'"
                            class="ml15"
                            :loading="loadMessageLoading"
                            @click="handleSearchMessage(panel.name)">
                            {{panel.name === 'latestData' ? '加载消息' : '加载数据'}}
                        </bk-button>
                    </div>
                </bk-tab-panel>
            </bk-tab>
            <log-detail
                v-if="JSON.stringify(logMessage) !== '{}'"
                class="mt10"
                :extractor-detail="extractorDetail"
                :log-message="logMessage">
            </log-detail>
        </div>
        <div class="configured-extractor" v-bkloading="{ isLoading: extractorListLoading, zIndex: 10 }">
            <div class="title mb15">
                <span>已配置的提取器</span>
                <bk-button
                    :disabled="!extractorList.length"
                    size="small"
                    theme="warning"
                    class="mr10"
                    @click="extractorSort">
                    为提取器排序
                </bk-button>
            </div>
            <div v-if="!extractorList.length" class="no-data">
                <bk-icon style="font-size: 16px;" type="info-circle-shape" />
                <span>此输入没有配置的提取器.</span>
            </div>
            <extractor-detail
                v-for="(item, index) in extractorList"
                :class="[index !== extractorList.length - 1 && 'special-extractor-detail']"
                :detail="item"
                :key="item.id"
                :extractor-name-map="extractorNameMap"
                @toggle-expand="toggleExpand(item)"
                @refresh-extractor-list="getExtractorsList">
            </extractor-detail>
        </div>
        <extractor-order ref="extractorOrder" @refresh-list="getExtractorsList"></extractor-order>
    </div>
</template>

<script lang="ts">
    import {Vue, Component, Watch} from 'vue-property-decorator'
    import ExtractorDetail from '@log/views/manage/extractor/components/extractorDetail.vue'
    import LogDetail from '@log/views/manage/extractor/components/logDetail.vue'
    import PageExplanation from '@/components/pageExplanation.vue'
    import ExtractorOrder from '@log/views/manage/extractor/components/extractorOrder.vue'
    import SearchTime from '@log/views/components/logTimeSelector.vue'
    import { v4 as uuidv4 } from 'uuid'
    import { extractorNameMap } from './ts/extractorMap'
    @Component({
        components: {
            ExtractorDetail,
            LogDetail,
            PageExplanation,
            ExtractorOrder,
            SearchTime
        }
    })
    export default class Extractor extends Vue {
        panels = [
            { name: 'latestData', label: '最新数据' },
            { name: 'conditionalSearch', label: '条件搜索' }
        ]
        isStartExtraction: boolean = false
        active: string = 'latestData'
        latestDataValue: string = ''
        conditionalSearchValue: string = ''
        pageLoading: boolean = false
        extractorList: any[] = []
        extractorListLoading: boolean = false
        extractorDetail: any = {}
        loadMessageLoading: boolean = false
        logMessage: any = {}
        extractorNameMap = extractorNameMap
        @Watch('active', {
            deep: true,
            immediate: true
        })
        onActiveChanged(val) {
            this.logMessage = {}
            if (val === 'latestData') {
                this.conditionalSearchValue = ''
            }
        }
        mounted() {
            this.getExtractorsList()
            this.getClusterDetail()
        }
        extractorSort() {
            const extractorOrder: any = this.$refs.extractorOrder
            extractorOrder.show(this.extractorDetail.title, this.extractorList)
        }
        handleSearchMessage(type) {
            type === 'latestData' ? this.loadMessage() : this.loadData()
        }
        loadMessage() {
            this.loadMessageLoading = true
            this.$api.extractor.getUniversalRelative({
                query: `gl2_source_input:${this.$route.query.receiverId} OR gl2_source_radio_input:${this.$route.query.receiverId}`,
                range: 3600,
                limit: 1,
                decorate: false
            }).then(res => {
                const { result, data } = res
                if (!result) {
                    return false
                }
                this.logMessage = data
            }).finally(() => {
                this.loadMessageLoading = false
            })
        }
        loadData() {
            const searchTime: any = this.$refs.searchTime[0]
            const params = {
                id: uuidv4().replace(/-/g, '').slice(0, 24),
                queries: [
                    {
                        id: uuidv4(),
                        query: {
                            type: 'elasticsearch',
                            query_string: `${this.conditionalSearchValue} gl2_source_input:${this.$route.query.receiverId}`
                        },
                        timerange: searchTime.getTimeRange(),
                        filter: {
                            type: 'or',
                            filters: []
                        },
                        search_types: [
                            {
                                id: uuidv4(),
                                type: 'messages',
                                limit: 10,
                                offset: 0
                            }
                        ]
                    }
                ],
                parameters: []
            }
            this.loadMessageLoading = true
            this.$api.log.createSearchId(params).then(res => {
                const { result, data } = res
                if (!result) {
                    this.loadMessageLoading = false
                    return false
                }
                this.$api.log.getLogData({ id: data.id }).then(tex => {
                    if (!tex.result) {
                        return false
                    }
                    const searchTypes: any = Object.values(tex.data.results[data.queries[0].id].search_types)[0]
                    this.logMessage = {
                        to: searchTypes.effective_timerange.to,
                        messages: searchTypes.messages.slice(0, 1)
                    }
                }).finally(() => {
                    this.loadMessageLoading = false
                })
            }).catch(e => {
                this.loadMessageLoading = false
            })
        }
        toggleExpand(detail) {
            detail.isExpand = !detail.isExpand
        }
        getClusterDetail() {
            this.pageLoading = true
            this.$api.logManage.getClusterDetail({
                id: this.$route.query.receiverId
            }).then(res => {
                const { result, data } = res
                if (!result) {
                    return false
                }
                this.extractorDetail = data
                this.latestDataValue = `${data.title}(${data.type})`
            }).finally(() => {
                this.pageLoading = false
            })
        }
        getExtractorsList() {
            this.extractorListLoading = true
            this.$api.extractor.getExtractorsList({id: this.$route.query.receiverId}).then(res => {
                const { result, data } = res
                if (!result) {
                    return false
                }
                this.extractorList = data.extractors
                this.extractorList.forEach(item => {
                    this.$set(item, 'isExpand', false)
                })
            }).finally(() => {
                this.extractorListLoading = false
            })
        }
    }
</script>

<style lang="scss" scoped>
    .extractor {
        padding-bottom: 20px;
        .add-extractor,
        .configured-extractor {
            padding: 15px;
            background-color: #fff;
            border-radius: 4px;
            .title {
                font-size: 22px;
                margin-bottom: 5px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
        }
        .add-extractor {
            .tip {
                font-size: 14px;
            }
        }
        .configured-extractor {
            margin-top: 10px;
            .no-data {
                padding: 15px;
                background-color: #eff2f8;
                border: 1px solid #bdc8e4;
                border-radius: 4px;
            }
            .special-extractor-detail {
                border-bottom: 1px solid #7894ce;
                margin-bottom: 20px;
                padding-bottom: 20px;
            }
        }
    }
</style>
