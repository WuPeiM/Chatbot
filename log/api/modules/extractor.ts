import {get, post, put, deletes, reUrl} from '@/api/axiosconfig/axiosconfig'
// const reUrl = 'http://yapi.canway.top/mock/696'
export default {
    /**
     * 获取已配置的提取器
     *
     * @param {Object} params 请求参数
     */
    getExtractorsList(params: any = {}) {
        // 64c1df2b7f072e318ce6ff40
        return get(`${reUrl}/syslog/extractors/${params.id}/`, {})
    },
    /**
     *  加载最新消息
     *
     * @param {Object} params 请求参数
     */
    getUniversalRelative(params: any = {}) {
        return get(`${reUrl}/syslog/stream/relative/`, params)
    },
    /**
     *  删除提取器
     *
     * @param {Object} params 请求参数
     */
    deleteExtractor(params: any = {}) {
        return deletes(`${reUrl}/syslog/del_extractor/${params.receiverId}/${params.extractorId}/`, params)
    },
    /**
     *  测试字段是否包含字符串
     *
     * @param {Object} params 请求参数
     */
    testContainString(params: any = {}) {
        return post(`${reUrl}/syslog/tools/contains_string_tester/`, params)
    },
    /**
     *  测试字段是否匹配正则
     *
     * @param {Object} params 请求参数
     */
    testRegex(params: any = {}) {
        return post(`${reUrl}/syslog/tools/regex_tester/`, params)
    },
    /**
     *  创建提取器
     *
     * @param {Object} params 请求参数
     */
    createExtractor(params: any = {}) {
        return post(`${reUrl}/syslog/add_extractors/${params.receiverId}/`, params.body)
    },
    /**
     *  编辑取器
     *
     * @param {Object} params 请求参数
     */
    editExtractor(params: any = {}) {
        return put(`${reUrl}/syslog/update_extractor/${params.receiverId}/${params.extractorId}/`, params.body)
    },
    /**
     *  测试grok
     *
     * @param {Object} params 请求参数
     */
    grokTester(params: any = {}) {
        return post(`${reUrl}/syslog/tools/grok_tester/`, params)
    },
    /**
     *  获取grok列表
     *
     * @param {Object} params 请求参数
     */
    getGrokList(params: any = {}) {
        return get(`${reUrl}/syslog/tools/grok/`, {})
    },
    /**
     *  测试json
     *
     * @param {Object} params 请求参数
     */
    jsonTester(params: any = {}) {
        return post(`${reUrl}/syslog/tools/json_tester/`, params)
    },
    /**
     *  测试正则替换
     *
     * @param {Object} params 请求参数
     */
    regexReplaceTester(params: any = {}) {
        return post(`${reUrl}/syslog/tools/regex_replace_tester/`, params)
    },
    /**
     *  测试分割
     *
     * @param {Object} params 请求参数
     */
    splitTester(params: any = {}) {
        return post(`${reUrl}/syslog/tools/split_and_index_tester/`, params)
    },
    /**
     *  测试子串捕获
     *
     * @param {Object} params 请求参数
     */
    substringTester(params: any = {}) {
        return post(`${reUrl}/syslog/tools/substring_tester/`, params)
    },
    /**
     *  获取地区
     *
     * @param {Object} params 请求参数
     */
    getLocales(params: any = {}) {
        return get(`${reUrl}/syslog/tools/locales/`, {})
    },
    /**
     *  获取提取器详情
     *
     * @param {Object} params 请求参数
     */
    getExtractorDetail(params: any = {}) {
        return get(`${reUrl}/syslog/extractor_detail/${params.receiverId}/${params.extractorId}/`, {})
    },
    /**
     *  提取器排序
     *
     * @param {Object} params 请求参数
     */
    orderExtractors(params: any = {}) {
        return post(`${reUrl}/syslog/order_extractors/${params.id}/`, params.body)
    }
}
