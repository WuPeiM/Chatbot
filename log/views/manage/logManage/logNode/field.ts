export const AGENT_STATUS = {
    RUNNING: '正常',
    TERMINATED: '异常',
    NOT_INSTALLED: '未安装',
    UNKNOWN: '未知'
}

export const SIDECAR_ACTIONS = [
    {
        type: 'start',
        name: '启动'
    },
    {
        type: 'restart',
        name: '重启'
    },
    {
        type: 'stop',
        name: '停止'
    },
    {
        type: 'unload',
        name: '卸载'
    }
]

export const NODE_SEARCH_DATA = [
    {
        name: '内网IP',
        id: 'inner_ip'
    },
    {
        name: '主机名',
        id: 'bk_host_name'
    },
    {
        name: '所属应用',
        id: 'bk_biz_id',
        multiable: true,
        searchable: true
    }
]

export const NODE_COLUMNS = [
    {
        type: 'selection',
        width: '50px'
    },
    {
        label: '内网IP',
        key: 'inner_ip',
        align: 'left',
        minWidth: '120px',
        scopedSlots: 'ip'
    },
    {
        label: '主机名',
        key: 'bk_host_name',
        minWidth: '100px'
    },
    {
        label: '所属应用',
        key: 'bk_biz_name',
        minWidth: '100px'
    },
    {
        label: '操作系统',
        key: 'os_type',
        minWidth: '100px',
        scopedSlots: 'type',
        filters: [
            {
                text: 'Linux',
                value: 'LINUX'
            },
            {
                text: 'Windows',
                value: 'WINDOWS'
            }
        ],
        filterRemote: true
    },
    {
        label: 'Agent',
        key: 'agent',
        align: 'left',
        minWidth: '100px',
        scopedSlots: 'status'
    },
    {
        label: '安装方式',
        key: 'install_type',
        align: 'left',
        minWidth: '100px',
        scopedSlots: 'install_type'
    },
    {
        label: '控制器',
        key: 'sidecar_status',
        align: 'left',
        minWidth: '100px',
        scopedSlots: 'sidecar'
    }
]

export const SICECAR_STATUS = {
    '1': '安装中',
    '2': '安装失败',
    '3': '正常',
    '4': '异常',
    '5': '停止',
    '6': '卸载中',
    '7': '卸载失败'
}

export const SIDECAR_CAR_COLORS = {
    '1': '#3a84ff',
    '2': '#ea3636',
    '3': '#3fc06d',
    '4': '#ea3636',
    '5': '#b2b5bd',
    '6': '#3a84ff',
    '7': '#ea3636'
}

export const PROBE_STATUS_COLORS = {
    '1': '#b2b5bd',
    '2': '#3a84ff',
    '3': '#ea3636',
    '4': '#b2b5bd',
    '5': '#3a84ff',
    '6': '#3fc06d',
    '7': '#ea3636',
    '8': '#3a84ff',
    '9': '#ea3636'
}

export const PROBE_STATUS = {
    '1': '未安装',
    '2': '安装中',
    '3': '安装失败',
    '4': '未启动',
    '5': '启动中',
    '6': '正常',
    '7': '异常',
    '8': '卸载中',
    '9': '卸载失败'
}

export const AGENT_STATUS_COLORS = {
    RUNNING: '#3fc06d',
    TERMINATED: '#ea3636',
    NOT_INSTALLED: '#b2b5bd',
    UNKNOWN: '#b2b5bd'
}

export const HOST_RESOURCE_COLUMNS = [
    {
        type: 'selection',
        width: '50px',
        selectable: row => {
            return !row.disable
        }
    },
    {
        label: '内网IP',
        key: 'inner_ip',
        align: 'left',
        minWidth: '96px'
    },
    {
        label: '主机名',
        key: 'bk_host_name',
        align: 'left',
        width: '94px'
    },
    {
        label: '应用',
        key: 'bk_biz_id',
        align: 'left',
        width: '94px',
        scopedSlots: 'biz'
    },
    {
        label: '操作系统类型',
        key: 'os_type',
        align: 'left',
        minWidth: '100px',
        scopedSlots: 'type',
        filters: [
            {
                text: 'Linux',
                value: 'LINUX'
            },
            {
                text: 'Windows',
                value: 'WINDOWS'
            }
        ],
        filterRemote: true
    },
    {
        label: 'Agent状态',
        key: 'status',
        align: 'left',
        minWidth: '90px',
        scopedSlots: 'status'
        // filters: [
        //     {
        //         text: '正常',
        //         value: 'RUNNING'
        //     },
        //     {
        //         text: '异常',
        //         value: 'TERMINATED'
        //     },
        //     {
        //         text: '未安装',
        //         value: 'NOT_INSTALLED'
        //     },
        //     {
        //         text: '未知',
        //         value: 'UNKNOWN'
        //     }
        // ],
        // filterRemote: true
    }
]

export const PROBE_ACTIONS_MAPS = {
    'install': '安装探针',
    'start': '启动探针',
    'config': '修改配置',
    'restart': '重启探针',
    'stop': '停止探针',
    'unload': '卸载探针'
}

export const COLLECTION_CONFIG_COLUMNS = [
    {
        label: '配置名称',
        key: 'name',
        align: 'left',
        minWidth: '120px'
    },
    {
        label: '探针类型',
        key: 'collector_name',
        minWidth: '100px'
    },
    {
        label: '操作系统',
        key: 'os_type',
        minWidth: '100px',
        filters: [
            {
                text: 'linux',
                value: 'linux'
            },
            {
                text: 'windows',
                value: 'windows'
            }
        ],
        filterRemote: true,
        filterMultiple: false
    },
    {
        label: '已用节点',
        key: 'use_nodes',
        align: 'left',
        minWidth: '100px',
        scopedSlots: 'node'
    },
    {
        label: '操作',
        key: 'operation',
        align: 'left',
        width: '200px',
        scopedSlots: 'operation'
    }
]

export const CONTRILLER_COMMAND_LIST = {
    restart: [
        {
            title: 'Windows：重启控制器',
            content: '直接在服务页面进行“sidecar”服务的“重新启动”'
        }, {
            title: 'Linux：运行以下命令，重启控制器',
            content: 'systemctl restart sidecar'
        }
    ],
    stop: [
        {
            title: 'Windows：停止控制器',
            content: '直接在服务页面进行“sidecar”服务的“停止”'
        }, {
            title: 'Linux：运行以下命令，停止控制器',
            content: 'systemctl stop sidecar'
        }
    ],
    unload: [
        {
            title: 'Windows：运行以下命令，卸载控制器',
            content: '.\\uninstall_sidecar.bat'
        }, {
            title: 'Linux：运行以下命令，卸载控制器',
            content: 'curl -sSL "${host}/openapi/download_file/?file_name=uninstall_sidecar.sh" | bash -s'
        }
    ]
}
