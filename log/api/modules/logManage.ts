import {get, post, put, deletes, reUrl} from '@/api/axiosconfig/axiosconfig'
// const reUrl = 'http://yapi.canway.top/mock/696'
export default {
    /**
     * 获取全部接收器分类
     *
     * @param {Object} params 请求参数
     */
    getAllTypes(params = {}) {
        return get(`${reUrl}/syslog/system/inputs/types/all/`, params)
    },
    /**
     * 获取接收器节点数据
     *
     * @param {Object} params 请求参数
     */
    getClusterNodes(params = {}) {
        return get(`${reUrl}/syslog/system/cluster/nodes/`, params)
    },
    /**
     * 获取所有展示接收器数据
     *
     * @param {Object} params 请求参数
     */
    getClusterList(params = {}) {
        return get(`${reUrl}/syslog/system/inputs/`, params)
    },
    /**
     * 开启新的接收器
     *
     * @param {Object} params 请求参数
     */
    createCluster(params = {}) {
        return post(`${reUrl}/syslog/system/inputs/`, params)
    },
    /**
     * 获取接收器详情
     *
     * @param {Object} params 请求参数
     */
    getClusterDetail(params: any = {}) {
        return get(`${reUrl}/syslog/system/inputs/${params.id}/`, {})
    },
    /**
     * 修改接收器
     *
     * @param {Object} params 请求参数
     */
    editCluster(params: any = {}) {
        return put(`${reUrl}/syslog/system/inputs/${params.id}/`, params.body)
    },
    /**
     * 删除接收器
     *
     * @param {Object} params 请求参数
     */
    deleteCluster(params: any = {}) {
        return deletes(`${reUrl}/syslog/system/inputs/${params.id}/`, {})
    },
    /**
     * 获取接受器状态
     *
     * @param {Object} params 请求参数
     */
    getClusterStates(params = {}) {
        return get(`${reUrl}/syslog/cluster/inputstates/`, params)
    },
    /**
     * 添加静态字段
     *
     * @param {Object} params 请求参数
     */
    addStaticFields(params: any = {}) {
        return post(`${reUrl}/syslog/system/inputs/${params.id}/staticfields/`, params.body)
    },
    /**
     * 删除静态字段
     *
     * @param {Object} params 请求参数
     */
    deleteStaticFields(params: any = {}) {
        return deletes(`${reUrl}/syslog/system/inputs/${params.id}/staticfields/${params.key}/`, {})
    },
    /**
     * 获取所有的接收器指标消息数据
     *
     * @param {Object} params 请求参数
     */
    getAllClusterMetrics(params: any = {}) {
        return post(`${reUrl}/syslog/cluster/metrics/multiple/`, params)
    },
    /**
     * 停止接收
     *
     * @param {Object} params 请求参数
     */
    stopReceive(params: any = {}) {
        return deletes(`${reUrl}/syslog/cluster/inputstates/${params.id}/`, params)
    },
    /**
     * 启动接收
     *
     * @param {Object} params 请求参数
     */
    startReceive(params: any = {}) {
        return put(`${reUrl}/syslog/cluster/inputstates/${params.id}/`, params)
    },
    /**
     * 导入日志
     *
     * @param {Object} params 请求参数
     */
    importLog(params: any = {}) {
        return post(`${reUrl}/syslog/import/`, params)
    }
}
