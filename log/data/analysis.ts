/*
*  统计分析面板
*  作者：qiu
*  日期：2023.09.05
*  说明：有关统计分析的参数设计,包括编辑视图和查询视图
* */

export const logParamsForAnalysis = {
    logGroup: [],
    aceEditorVal: '*',
    columnRollup: true,
    group: [],
    measure: [],
    order: [],
    barMode: 'group',
    trendChecked: false,
    trendDirect: 'up'
}

// 除了long类型的字段，其他字段都以一下字段为函数作为度量
// count: 计数, card: 基数
export const normalMeasure = ['count', 'card']

// count: 计数, sum: 求和, avg: 平均值, min: 最小值, max: 最大值, stddev: 标准差, variance: 方差, card: 基数, percentile: 百分位
export const logTypeMeasure = ['count', 'sum', 'avg', 'min', 'max', 'stddev', 'variance', 'card', 'percentile']

/*
    判断type为long的话,度量函数为logTypeMeasure,否则为normalMeasure
    logParamsForAnalysis.measure 参考一下对象结构 {
        "type": "count",
        "field": "filebeat_log_offset",
        "name": "",
        "isPercentile": false
    }
    id作为logParamsForAnalysis.measure数组中每个对象的field的值
    其中生成logParamsForAnalysis.measure时,判断如果logTypeMeasure有百分位的话,对象里面添加一个字段为percentile, 值为95
    最后return回logParamsForAnalysis
*/
export const getLogParamsForAnalysis = (id: string, type: string) => {
    const measure = type === 'long' ? logTypeMeasure : normalMeasure
    return {
        ...logParamsForAnalysis,
        measure: measure.map(item => ({
            type: item,
            field: id,
            name: '',
            isPercentile: item === 'percentile',
            ...(item === 'percentile' ? { percentile: 95 } : {})
        }))
    }
}
