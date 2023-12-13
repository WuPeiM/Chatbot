<template>
    <div class="time-chart">
        <div :id="ballId" style="width: 100%; height: 100%;">
        </div>
        <div class="time-chart-bottom">
            <div class="line"></div>
            <div class="message">
                <span>{{ selectedTime.at() }}</span>
                <div class="message-center">
                    <span>日志总条数：{{ chartData.total || 0 }}</span>
                    <span class="search-time">查询时间：{{ currentSearchInfo.time}}</span>
                    <span>查询耗时：{{ currentSearchInfo.response }}</span>
                </div>
                <span>{{ selectedTime.at(-1) }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
    import moment from 'moment'
    import { getSecondsLaterByTime } from '@log/controller/formatTime'

@Component({})
export default class ChartLine extends Vue {
    @Prop({ type: Object }) chartData: any
    @Prop({ type: Object }) currentSearchInfo: any

    chart: any = null
    isComplete: boolean = false
    isEmpty: false
    selectedTime: Array<string> = []

    get ballId() {
        return 'catch' + this._uid
    }

    changeSelectedTime(val) {
        this.selectedTime = val
    }

    @Watch('chartData', {
        immediate: true,
        deep: true
    })
    async onChartDataChange(chartData) {
        if (chartData.xAxisData) {
            const that = this
            await this.initLine(chartData, that)
            window.onresize = () => {
                this.chart.resize()
            }
            return
        }
        this.chart?.dispose()
    }

    initLine(chartData, that) {
        if (this.chart) {
            this.chart.dispose()
        }
        if (!document.getElementById(this.ballId)) return
        this.chart = this.$echarts.init(document.getElementById(this.ballId))
        // if (chartData.xAxisData.length === 1) {
        //     // 只有一条数据时，特殊处理
        //     const { from, to } = this.currentSearchInfo.effectiveTimerange
        //     chartData.xAxisData = [from, to]
        //     chartData.yAxisData = [0, 0]
        // }
        // 设置 ECharts 的 options 配置
        const option = {
            grid: {
                top: '16%',
                left: '2%',
                right: '2%',
                bottom: '24%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: chartData.xAxisData,
                axisLabel: {
                    formatter: (vaule) => {
                        // 当同一天时，x轴只显示时分秒
                        if (chartData.xAxisData.length > 1 && chartData.xAxisData.at().slice(0, 10) === chartData.xAxisData.at(-1).slice(0, 10)) {
                            return moment(new Date(vaule)).format('HH:mm:ss')
                        }
                        return moment(new Date(vaule)).format('YYYY-MM-DD HH:mm:ss')
                    }
                }
            },
            yAxis: {
                type: 'value',
                scale: true,
                min: 0,
                max: chartData.max,
                interval: chartData.max // 只显示最小值和最大值
            },
            series: [{
                data: chartData.yAxisData,
                type: 'bar',
                animation: false,
                itemStyle: {
                    normal: {
                        color: '#3a84ff'
                    }
                },
                barWidth: chartData.xAxisData?.length >= 40 ? 'auto' : 24 // 柱状图柱子宽度自适应
            }],
            tooltip: {
                trigger: 'axis',
                triggerOn: 'mousemove',
                enterable: true,
                formatter: function(params) {
                    const str = `<div>
                                <div>
                                <span>时间：</span>
                                <span>${moment(new Date(params[0].name)).format('YYYY-MM-DD HH:mm:ss')}</span>
                                </div>
                                <div>
                                <span>日志数量：</span>
                                <span>${params[0].value}</span>
                                </div>
                            </div>`
                    return str
                }
            },
            // 初始的 dataZoom 配置,隐藏工具栏中的区域缩放图标
            toolbox: {
                show: chartData.xAxisData.length > 1,
                feature: {
                    dataZoom: {
                        show: true,
                        yAxisIndex: 'none',
                        title: {
                            zoom: '',
                            back: ''
                        },
                        zoomLock: true,
                        iconStyle: {
                            cursor: 'pointer'
                        },
                        icon: {
                            zoom: 'none',
                            back: 'none'
                        }
                    }
                }
            }
        }
        this.chart.clear()
        // this.chart.resize()
        this.chart.setOption(option)
        // 监听 dataZoom 的 zoom 事件
        this.chart.on('dataZoom', function(params) {
            try {
                const { startValue, endValue } = params.batch[0]
                const selectedTime = [chartData.xAxisData[startValue], chartData.xAxisData[endValue]].map(item => moment(new Date(item)).format('YYYY-MM-DD HH:mm:ss'))
                // 起止时间相同，结束时间延后一秒
                if (selectedTime.at() === selectedTime.at(-1)) {
                    selectedTime[1] = moment(new Date(getSecondsLaterByTime(selectedTime.at(), 1))).format('YYYY-MM-DD HH:mm:ss')
                }
                that.changeSelectedTime(selectedTime)
                that.$emit('selectChartTime', selectedTime)
                // 取消缩放
                that.chart.dispatchAction({
                    type: 'dataZoom',
                    start: 0,
                    end: 100
                })
            } catch (error) {
                // console.log(error)
            }
        })
        // 自动开启x轴区域选择功能
        this.chart.dispatchAction({
            type: 'takeGlobalCursor',
            key: 'dataZoomSelect',
            dataZoomSelectActive: true
        })
        // 点击每根柱子触发的事件
        this.chart.on('click', params => {
            console.log(params.name)
        })
    }
}
</script>

<style lang='scss' scoped>
.time-chart {
    width: 100%;
    height: 160px;
    position: relative;

    .time-chart-bottom {
        position: absolute;
        bottom: 12px;
        width: 100%;
        font-size: 13px;

        .line {
            height: 2px;
            background: #70b603;
            margin: 0 1% 0 1%;
        }

        .message {
            display: flex;
            justify-content: space-between;
            margin: 4px 1% 0 1%;

            .message-center {
                .search-time {
                    margin: 0 20px;
                }
            }
        }
    }
}
</style>
