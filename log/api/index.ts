// 统一引入api模块
// 模块
import log from './modules/log'
// 日志策略
import logPolicy from './modules/logPolicy'
// 日志管理
import logManage from './modules/logManage'
// 日志节点
import logNode from './modules/logNode'
// 日志分组
import logGroup from './modules/logGroup'
// 提取器
import extractor from './modules/extractor'
// 索引集
import indexSet from './modules/indexSet'
const logApi = {
    log,
    logPolicy,
    logManage,
    logNode,
    logGroup,
    extractor,
    indexSet
}
export default logApi
