import { get, post, put, deletes, reUrl } from '@/api/axiosconfig/axiosconfig'
// const reUrl = 'http://yapi.canway.top/mock/696'
export default {
    /**
     * 获取索引集
     *
     * @param {Object} params 请求参数
     */
    getIndexSets(params = {}) {
        return get(`${reUrl}/syslog/stream/index_sets/`, params)
    },
    /**
     * 获取分组列表
     *
     * @param {Object} params 请求参数
     */
    getLogGroup(params = {}) {
        return get(`${reUrl}/syslog/stream/paginated/`, params)
    },
    /**
     * 创建分组
     *
     * @param {Object} params 请求参数
     */
    createGroup(params = {}) {
        return post(`${reUrl}/syslog/stream/create/`, params)
    },
    /**
     * 编辑分组
     *
     * @param {Object} params 请求参数
     */
    modifyGroup(params: any = {}) {
        const { id, ...remain } = params
        return put(`${reUrl}/syslog/stream/update/${params.id}/`, remain)
    },
    /**
     * 克隆分组
     *
     * @param {Object} params 请求参数
     */
    cloneGroup(params: any = {}) {
        const { id, ...remain } = params
        return post(`${reUrl}/syslog/stream/clone/${params.id}/`, remain)
    },
    /**
     * 删除分组
     *
     * @param {Object} params 请求参数
     */
    deleteGroup(params: any = {}) {
        return deletes(`${reUrl}/syslog/stream/delete/${params.id}/`, '')
    },
    /**
     * 获取分组类型
     *
     * @param {Object} params 请求参数
     */
    getRuleTypes(params: any = {}) {
        return get(`${reUrl}/syslog/stream/rule_types/${params.id}/`, '')
    },
    /**
     * 获取系统字段
     *
     * @param {Object} params 请求参数
     */
    getFields(params = {}) {
        return get(`${reUrl}/syslog/stream/system_fields/`, params)
    },
    /**
     * 获取值
     *
     * @param {Object} params 请求参数
     */
    getInputs(params = {}) {
        return get(`${reUrl}/syslog/stream/system_inputs/`, params)
    },
    /**
     * 获取规则详情
     *
     * @param {Object} params 请求参数
     */
    getRulesDetail(params: any = {}) {
        return get(`${reUrl}/syslog/stream/detail/${params.id}/`, '')
    },
    /**
     * 新建规则
     *
     * @param {Object} params 请求参数
     */
    addRules(params: any = {}) {
        const { id, ...remain } = params
        return post(`${reUrl}/syslog/stream/add_rules/${params.id}/`, remain)
    },
    /**
     * 修改规则
     *
     * @param {Object} params 请求参数
     */
    modifyRules(params: any = {}) {
        const { id, ruleId, ...remain } = params
        return put(`${reUrl}/syslog/stream/update_rule/${params.id}/${params.ruleId}/`, remain)
    },
    /**
     * 删除规则
     *
     * @param {Object} params 请求参数
     */
    deleteRules(params: any = {}) {
        return deletes(`${reUrl}/syslog/stream/del_rule/${params.id}/${params.ruleId}/`, '')
    },
    /**
     * 查询规则
     *
     * @param {Object} params 请求参数
     */
    getLogMessage(params = {}) {
        return get(`${reUrl}/syslog/stream/relative/`, params)
    },
    /**
     * 验证规则
     *
     * @param {Object} params 请求参数
     */
    testMatch(params: any = {}) {
        const { id, ...remain } = params
        return post(`${reUrl}/syslog/stream/test_match/${params.id}/`, remain)
    },
    /**
     * 对角色授权日志分组
     *
     * @param {Object} params 请求参数
     */
    setRoleStreams(params: any = {}) {
        const { id, ...remain } = params
        return post(`${reUrl}/syslog/stream/role_streams/${params.id}/`, remain)
    },
    /**
     * 查询角色已经授权的日志分组
     *
     * @param {Object} params 请求参数
     */
    getRoleStreams(params: any = {}) {
        return get(`${reUrl}/syslog/stream/role_streams/${params.id}/`, {})
    },
    /**
     * 查询用户授权的日志分组
     *
     * @param {Object} params 请求参数
     */
    getUserStreams(params: any = {}) {
        return get(`${reUrl}/syslog/stream/user_streams/`, {})
    }
}
