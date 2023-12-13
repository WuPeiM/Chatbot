import { ViewCateData } from './types'

export const viewCateList: Array<ViewCateData> = [
    {
        name: 'monitor',
        label: '监控',
        views: [
            {
                id: 0,
                type: 'dashboard',
                widget: 'gauge-stage',
                name: '仪表',
                config: {},
                image: 'dashboard'
            },
            {
                id: 1,
                type: 'line',
                widget: 'stacked-line',
                name: '折线图',
                config: {},
                image: 'line'
            },
            {
                id: 2,
                type: 'column',
                widget: 'basic-bar',
                name: '柱状图',
                config: {},
                image: 'bar'
            },
            {
                id: 3,
                type: 'pie',
                widget: 'circular-pie',
                name: '饼形图',
                config: {},
                image: 'pie'
            },
            {
                id: 4,
                type: 'single',
                widget: 'single',
                name: '单值',
                config: {},
                image: 'single'
            }
        ]
    },
    {
        name: 'capital',
        label: '资产',
        views: [
            {
                id: 0,
                type: 'table',
                widget: 'field-table',
                name: '表格',
                config: {},
                image: 'table'
            }
        ]
    },
    {
        name: 'autoProtect',
        label: '自动化',
        views: [
            {
                id: 0,
                type: 'tool',
                widget: 'maintain-tool',
                name: '运维工具',
                config: {},
                image: 'tool'
            }
        ]
    },
    {
        name: 'log',
        label: '日志',
        views: [{
            id: 0,
            type: 'log-msg',
            widget: 'log-message',
            name: '日志消息',
            config: {},
            image: 'message'
        },
        {
            id: 1,
            type: 'log-table',
            widget: 'log-table',
            name: '表格',
            config: {},
            image: 'table'
        },
        {
            id: 2,
            type: 'log-line',
            widget: 'log-line-bar',
            name: '折线图',
            config: {},
            image: 'line'
        },
        {
            id: 3,
            type: 'log-bar',
            widget: 'log-line-bar',
            name: '柱状图',
            config: {},
            image: 'bar'
        },
        {
            id: 4,
            type: 'log-pie',
            widget: 'log-pie',
            name: '饼形图',
            config: {},
            image: 'pie'
        },
        {
            id: 5,
            type: 'log-single',
            widget: 'log-single',
            name: '单值',
            config: {},
            image: 'single'
        },
        {
            id: 6,
            type: 'log-map',
            widget: 'log-map',
            name: '地图',
            config: {},
            image: 'map'
        }]
    },
    {
        name: 'senior',
        label: '高级',
        views: [
            {
                id: 0,
                type: 'senior-table',
                widget: 'senior-table',
                name: '表格',
                config: {},
                image: 'table'
            },
            {
                id: 1,
                type: 'senior-line',
                widget: 'senior-line-bar',
                name: '折线图',
                config: {},
                image: 'line'
            },
            {
                id: 2,
                type: 'senior-bar',
                widget: 'senior-line-bar',
                name: '柱状图',
                config: {},
                image: 'bar'
            },
            {
                id: 3,
                type: 'senior-pie',
                widget: 'senior-pie',
                name: '饼形图',
                config: {},
                image: 'pie'
            },
            {
                id: 4,
                type: 'senior-topo',
                widget: 'senior-topo',
                name: '流量拓扑',
                config: {},
                image: 'topo'
            },
            {
                id: 5,
                type: 'senior-sankey',
                widget: 'senior-sankey',
                name: '桑基图',
                config: {},
                image: 'sankey'
            },
            {
                id: 6,
                type: 'senior-single',
                widget: 'senior-single',
                name: '单值',
                config: {},
                image: 'single'
            },
            {
                id: 7,
                type: 'dropdown-list',
                widget: 'dropdown-list',
                name: '下拉列表',
                config: {},
                image: 'dropdown'
            },
            {
                id: 8,
                type: 'text-parameter',
                widget: 'text-parameter',
                name: '文本参数',
                config: {},
                image: 'text'
            }
        ]
    }
]

export const DATE_OPTIONS: Array<{
    value: number,
    type: string, // 时间范围类型， minute：进几分钟，hour：近几小时，day：近几天，month：近几个月
    typeCn: string
}> = [
    {
        value: 15,
        type: 'minute',
        typeCn: '分钟'
    },
    {
        value: 30,
        type: 'minute',
        typeCn: '分钟'
    },
    {
        value: 1,
        type: 'hour',
        typeCn: '小时'
    },
    {
        value: 6,
        type: 'hour',
        typeCn: '小时'
    },
    {
        value: 12,
        type: 'hour',
        typeCn: '小时'
    },
    {
        value: 1,
        type: 'day',
        typeCn: '天'
    },
    {
        value: 7,
        type: 'day',
        typeCn: '天'
    },
    {
        value: 30,
        type: 'day',
        typeCn: '天'
    },
    {
        value: 1,
        type: 'last_month',
        typeCn: '月'
    }
]

export const REFRESH_TIME_OPTIONS: Array<{
    id: number,
    name: string
}> = [
    {
        id: 0,
        name: 'off'
    },
    {
        id: 60,
        name: '1m'
    },
    {
        id: 300,
        name: '5m'
    },
    {
        id: 900,
        name: '15m'
    }
]

export const COMPARE_LIST: Array<{
    id: string | number,
    name: string
}> = [
    {
        id: 'gt',
        name: '大于'
    },
    {
        id: 'lt',
        name: '小于'
    }
]

export const COLUMN_OPTIONS: Array<{
    id: string | number,
    name: string
}> = [
    {
        id: 'min',
        name: '最小值'
    },
    {
        id: 'max',
        name: '最大值'
    },
    {
        id: 'avg',
        name: '平均值'
    },
    {
        id: 'new',
        name: '最新值'
    }
]

export const COLUMN_MAP: any = {
    min: '最小值',
    max: '最大值',
    avg: '平均值',
    new: '最新值'
}

export const ORDER_LIST: Array<{
    label: string,
    value: string
}> = [
    { label: 'Ascending', value: '升序' },
    { label: 'Descending', value: '降序' }
]

export const TIME_UNITS: Array<{
    id: string,
    label: string
}> = [
    {id: 'seconds', label: '秒'},
    {id: 'minutes', label: '分'},
    {id: 'hours', label: '小时'},
    {id: 'days', label: '天'},
    {id: 'weeks', label: '周'},
    {id: 'Months', label: '月'}
]

export const VIEW_MAP = {
    'dashboard': '仪表盘',
    'line': '折线图',
    'column': '柱状图',
    'pie': '饼形图',
    'single': '单值',
    'table': '表格',
    'tool': '运维工具',
    'log-table': '表格',
    'log-line': '折线图',
    'log-bar': '柱状图',
    'log-pie': '饼形图',
    'log-single': '单值'
}

export const DIRECTION_LIST = [
    { type: 'row', label: '行' },
    { type: 'column', label: '列' }
]

export const TREND_LIST = [
    { type: 'down', label: '越小越好' },
    { type: 'universal', label: '普通' },
    { type: 'up', label: '越大越好' }
]

export const MODE_LIST = [
    { type: 'group', label: '分组' },
    { type: 'stack', label: '堆叠' }
]

export const PERCENTILE = [25.0, 50.0, 75.0, 90.0, 95.0, 99.0]

export const COLOR_MAP = {
    'font.color': ['#979BA5', '#c4c6cc'],
    'yaxis.gridcolor': ['#ecebeb', '#484848'],
    'xaxis.color': ['#78797d', '#c4c6cc']
}

export const FUN_MAP: Object = {
    'avg': {
        'type': 'avg',
        'description': '平均值'
    },
    'card': {
        'type': 'card',
        'description': '基数'
    },
    'count': {
        'type': 'count',
        'description': '计数'
    },
    'max': {
        'type': 'max',
        'description': '最大值'
    },
    'min': {
        'type': 'min',
        'description': '最小值'
    },
    'stddev': {
        'type': 'stddev',
        'description': '标准差'
    },
    'sum': {
        'type': 'sum',
        'description': '求和'
    },
    'sumofsquares': {
        'type': 'sumofsquares',
        'description': '平方和'
    },
    'variance': {
        'type': 'variance',
        'description': '方差'
    },
    'percentile': {
        'type': 'percentile',
        'description': '百分位数'
    },
    'latest': {
        'type': 'latest',
        'description': '最新值'
    }
}

export const chartMap = {}

// 拓扑节点、边默认颜色
export const DEF_COLOR = '#3056e3'

// 流量拓扑默认配置项
export const defaultTopoConf = {
    fitView: true,
    minZoom: 0.1,
    modes: {
        default: [
            // { type: 'zoom-canvas', enableOptimize: false },
            { type: 'drag-canvas', enableOptimize: false },
            'activate-relations',
            'drag-node'
        ]
    },
    layout: {
        type: 'dagre',
        rankdir: 'TB',
        nodesep: 30,
        ranksep: 60
    },
    defaultNode: {
        type: 'circle-node',
        size: 30,
        labelCfg: {
            position: 'bottom',
            style: {
                fill: '#000',
                fontSize: 12
            }
        },
        stateStyles: {
            hover: {
                shadowColor: DEF_COLOR,
                shadowBlur: 5
            }
        },
        style: {
            lineWidth: 2,
            stroke: DEF_COLOR,
            fill: '#5575e9'
        }
    },
    defaultEdge: {
        type: 'circle-running',
        labelCfg: {
            // autoRotate: true,
            style: {
                stroke: '#fff',
                fill: '#3056E3',
                background: {
                    fill: '#ffffff',
                    padding: [0, 2, 0, 2]
                }
            }
        },
        style: {
            lineWidth: 1,
            stroke: '#3056E3',
            endArrow: {
                path: 'M 0,0 L 4,2 L 4,-2 Z',
                fill: '#3056E3'
            }
        }
    }
}
