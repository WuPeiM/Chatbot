function getLastMonthRange() {
    // 获取当前时间的年份和月份
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // 计算上个月的年份和月份
    let lastMonthYear, lastMonth
    if (month === 1) {
        lastMonthYear = year - 1
        lastMonth = 12
    } else {
        lastMonthYear = year
        lastMonth = month - 1
    }

    // 计算上个月的时间范围
    const lastMonthStartDate = new Date(`${lastMonthYear}-${lastMonth}-01`)
    const lastMonthEndDate = new Date(lastMonthYear, lastMonth, 0)
    lastMonthEndDate.setHours(23, 59, 59, 999)

    return {
        from: lastMonthStartDate,
        to: lastMonthEndDate,
        type: 'absolute'
    }
}

const getLastSecondsRange = (seconds) => {
    const now = new Date()
    const start = new Date(now.getTime() - seconds * 1000)
    return {
        from: start.toISOString(),
        to: now.toISOString(),
        type: 'absolute'
    }
}

/*
    * @Description: 获取时间参数
    * rangeType: 传入时间类型：custom/last_month/minute/hour/day
    * timeRange: 传入时间范围，当rangeType为custom时，传入时间范围，格式为：2020-01-01,2020-01-02
    * needRange: 是否返回时间范围，当为true时，全部返回from、to的时间范围对象
*/
export const getTimeParam: any = (rangeType: string, timeRange: string, needRange = false) => {
    const SECS = 60
    const RangeMap = {
        'minute': num => num * SECS,
        'hour': num => num * SECS * SECS,
        'day': num => num * 24 * SECS * SECS
    }
    if (rangeType === 'custom') {
        const { 0: from, 1: to } = timeRange.split(',')
        return {
            from: new Date(from).toISOString(),
            to: new Date(to).toISOString(),
            type: 'absolute'
        }
    }
    if (rangeType === 'last_month') {
        return getLastMonthRange() // 返回上个月的时间范围
    }

    const seconds = RangeMap[rangeType] && RangeMap[rangeType](timeRange)
    if (needRange && seconds) {
        return getLastSecondsRange(seconds)
    } else {
        return {
            type: 'relative',
            from: seconds
        }
    }
}
