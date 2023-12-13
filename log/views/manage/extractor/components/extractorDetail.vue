<template>
    <div class="extractor-detail">
        <div class="header-box">
            <div class="base-info">
                <span class="name">{{detail.title}}</span>
                <span class="type">{{extractorNameMap[detail.type]}}</span>
            </div>
            <div class="action-bar">
                <bk-button
                    :theme="'primary'"
                    class="mr10"
                    @click="toggleExpand">
                    详情
                </bk-button>
                <bk-button
                    :theme="'primary'"
                    class="mr10"
                    @click="editExtractor">
                    编辑
                </bk-button>
                <bk-button
                    :theme="'danger'"
                    class="mr10"
                    @click="deleteExtractor">
                    删除
                </bk-button>
            </div>
        </div>
        <div class="tip">
            {{`尝试 原封不动的从${detail.source_field}提取数据到${detail.target_field}`}}
        </div>
        <div class="main-content" v-if="detail.isExpand">
            <div class="left-content">
                <div v-if="detail.condition_type !== 'none'" class="mb10">
                    <div class="label">条件</div>
                    <div class="value">
                        <span>{{`只会当提取器 ${detail.condition_type === 'string' ? '包含字符串' : '匹配正则表达式'} 时候才会执行`}}</span>
                        <em>{{detail.condition_value}}</em>
                        进行提取
                    </div>
                </div>
                <div class="mb10">
                    <div class="label">配置</div>
                    <div class="value" v-if="Object.keys(detail.extractor_config).length">
                        <div v-for="(value, key) in detail.extractor_config" :key="key" class="mb5">
                            {{`${key} : ${value}`}}
                        </div>
                    </div>
                    <div v-else class="value">没有配置任何参数</div>
                </div>
                <div v-if="detail.converters.length">
                    <div class="label">转换器</div>
                    <div class="value">
                        <div v-for="(item, index) in detail.converters" :key="index" class="mb5">
                            <div>{{item.type}}</div>
                            <div
                                v-for="(value, key) in item.config"
                                style="padding-left: 40px;margin-bottom: 5px;"
                                :key="key">
                                {{`${key} : ${value}`}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right-content">
                <div class="title">性能指标</div>
                <div class="meter mb10">{{`${handleTime(detail.metrics.total.rate.total)} 次调用, 平均: ${handleTime(detail.metrics.total.rate.one_minute)}, ${handleTime(detail.metrics.total.rate.five_minute)}, ${handleTime(detail.metrics.total.rate.one_minute)}.`}}</div>
                <div class="meter mb10">{{`${detail.metrics.condition_hits} 命中, ${detail.metrics.condition_misses} 未命中`}}</div>
                <div class="performance-index">
                    <div
                        v-for="(item, index) in performanceIndexList"
                        class="performance-index-item"
                        :key="index">
                        <div class="name">{{item.name}}</div>
                        <div class="list-item"
                            v-for="(tex, k) in item.list"
                            :key="k">
                            <span>{{tex.label}}</span>
                            <span>{{tex.value}}μs</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Vue, Component, Prop} from 'vue-property-decorator'
    import numeral from 'numeral'
    @Component({})
    export default class extractorDetail extends Vue {
        @Prop({
            type: Object,
            default: () => ({})
        })
        detail: any
        @Prop({
            type: Object,
            default: () => ({})
        })
        extractorNameMap: any
        performanceIndexList = [
            {
                name: '总耗时',
                key: 'totalTime',
                list: [
                    {
                        label: '95%:',
                        value: 0,
                        key: '95th_percentile'
                    },
                    {
                        label: '98%:',
                        value: 0,
                        key: '98th_percentile'
                    },
                    {
                        label: '99%:',
                        value: 0,
                        key: '99th_percentile'
                    },
                    {
                        label: '标准差:',
                        value: 0,
                        key: 'std_dev'
                    },
                    {
                        label: '平均值:',
                        value: 0,
                        key: 'mean'
                    },
                    {
                        label: '最小值:',
                        value: 0,
                        key: 'min'
                    },
                    {
                        label: '最大值:',
                        value: 0,
                        key: 'max'
                    }
                ]
            },
            {
                name: '条件判断时间',
                key: 'conditionTime',
                list: [
                    {
                        label: '95%:',
                        value: 0,
                        key: '95th_percentile'
                    },
                    {
                        label: '98%:',
                        value: 0,
                        key: '98th_percentile'
                    },
                    {
                        label: '99%:',
                        value: 0,
                        key: '99th_percentile'
                    },
                    {
                        label: '标准差:',
                        value: 0,
                        key: 'std_dev'
                    },
                    {
                        label: '平均值:',
                        value: 0,
                        key: 'mean'
                    },
                    {
                        label: '最小值:',
                        value: 0,
                        key: 'min'
                    },
                    {
                        label: '最大值:',
                        value: 0,
                        key: 'max'
                    }
                ]
            },
            {
                name: '执行时间',
                key: 'executionTime',
                list: [
                    {
                        label: '95%:',
                        value: 0,
                        key: '95th_percentile'
                    },
                    {
                        label: '98%:',
                        value: 0,
                        key: '98th_percentile'
                    },
                    {
                        label: '99%:',
                        value: 0,
                        key: '99th_percentile'
                    },
                    {
                        label: '标准差:',
                        value: 0,
                        key: 'std_dev'
                    },
                    {
                        label: '平均值:',
                        value: 0,
                        key: 'mean'
                    },
                    {
                        label: '最小值:',
                        value: 0,
                        key: 'min'
                    },
                    {
                        label: '最大值:',
                        value: 0,
                        key: 'max'
                    }
                ]
            },
            {
                name: '转换时间',
                key: 'convertersTime',
                list: [
                    {
                        label: '95%:',
                        value: 0,
                        key: '95th_percentile'
                    },
                    {
                        label: '98%:',
                        value: 0,
                        key: '98th_percentile'
                    },
                    {
                        label: '99%:',
                        value: 0,
                        key: '99th_percentile'
                    },
                    {
                        label: '标准差:',
                        value: 0,
                        key: 'std_dev'
                    },
                    {
                        label: '平均值:',
                        value: 0,
                        key: 'mean'
                    },
                    {
                        label: '最小值:',
                        value: 0,
                        key: 'min'
                    },
                    {
                        label: '最大值:',
                        value: 0,
                        key: 'max'
                    }
                ]
            }
        ]
        mounted() {
            this.initData()
        }
        editExtractor() {
            this.$router.push({
                name: 'EditExtractor',
                query: {
                    extractorType: this.detail.type,
                    receiverId: this.$route.query.receiverId,
                    extractorId: this.detail.id,
                    sourceField: this.detail.source_field
                }
            })
        }
        deleteExtractor() {
            this.$bkInfo({
                title: `确定删除提取器 "${this.detail.title}?"`,
                confirmLoading: true,
                confirmFn: async() => {
                    await this.confirmDelete()
                }
            })
        }
        async confirmDelete() {
            try {
                const res = await this.$api.extractor.deleteExtractor({
                    receiverId: this.$route.query.receiverId,
                    extractorId: this.detail.id
                })
                if (!res.result) {
                    this.$error(res.message)
                } else {
                    this.$success('删除成功!')
                    this.$emit('refresh-extractor-list')
                }
                return true
            } catch (e) {
                return false
            }
        }
        toggleExpand() {
            this.$emit('toggle-expand', this.detail)
        }
        handleTime(value) {
            return numeral(value).format('0,0.[00]')
        }
        initData() {
            const metrics = this.detail.metrics
            const timeData = {
                totalTime: metrics.total.time,
                conditionTime: metrics.condition.time,
                executionTime: metrics.execution.time,
                convertersTime: metrics.converters.time
            }

            this.performanceIndexList.forEach(item => {
                const itemTimeData = timeData[item.key]
                if (itemTimeData) {
                    item.list.forEach(tex => {
                        tex.value = this.handleTime(itemTimeData[tex.key])
                    })
                }
            })
        }
    }
</script>

<style scoped lang="scss">
    .extractor-detail {
        .header-box {
            display: flex;
            justify-content: space-between;
            .base-info {
                .name {
                    font-size: 22px;
                }
                .type {
                    font-size: 14px;
                    color: #aaa;
                }
            }
        }
        .tip {
            font-size: 14px;
            margin: 5px 0;
        }
        .main-content {
            display: flex;
            align-items: flex-start;
            .left-content {
                flex: 2;
                padding: 10px;
                background-color: #f3f3f3;
                border-radius: 4px;
                .label {
                    font-size: 18px;
                    color: #1f1f1f;
                    margin-bottom: 5px;
                }
                .value {
                    color: #575757;
                    font-size: 14px;
                    padding-left: 40px;
                }
            }
            .right-content {
                flex: 1;
                margin-left: 20px;
                .title {
                    font-size: 20px;
                }
                .performance-index {
                    display: flex;
                    flex-wrap: wrap;
                    .performance-index-item {
                        width: 50%;
                        padding: 0 15px;
                        margin-bottom: 10px;
                        .name {
                            font-size: 18px;
                        }
                        .list-item {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            font-size: 14px;
                            margin-top: 5px;
                        }
                    }
                }
            }
        }
    }
</style>
