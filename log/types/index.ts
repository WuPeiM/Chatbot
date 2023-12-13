export interface SearchKeys {
    name: string,
    id: string,
}
export interface Pagination {
    current: number,
    count: number,
    limit: number
}
export interface Probe {
    id: string,
    name: number,
    os_type?: string
}
export interface AnalysisLayout {
    x: number,
    y: number,
    w: number,
    h: number,
    i: number | string,
    searchId?: string,
    trendId?: string,
    searchValue?: any,
    loading: boolean,
    type: string,
    name: string,
    widget: string,
    config: any
}
