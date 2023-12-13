import api from '@/api/index'
import { getTimeParam } from './timeParam'
import Vue from 'vue'

const handleTime = (val) => {
    return Vue.prototype.$FormatTime('yyyy-MM-dd hh:mm:ss', val)
}
export const getTrinoResult = async(content: string, rangeType: string, timeRange: string, conditionParamsValue: any) => {
    if (!content) return
    // 将 $DATE_START$ 和 $DATE_END$ 替换成当前选中的时间
    const { from, to } = getTimeParam(rangeType, timeRange, true)
    const replacements = {
        'DATE_START': handleTime(from),
        'DATE_END': handleTime(to),
        ...conditionParamsValue
    }
    let sql = content
    for (const key in replacements) {
        const value = replacements[key]
        const regex = new RegExp('\\$' + key + '\\$', 'g')
        // 判断如果value是数组的话,转成('xx', 'yy'的格式)
        if (Array.isArray(value)) {
            const formattedValue = `('${value.join('\', \'')}')`
            sql = sql.replace(regex, formattedValue)
        } else {
            sql = sql.replace(regex, value)
        }
    }
    const { result, message, data } = await api.dashBoard.getMetricPoint({ sql })
    if (!result) return Vue.prototype.$error(message)
    return data
}
