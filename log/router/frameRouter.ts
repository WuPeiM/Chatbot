// 日志
const Log = () => import('@log/views/log/index.vue')
// 数据接收
const DataReceive = () => import('@log/views/manage/logManage/dataReceive/index.vue')
// // 日志监控
// const LogMonitor = () => import('@log/views/manage/logManage/logMonitor/index.vue')
// const OperatePolicy = () => import('@log/views/manage/logManage/logMonitor/components/operatePolicy.vue')
// // 日志节点
// const LogNode = () => import('@log/views/nodeManage/logNode.vue')
// // 采集配置
// const CollectionConfig = () => import('@log/views/manage/collectionConfig/index.vue')
// const AddConfig = () => import('@log/views/manage/collectionConfig/addConfig.vue')
// const TempConfig = () => import('@log/views/manage/collectionConfig/tempConfig.vue')
// // 日志分组
// const LogGroup = () => import('@log/views/manage/logGroup/index.vue')
// // 日志分组规则
// const GroupRules = () => import('@log/views/manage/logGroup/groupRules.vue')
const Extractor = () => import('@log/views/manage/extractor/index.vue')
const OperateExtractor = () => import('@log/views/manage/extractor/components/operateExtractor.vue')
// const IndexSet = () => import('@log/views/manage/indexSet/index.vue')
// const IndexSetDetail = () => import('@log/views/manage/indexSet/components/indexSetDetail.vue')
const routerPrefix = 'log'
export const frameRouter = [
    {
        path: `/${routerPrefix}`,
        name: 'Log',
        component: Log,
        meta: {
            title: '日志'
        }
    },
    // {
    //     path: '/manage/logManage/indexSet',
    //     name: 'IndexSet',
    //     component: IndexSet,
    //     meta: {
    //         title: '索引集'
    //     }
    // },
    // {
    //     path: '/manage/logManage/indexSetDetail',
    //     name: 'IndexSetDetail',
    //     component: IndexSetDetail,
    //     meta: {
    //         title: '索引集详情',
    //         activeMenu: 'IndexSet',
    //         parentIds: ['IndexSet']
    //     }
    // },
    {
        path: '/manage/logManage/extractor',
        name: 'Extractor',
        component: Extractor,
        meta: {
            title: '管理提取器',
            activeMenu: 'DataReceive',
            parentIds: ['DataReceive']
        }
    },
    {
        path: '/manage/logManage/AddExtractor',
        name: 'AddExtractor',
        component: OperateExtractor,
        meta: {
            title: '新建提取器',
            activeMenu: 'DataReceive',
            parentIds: ['DataReceive']
        }
    },
    {
        path: '/manage/logManage/EditExtractor',
        name: 'EditExtractor',
        component: OperateExtractor,
        meta: {
            title: '编辑提取器',
            activeMenu: 'DataReceive',
            parentIds: ['DataReceive']
        }
    },
    {
        path: '/manage/logManage/dataReceive',
        name: 'DataReceive',
        component: DataReceive,
        meta: {
            title: '数据接收'
        }
    }
    // {
    //     path: '/manage/logManage/logMonitor',
    //     name: 'LogMonitor',
    //     component: LogMonitor,
    //     meta: {
    //         title: '日志监控'
    //     }
    // },
    // {
    //     path: '/manage/logManage/addLogPolicy',
    //     name: 'AddLogPolicy',
    //     component: OperatePolicy,
    //     meta: {
    //         title: '新增监控策略',
    //         activeMenu: 'LogMonitor',
    //         parentIds: ['LogMonitor']
    //     }
    // },
    // {
    //     path: '/manage/logManage/editLogPolicy',
    //     name: 'EditLogPolicy',
    //     component: OperatePolicy,
    //     meta: {
    //         title: '编辑监控策略',
    //         activeMenu: 'LogMonitor',
    //         parentIds: ['LogMonitor']
    //     }
    // },
    // {
    //     path: '/manage/nodeManage/logNode',
    //     name: 'LogNode',
    //     component: LogNode,
    //     meta: {
    //         title: '日志节点'
    //     }
    // },
    // {
    //     path: '/manage/logManage/collectionConfig',
    //     name: 'CollectionConfig',
    //     component: CollectionConfig,
    //     meta: {
    //         title: '采集配置'
    //     }
    // },
    // {
    //     path: '/manage/logManage/addConfig',
    //     name: 'AddConfig',
    //     component: AddConfig,
    //     meta: {
    //         title: '新增配置',
    //         activeMenu: 'CollectionConfig',
    //         parentIds: ['CollectionConfig']
    //     }
    // },
    // {
    //     path: '/manage/logManage/tempConfig',
    //     name: 'TempConfig',
    //     component: TempConfig,
    //     meta: {
    //         title: '配置页面',
    //         activeMenu: 'CollectionConfig',
    //         parentIds: ['CollectionConfig']
    //     }
    // },
    // {
    //     path: '/manage/logManage/customConfig',
    //     name: 'CustomConfig',
    //     component: TempConfig,
    //     meta: {
    //         title: '自定义配置',
    //         activeMenu: 'CollectionConfig',
    //         parentIds: ['CollectionConfig']
    //     }
    // },
    // {
    //     path: '/manage/logManage/updateConfig',
    //     name: 'UpdateConfig',
    //     component: TempConfig,
    //     meta: {
    //         title: '修改配置',
    //         activeMenu: 'CollectionConfig',
    //         parentIds: ['CollectionConfig']
    //     }
    // },
    // {
    //     path: '/manage/logManage/logGroup',
    //     name: 'LogGroup',
    //     component: LogGroup,
    //     meta: {
    //         title: '日志分组'
    //     }
    // },
    // {
    //     path: '/manage/logManage/logGroup/groupRules',
    //     name: 'GroupRules',
    //     component: GroupRules,
    //     meta: {
    //         title: '管理规则',
    //         activeMenu: 'LogGroup',
    //         parentIds: ['LogGroup']
    //     }
    // }
]

// 导航栏
export const adminRouteConfig = [
    {
        name: '日志',
        id: 'Log',
        icon: 'cw-icon weops-log-fill',
        sortIndex: 2,
        auth: [
            {
                key: 'checkAuth',
                value: false,
                label: '查看',
                type: 'check'
            }
        ]
    }
]

export const manageMenu = [
    // {
    //     name: '节点管理',
    //     id: 'NodeManage',
    //     icon: 'cw-icon weops-node-manage',
    //     sortIndex: 0,
    //     auth: [
    //         {
    //             key: 'checkAuth',
    //             value: false,
    //             label: '查看',
    //             type: 'check'
    //         },
    //         {
    //             key: 'operateAuth',
    //             value: false,
    //             label: '操作',
    //             type: 'operate'
    //         }
    //     ],
    //     children: [
    //         {
    //             name: '日志节点',
    //             id: 'LogNode',
    //             icon: 'cw-icon weops-log-node',
    //             sortIndex: 2,
    //             auth: [
    //                 {
    //                     key: 'checkAuth',
    //                     value: false,
    //                     label: '查看',
    //                     type: 'check'
    //                 },
    //                 {
    //                     key: 'operateAuth',
    //                     value: false,
    //                     label: '操作',
    //                     type: 'operate'
    //                 }
    //             ]
    //         }
    //     ]
    // },
    {
        name: '日志管理',
        id: 'LogManage',
        icon: 'cw-icon weops-operation-log-fill',
        sortIndex: 1.1,
        auth: [
            {
                key: 'checkAuth',
                value: false,
                label: '查看',
                type: 'check'
            },
            {
                key: 'operateAuth',
                value: false,
                label: '操作',
                type: 'operate'
            }
        ],
        children: [
            // {
            //     name: '日志分组',
            //     id: 'LogGroup',
            //     auth: [
            //         {
            //             key: 'checkAuth',
            //             value: false,
            //             label: '查看',
            //             type: 'check'
            //         },
            //         {
            //             key: 'operateAuth',
            //             value: false,
            //             label: '操作',
            //             type: 'operate'
            //         }
            //     ]
            // },
            {
                name: '数据接收',
                id: 'DataReceive',
                icon: 'cw-icon weops-sign-receiver',
                auth: [
                    {
                        key: 'checkAuth',
                        value: false,
                        label: '查看',
                        type: 'check'
                    },
                    {
                        key: 'operateAuth',
                        value: false,
                        label: '操作',
                        type: 'operate'
                    }
                ]
            }
            // {
            //     name: '日志监控',
            //     id: 'LogMonitor',
            //     icon: 'cw-icon weops-policy-execution-configuration',
            //     auth: [
            //         {
            //             key: 'checkAuth',
            //             value: false,
            //             label: '查看',
            //             type: 'check'
            //         },
            //         {
            //             key: 'operateAuth',
            //             value: false,
            //             label: '操作',
            //             type: 'operate'
            //         }
            //     ]
            // },
            // {
            //     name: '索引集',
            //     id: 'IndexSet',
            //     icon: 'cw-icon weops-policy-execution-configuration',
            //     auth: [
            //         {
            //             key: 'checkAuth',
            //             value: false,
            //             label: '查看',
            //             type: 'check'
            //         },
            //         {
            //             key: 'operateAuth',
            //             value: false,
            //             label: '操作',
            //             type: 'operate'
            //         }
            //     ]
            // },
            // {
            //     name: '采集配置',
            //     id: 'CollectionConfig',
            //     icon: 'cw-icon weops-gather',
            //     auth: [
            //         {
            //             key: 'checkAuth',
            //             value: false,
            //             label: '查看',
            //             type: 'check'
            //         },
            //         {
            //             key: 'operateAuth',
            //             value: false,
            //             label: '操作',
            //             type: 'operate'
            //         }
            //     ]
            // }
        ]
    }
]

export const createAdminRouteConfig = () => adminRouteConfig
