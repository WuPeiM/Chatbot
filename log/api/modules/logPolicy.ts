import {get, put, post, deletes, reUrl} from '@/api/axiosconfig/axiosconfig'
// const reUrl = 'http://yapi.canway.top/mock/1273'
export default {
    /**
     * 获取日志策略列表
     *
     * @param {Object} params 请求参数
     */
    getLogPolicyList(params = {}) {
        return get(`${reUrl}/syslog/events/definitions/`, params)
    },
    /**
     * 启动告警策略
     *
     * @param {Object} params 请求参数
     */
    startPolicy(params: any = {}) {
        return put(`${reUrl}/syslog/events/definitions/${params.id}/schedule/`, params)
    },
    /**
     * 停止告警策略
     *
     * @param {Object} params 请求参数
     */
    stopPolicy(params: any = {}) {
        return put(`${reUrl}/syslog/events/definitions/${params.id}/unschedule/`, params)
    },
    /**
     * 批量启动告警策略
     *
     * @param {Object} params 请求参数
     */
    batchStartPolicy(params: any = {}) {
        return put(`${reUrl}/syslog/events/definitions/batch_schedule/`, params)
    },
    /**
     * 批量禁用告警策略
     *
     * @param {Object} params 请求参数
     */
    batchStopPolicy(params: any = {}) {
        return put(`${reUrl}/syslog/events/definitions/batch_unschedule/`, params)
    },
    /**
     * 删除告警策略
     *
     * @param {Object} params 请求参数
     */
    deletePolicy(params: any = {}) {
        return deletes(`${reUrl}/syslog/events/definitions/${params.id}/`, params)
    },
    /**
     * 创建告警策略
     *
     * @param {Object} params 请求参数
     */
    createPolicy(params: any = {}) {
        return post(`${reUrl}/syslog/events/definitions/`, params)
    },
    /**
     * 查询告警策略详情
     *
     * @param {Object} params 请求参数
     */
    getPolicyDetail(params: any = {}) {
        return get(`${reUrl}/syslog/events/definitions/${params.id}/`, params)
    },
    /**
     * 修改告警策略
     *
     * @param {Object} params 请求参数
     */
    editPolicy(params: any = {}) {
        return put(`${reUrl}/syslog/events/definitions/${params.id}/`, params.body)
    },
    /**
     * 查询函数条件列表
     *
     * @param {Object} params 请求参数
     */
    getEntityTypes(params: any = {}) {
        return get(`${reUrl}/syslog/events/entity_types/`, params)
    }
}
