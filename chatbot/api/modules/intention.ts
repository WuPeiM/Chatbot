import {get, post, deletes} from '@/api/axiosconfig/axiosconfig'

export default {
    getIntentions(params = {}) {
        return get('url', params)
    },
    deleteIntention(params = {}) {
        return deletes('url', params)
    }
}
