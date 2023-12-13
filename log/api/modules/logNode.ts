import { get, post, deletes, put, reUrl } from '@/api/axiosconfig/axiosconfig'
// const reUrl = 'http://yapi.canway.top/mock/2511'
export default {
    // 创建探针节点
    createProbeNode(params = {}) {
        return post(`${reUrl}/syslog/probe/node/create/`, params)
    },
    getProbeList(params = {}) {
        return get(`${reUrl}/syslog/probe/list/`, params)
    },
    // 查询探针节点列表
    getNodeList(params = {}) {
        return post(`${reUrl}/syslog/probe/node/list/`, params)
    },
    // 主机列表
    getHostList(params = {}) {
        return post(`${reUrl}/syslog/probe/host/`, params)
    },
    // 操作控制器
    sidecarAction(params = {}) {
        return post(`${reUrl}/syslog/probe/sidecar/action/`, params)
    },
    // 操作探针
    probeAction(params = {}) {
        return post(`${reUrl}/syslog/probe/action/`, params)
    },
    // 采集配置列表
    getConfigurations(params = {}) {
        return post(`${reUrl}/syslog/collectors_config/get_configurations/`, params)
    },
    // 创建采集配置
    createConfigurations(params = {}) {
        return post(`${reUrl}/syslog/collectors_config/configurations/`, params)
    },
    // 删除采集器配置
    deleteConfigurations(params = {}) {
        return deletes(`${reUrl}/syslog/collectors_config/${params['id']}/configurations/`, params)
    },
    // 复制采集器配置
    copyConfigurations(params = {}) {
        return post(`${reUrl}/syslog/collectors_config/copy_configurations/`, params)
    },
    // 修改采集器配置
    updateConfigurations(params: any = {}) {
        return put(`${reUrl}/syslog/collectors_config/update_configurations/`, params)
    },
    // 查询使用节点的数据列表
    getUseNode(params: any = {}) {
        return post(`${reUrl}/syslog/collectors_config/get_use_nodes/`, params)
    },
    // 查询指定id的采集器配置
    getConfigurationsById(params: any = {}) {
        return get(`${reUrl}/syslog/collectors_config/configurations/${params.id}/`, params)
    },
    // 节点采集器应用配置
    associativeConfiguration(params: any = {}) {
        return post(`${reUrl}/syslog/collectors_config/associative_configuration/`, params)
    },
    // 查询未使用节点的数据
    getNoUsedNodes(params: any = {}) {
        return post(`${reUrl}/syslog/collectors_config/nodes/`, params)
    },
    // 手动安装：根据节点名称查询sidecar信息
    searchSidecar(params: any = {}) {
        return post(`${reUrl}/syslog/probe/search_sidecar/`, params)
    },
    // 手动安装：获取手动安装步骤
    getInstallStep(params: any = {}) {
        return post(`${reUrl}/syslog/probe/install_steps/`, params)
    },
}
