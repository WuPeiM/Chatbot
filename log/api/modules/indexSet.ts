import { get, deletes, put, post, reUrl } from '@/api/axiosconfig/axiosconfig'
// const reUrl = 'http://yapi.canway.top/mock/2511'
export default {
    // 设置默认索引
    setDefaultIndex(params: any = {}) {
        return put(`${reUrl}/syslog/index/default/${params.id}/`, params.body)
    },
    // 删除索引
    deleteIndex(params: any = {}) {
        return deletes(`${reUrl}/syslog/index/delete/${params.id}/`, params.body)
    },
    // 创建索引
    createIndex(params: any = {}) {
        return post(`${reUrl}/syslog/index/create/`, params)
    },
    // 修改索引
    updateIndex(params: any = {}) {
        return put(`${reUrl}/syslog/index/update/${params.id}/`, params.body)
    },
    // 获取索引集详情
    getIndexSetDetail(params: any = {}) {
        return get(`${reUrl}/syslog/index/index_set/${params.id}/`, {})
    },
    // 重新计算索引范围
    reCalculateIndexRange(params: any = {}) {
        return post(`${reUrl}/syslog/index/index_rebuild/${params.index}/`, {})
    },
    // 重新打开索引
    reOpenIndex(params: any = {}) {
        return post(`${reUrl}/syslog/index/index_reopen/${params.index}/`, {})
    },
    // 关闭索引
    closeIndex(params: any = {}) {
        return post(`${reUrl}/syslog/index/index_close/${params.index}/`, {})
    },
    // 删除索引
    deleteIndexSet(params: any = {}) {
        return deletes(`${reUrl}/syslog/index/index_delete/${params.index}/`, {})
    },
    // 更新索引集范围
    updateIndexSetRange(params: any = {}) {
        return post(`${reUrl}/syslog/index/index_set_rebuild/${params.id}/`, {})
    },
    // 创建新索引
    createNewIndex(params: any = {}) {
        return post(`${reUrl}/syslog/index/create_index/${params.id}/`, {})
    },
    // 获取索引集的索引数据
    getIndexSetIndexData(params: any = {}) {
        return get(`${reUrl}/syslog/index/index_set_overview/${params.id}/`, {})
    },
    // 获取索引集的分类索引数据
    getIndexSetCategoryIndexData(params: any = {}) {
        return get(`${reUrl}/syslog/index/index_list/${params.id}/`, {})
    },
    // 查询索引的详细信息
    getIndexDetail(params: any = {}) {
        return post(`${reUrl}/syslog/index/indexs_multiple/`, params)
    },
    // 获取全局索引集
    getGlobalIndexSet(params: any = {}) {
        return get(`${reUrl}/syslog/index/index_sets_stats/`, {})
    }
}
