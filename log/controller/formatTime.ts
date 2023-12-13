// 获取几分钟前到现在的时间
export const getMinutesAgoToNow = (minutes) => {
    const now = new Date()
    const minutesAgo = new Date(now.getTime() - minutes * 60 * 1000)
    return [minutesAgo, now]
}
// 获取几分钟前到某个点的时间，和某个点到几分钟后的时间
export const getBeforeAndAfterTime = (time, minutes) => {
    const now = new Date(time)
    const minutesAgo = new Date(now.getTime() - minutes * 60 * 1000)
    const minutesAfter = new Date(now.getTime() + minutes * 60 * 1000)
    return [minutesAgo, minutesAfter]
}
// 获取当天0点0分0秒的时间
export const getTodayToNow = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return [today, now]
}
// 获取本周一的时间
export const getCurrentWeekToNow = () => {
    const now = new Date()
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1)
    return [monday, now]
}
// 获取本月1号的时间
export const getFirstDayToNow = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return [firstDay, now]
}
// 根据相对时间获取绝对时间
export const getAbsoluteTime = (from, to: number = 0) => {
    const now = new Date()
    const current = new Date(now.getTime() - to * 60 * 1000)
    const minutesAgo = new Date(now.getTime() - from * 60 * 1000)
    return [minutesAgo, current]
}
// 获取某个点几秒钟后的时间
export const getSecondsLaterByTime = (time, seconds) => {
    const now = new Date(time)
    const minutesLater = new Date(now.getTime() + seconds * 1000)
    return minutesLater
}
