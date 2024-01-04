import { v4 as uuidv4 } from 'uuid'
import { deepClone } from '@/controller/func/common'

export class LogSearchConfig {
    /**
     * @param {Object} entryConfig 传入的配置参数
     */
    constructor(entryConfig) {
        this.entryConfig = entryConfig
        // 默认的配置参数
        this.defaultConfig = {
            id: uuidv4().replace(/-/g, '').slice(0, 24),
            queries: [
                {
                    id: uuidv4(),
                    query: {
                        type: 'elasticsearch',
                        query_string: ''
                    },
                    timerange: {
                        type: 'relative'
                    },
                    filter: null,
                    search_types: [
                        {
                            timerange: null,
                            query: null,
                            streams: [],
                            id: uuidv4(),
                            name: 'chart',
                            series: [
                                {
                                    type: 'count',
                                    id: 'count()',
                                    field: null
                                }
                            ],
                            sort: [],
                            rollup: true,
                            type: 'pivot',
                            row_groups: [
                                {
                                    type: 'time',
                                    field: 'timestamp',
                                    interval: {
                                        type: 'auto',
                                        scaling: 1
                                    }
                                }
                            ],
                            column_groups: [],
                            filter: null
                        },
                        {
                            timerange: null,
                            query: null,
                            streams: [],
                            id: uuidv4(),
                            name: null,
                            limit: 150,
                            offset: 0,
                            sort: [
                                {
                                    field: 'timestamp',
                                    order: 'DESC'
                                }
                            ],
                            fields: [],
                            decorators: [],
                            type: 'messages',
                            filter: null
                        }
                    ]
                }
            ],
            parameters: []
        }
    }

    /**
    * @description 递归地将传入的配置参数所有属性覆盖到mergedConfigs中，得到新的配置参数
    * @param {Object} config 传入的配置参数
    * @param {String} targetKey 根据targetKey完全覆盖某个值
    */
    mergeConfig(config, targetKey) {
        const mergedConfigs = deepClone(this.defaultConfig)
        const mergeProperties = (target, source) => {
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof source[key] === 'object' && source[key] && target.hasOwnProperty(key) && typeof target[key] === 'object' && target[key]) {
                        if (Array.isArray(source[key]) && !source[key].length) {
                            target[key] = []
                        }
                        // 如果你想覆盖某个值，可以传入对应的targetKey，前提是这个targetKey是唯一的
                        if (targetKey && key === targetKey) {
                            target[key] = source[key]
                        }
                        mergeProperties(target[key], source[key]) // 递归合并子属性
                    } else {
                        target[key] = source[key] // 覆盖目标属性的值
                    }
                }
            }
        }
        mergeProperties(mergedConfigs, config)
        return mergedConfigs
    }

    /**
    * @description 获取合并后的配置参数
    * @param {String} targetKey 根据targetKey完全覆盖某个值
    */
    getParams(targetKey?) {
        return this.mergeConfig(this.entryConfig, targetKey)
    }

    /**
    * @description 获取search_types
    */
    getSearchTypes() {
        return this.defaultConfig.queries[0].search_types
    }
}
