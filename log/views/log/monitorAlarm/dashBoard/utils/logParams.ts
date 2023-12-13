import { DIRECTION_LIST } from '../views'
import { v4 as uuidv4 } from 'uuid'

export const dealCommonParams = (logParams: any = {}) => {
    const { group = [], measure = [], order = [], columnRollup: rollup } = logParams
    const targetObj: any = {
        id: uuidv4(),
        rollup,
        name: 'chart',
        type: 'pivot',
        series: measure.map(({ type, field, percentile, name }) => ({
            field: field || undefined,
            type,
            percentile,
            id: name || `${type}(${field || ''}${percentile ? `,${percentile}` : ''})`
        })),
        sort: order.map(({ field, orderType, type }) => ({
            field: field || undefined,
            direction: orderType,
            type
        }))
    }
    DIRECTION_LIST.forEach(({ type }) => {
        targetObj[`${type}_groups`] = group.filter(el => el.direction === type)
            .map(({ field, isDateType, duration, unit, limit }) => {
                const newEl = {
                    field: field || undefined,
                    type: isDateType ? 'time' : 'values',
                    limit: undefined,
                    interval: undefined
                }
                // 日期类型和其他类型传参处理
                if (isDateType) {
                    newEl.interval = {
                        timeunit: `${duration}${unit.substr(0, 1)}`,
                        type: 'timeunit',
                        scaling: undefined
                    }
                } else {
                    newEl.limit = limit
                }
                return newEl
            })
    })
    return targetObj
}

export const dealTrendParams = (commonParams: any) => {
    const { id, series, row_groups: rows, column_groups: cols } = commonParams
    const targetObj: any = {
        id: uuidv4(),
        name: 'trend',
        timerange: {
            id,
            source: 'search_type',
            type: 'offset'
        },
        rollup: true,
        streams: [],
        sort: [],
        series,
        row_groups: rows,
        column_groups: cols,
        type: 'pivot'
    }
    return targetObj
}

export const reverseDealLogParams = (params: any) => {
    const { id, rollup, series, sort, row_groups: rows, column_groups: cols } = params
    const rowFields = new Set(rows ? rows.map(row => row.field) : [])
    const group = [...(rows || []), ...(cols || [])].map(({ field, type, limit, interval }) => {
        const newEl = {
            field: field || undefined,
            direction: undefined,
            isDateType: undefined,
            duration: undefined,
            unit: undefined,
            limit: undefined
        }
        // 日期类型和其他类型传参处理
        if (type === 'time') {
            newEl.isDateType = true
            if (interval && interval.timeunit) {
                newEl.duration = interval.timeunit.substr(0, interval.timeunit.length - 1)
                newEl.unit = interval.timeunit.substr(-1)
            }
        } else {
            newEl.limit = limit
        }
        // 使用 Set 来判断 field 是否在 rows 或者 cols 中出现
        newEl.direction = rowFields.has(field) ? 'row' : 'column'
        return newEl
    })
    const targetObj: any = {
        group,
        measure: (series || []).map(({ type, field, percentile, id: name }) => ({
            type,
            field: field || undefined,
            percentile,
            name,
            isPercentile: !!percentile
        })),
        order: (sort || []).map(({ field, direction, type }) => ({
            field: field || undefined,
            orderType: direction,
            type
        })),
        columnRollup: rollup,
        id
    }
    return targetObj
}

export const dealMapParams = (logParams: any) => {
    return {
        query: {
            type: 'elasticsearch',
            query_string: ''
        },
        name: 'chart',
        timerange: {
            type: 'relative',
            range: 0
        },
        streams: [],
        series: [
            {
                id: `count(${logParams.localeField})`,
                type: 'count',
                field: logParams.localeField
            }
        ],
        rollup: true,
        row_groups: [
            {
                type: 'values',
                field: logParams.localeField,
                limit: 250
            }
        ],
        type: 'pivot',
        id: uuidv4(),
        column_groups: [],
        sort: []
    }
}
