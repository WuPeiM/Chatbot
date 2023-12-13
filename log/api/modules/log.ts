import {get, post, put, deletes, reUrl} from '@/api/axiosconfig/axiosconfig'
// const reUrl = 'http://yapi.canway.top/mock/1273'
export default {
    /**
     * 查询日志
     *
     * @param {Object} params 请求参数
     */
    getLogData(params: any = {}, config: any) {
        const newParams = { parameter_bindings: {}, ...params, id: undefined }
        return post(`${reUrl}/syslog/views/search/${params.id}/execute/`, newParams, config)
    },
    /**
     * 获取所有的日志字段
     *
     * @param {Object} params 请求参数
     */
    getLogFields(params = {}) {
        return post(`${reUrl}/syslog/views/fields/`, params)
    },
    /**
     * 获取所有的搜索条件
     *
     * @param {Object} params 请求参数
     */
    getSearchCondition(params = {}) {
        return get(`${reUrl}/syslog/search/saved/`, params)
    },
    /**
     * 删除搜索条件
     *
     * @param {Object} params 请求参数
     */
    delSearchCondition(params: any = {}) {
        return deletes(`${reUrl}/syslog/delete_views/${params.id}/`, '')
    },
    /**
     * 更新搜索条件
     *
     * @param {Object} params 请求参数
     */
    updateCondition(params: any = {}) {
        return put(`${reUrl}/syslog/update_views/${params.id}/`, params)
    },
    /**
     * 保留搜索条件
     *
     * @param {Object} params 请求参数
     */
    createCondition(params = {}) {
        return post(`${reUrl}/syslog/create_views/`, params)
    },
    /**
     * 生成搜索id
     *
     * @param {Object} params 请求参数
     */
    createSearchId(params = {}, config: any) {
        return post(`${reUrl}/syslog/views/search/`, params, config)
    },
    /**
     * 视图条件搜索查询
     *
     * @param {Object} params 请求参数
     */
    getLogViewCondition(params: any = {}) {
        return get(`${reUrl}/syslog/view_condition/${params.id}/`, params)
    },
    /**
     * 生成下载日志id
     *
     * @param {Object} params 请求参数
     */
    createDownloadId(params: any = {}) {
        return post(`${reUrl}/syslog/create_import_job/${params.id}/${params.typeId}/`, params.body)
    },
    /**
     * 根据日志id导出日志
     *
     * @param {Object} params 请求参数
     */
    downloadLog(params: any = {}) {
        return get(`${reUrl}/syslog/download_files/${params.id}/${params.name}/`, params)
    },
    /**
     * 根据日志id导出日志
     *
     * @param {Object} params 请求参数
     */
    getViewDetail(params: any = {}) {
        return get(`${reUrl}/syslog/view_detail/${params.id}/`)
    },
    /**
     * 日志搜索建议
     *
     * @param {Object} params 请求参数
     */
    getSearchSuggestion(params: any = {}) {
        return post(`${reUrl}/syslog/suggest/`, params)
    },
    /**
     * 获取日志聚类列表
     *
     * @param {Object} params 请求参数
     */
    getLogClusterData(params = {}) {
        return post(`${reUrl}/syslog/log_clustering/`, params)
    }
}
