// 告警： 关联拓扑
export interface AlarmTopoNode {
    bk_inst_id: number,
    bk_inst_name: string,
    id: string,
    bk_obj_id: string
}
export interface AlarmTopoEdge {
    from: string,
    to: string,
    id: string,
}
export interface AlarmTopoData {
    nodes: AlarmTopoNode[],
    edges: AlarmTopoEdge[]
}

export interface Panel {
    name: string,
    label: string,
    count?: number,
    disabled?: boolean
}

// 网格布局
export interface LayoutData {
    x: number,
    y: number,
    w: number,
    h: number,
    i: number,
    static?: boolean,
    [key: string]: any
}
// 公用表格数据
export interface Pagination {
    current: number,
    count: number,
    limit: number
}
export interface TableData {
    label?: string,
    key?: string,
    minWidth?: string | number,
    [key: string]: any
}

export interface TotalData {
    name: string,
    count: number,
    key: string,
    [key: string]: any
}

// 仪表盘视图
export interface ViewCateData {
    name: string,
    label: string,
    views: ViewsData[]
}
export interface ViewsData {
    id: number,
    type: string,
    widget: string,
    name: string,
    [key: string]: any
}

export interface ViewForm {
    id: number,
    name: string,
    bk_obj_id: string,
    metric: string,
    table_id: string,
    view_type: string,
    aggregate_type: string,
    fields_value: Array<any>,
    tool_value: Array<ToolInfo>,
    [key: string]: any
}

export interface InstInfo {
    bk_obj_id: string,
    bk_obj_name: string,
    [key: string]: any
}

export interface MetricInfo {
    metric_id: number,
    metric: string,
    table_id: string,
    [key: string]: any
}
export interface InstFilter {
    sid?: string,
    bk_obj_id: string,
    bk_biz_id: number,
    bk_set_ids: Array<string>,
    bk_module_ids: Array<string>,
    bk_inst_ids: Array<string>,
    instData?: any,
    loading?: boolean,
    k8sMap?: object
}

export interface ToolInfo {
    id: number,
    content_type: string,
    host_type: string,
    tool_name: string,
    [key: string]: any
}

// 指标管理
export interface IndicatorLayout {
    key: string,
    span: number,
    name: string,
    isHide?: boolean
    slot?: string
}

export interface IndicatorInfo {
    name: string,
    display_name: string,
    isExpand?: boolean,
    metric_list: any,
    [key: string]: any
}

export interface Metric {
    metric_group: number,
    compare_way: string,
    compare_value: string,
    field_cn_name: string,
    description: string,
    [key: string]: any
}

// 自定义菜单
interface CustomMenu {
    icon: string,
    menu_id: string,
    menu_name: string,
    link?: string
}

// 监控详情基础信息
interface InstDetail {
    bk_group_name: string,
    index: number,
    key: string,
    name: string,
    value: string
}
export interface DispalyFields {
    option: any,
    bk_property_id: string,
    bk_property_name: string,
    bk_property_type: string
}
