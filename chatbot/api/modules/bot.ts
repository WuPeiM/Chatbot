import { get, post, deletes, put, reUrl } from '@/api/axiosconfig/axiosconfig'

// const mockUrl = 'http://yapi.canway.top/mock/1273' // 你可以使用yapi进行mock数据

export default {
    // getList(params = {}) {
    //     return get(`${mockUrl}/example/list/`, params)
    // },
    // modifyList(params = {}) {
    //     return post(`${mockUrl}/example/list/`, params)
    // }
    getBot(params = {}) {
        return get(`${reUrl}/app_bot/bot/`, params)
    },
    searchBot(params = '') {
        return get(`${reUrl}/id`, params)
    },
    addBot(params = {}) {
        return post(`${reUrl}/app_bot/bot/create/`, params)
    },
    editBot(id, params = {}) {
        return put(`${reUrl}/app_bot/bot/update/${id}`, params)
    },
    deleteBot(id: string) {
        return deletes(`${reUrl}/app_bot/bot/delete/${id}/`)
    }
}
