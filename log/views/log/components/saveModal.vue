<template>
    <div>
        <bk-sideslider
            :is-show.sync="visible"
            :quick-close="true"
            :width="400"
            ext-cls="common-dialog-wrapper"
            :before-close="handleClose"
        >
            <div slot="header">
                保存条件
            </div>
            <div slot="content" class="common-dialog-wrapper-main">
                <bk-form :label-width="60" :model="formData" :rules="rules" ref="validateForm">
                    <bk-form-item label="标题" required :property="'title'">
                        <bk-input
                            v-model="formData.title"
                            placeholder="请输入标题">
                        </bk-input>
                    </bk-form-item>
                </bk-form>
            </div>
            <div slot="footer">
                <bk-button
                    v-if="isEdit"
                    class="mr10"
                    theme="primary"
                    :loading="btnLoading"
                    @click.stop.prevent="handleConfirm">
                    更新
                </bk-button>
                <bk-button
                    v-else
                    class="mr10"
                    theme="primary"
                    :loading="btnLoading"
                    @click.stop.prevent="handleConfirm">
                    创建
                </bk-button>
                <bk-button theme="default" @click="handleClose">取消</bk-button>
            </div>
        </bk-sideslider>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from 'vue-property-decorator'
    import { v4 as uuidv4 } from 'uuid'
    import { AnalysisLayout } from '@log/types'
    @Component
    export default class SaveModal extends Vue {
        @Prop({ type: Array, default: () => ([]) }) analysisData: Array<AnalysisLayout>
        visible: boolean = false
        conditionParams: any = {}
        formData: any = {
            title: ''
        }
        rules: any = {
            title: [
                {
                    required: true,
                    message: '请输入标题',
                    trigger: 'blur'
                }
            ]
        }
        btnLoading: boolean = false
        isEdit: boolean = false
        logDataForAnalysis: Array<AnalysisLayout> = []
        searchIdMap: any = {}
        stateValue: any = {}
        curId: string = ''
        curSearchIdMap: any = {}

        // 显示弹窗
        show({ executeResult, displayFields, fixedChartSearchId, logDataForAnalysis, currentStateId }) {
            this.visible = true
            const searchTypes = Object.values(executeResult.results)[0]?.search_types
            const stateId = Object.keys(executeResult.results)[0]
            this.stateValue = executeResult?.stateValue || {}
            const { title, searchIdMap, id } = this.stateValue
            this.searchIdMap = searchIdMap
            this.conditionParams.search_id = executeResult.search_id
            this.conditionParams.stateId = stateId
            this.conditionParams.displayFields = displayFields
            this.isEdit = currentStateId && id === currentStateId
            this.formData.title = this.isEdit ? title : ''
            // 获取信息总数这个固定面板的searchId
            this.conditionParams.chartId = fixedChartSearchId
            // 获取所有消息的searchId
            this.conditionParams.tableId = Object.keys(searchTypes)
                .filter(key => searchTypes[key].type === 'messages')?.[0]
            this.logDataForAnalysis = logDataForAnalysis
        }
        handleClose() {
            this.commonHandleHide()
        }
        commonHandleHide() {
            this.visible = false
        }
        async handleConfirm() {
            const validateForm: any = this.$refs.validateForm
            validateForm.validate().then(validator => {
                this.confirmFn()
            })
        }
        async confirmFn() {
            this.btnLoading = true
            const params = this.getSaveCondition()
            try {
                const url = this.isEdit ? 'updateCondition' : 'createCondition'
                const res = await this.$api.log[url](params)
                const { result, message } = res
                if (!result) {
                    return this.$error(message)
                }
                this.$success(this.isEdit ? '修改成功' : '创建成功')
                this.$emit('save-success', {
                    ...this.conditionParams,
                    title: this.formData.title,
                    stateValue: {
                        title: this.formData.title,
                        searchId: this.conditionParams.search_id,
                        id: this.curId,
                        searchIdMap: this.curSearchIdMap || {}
                    }
                }, this.curId)
                this.commonHandleHide()
            } finally {
                this.btnLoading = false
            }
        }

        getSaveCondition() {
            this.btnLoading = true
            const { id } = this.stateValue || {}
            this.curId = this.isEdit ? id : uuidv4().replace(/-/g, '').slice(0, 24)
            const params: any = {
                created_at: new Date().toISOString(),
                description: '',
                id: this.curId,
                title: this.formData.title,
                properties: [],
                summary: '',
                search_id: this.conditionParams.search_id,
                type: 'SEARCH',
                state: {}
            }
            // 处理state数据
            const stateId = this.conditionParams.stateId
            const stateValue = {
                positions: {},
                titles: {
                    widget: {}
                },
                widget_mapping: {},
                widgets: []
            }
            // 汇总所有面板的数据,并创建最新的stateId
            const { chartId, tableId } = this.conditionParams
            const searchIds = this.logDataForAnalysis.map(row => row.searchId).concat([chartId, tableId])
            // map结构: { searchId: stateId }
            const searchIdMap = this.searchIdMap || Object.fromEntries(searchIds.map(id => [id, uuidv4()]))
            this.curSearchIdMap = searchIdMap
            // map结构: { stateId: searchId }
            const stateIdMap = Object.entries(searchIdMap).reduce((acc, [key, value]) => {
                acc[value] = key
                return acc
            }, {})
            const analysisDataMap = new Map(this.logDataForAnalysis.map(row => [row.searchId, row]))
            stateValue.positions = Object.fromEntries(Object.keys(stateIdMap).map(stateId => {
                const position = this.calculateWidgetPosition(analysisDataMap, stateIdMap[stateId])
                return [stateId, position]
            }))
            stateValue.titles.widget = this.mapWidgetTitles(analysisDataMap, stateIdMap)
            // 将stateIdMap: { stateId: searchId }处理成: { stateId: [searchId] }
            stateValue.widget_mapping = Object.fromEntries(
                Object.entries(stateIdMap).map(([stateId, searchId]) => [stateId, [searchId]])
            )
            stateValue.widgets = this.createWidgets(analysisDataMap, stateIdMap)
            params.state[stateId] = stateValue
            return params
        }

        calculateWidgetPosition(analysisDataMap, searchId) {
            const { chartId, tableId } = this.conditionParams
            if (searchId === chartId || searchId === tableId) {
                const maxRow = Math.max(...this.logDataForAnalysis.map(row => row.y + row.h))
                const max = maxRow !== undefined && maxRow !== -Infinity ? maxRow : 0
                return {
                    col: 1,
                    row: searchId === chartId ? max + 1 : max + 3,
                    height: 2,
                    width: 'Infinity'
                }
            }
            const { x, y, h, w } = analysisDataMap.get(searchId)
            return {
                col: x + 1,
                row: y + 1,
                height: h,
                width: w === 12 ? 'Infinity' : w
            }
        }

        mapWidgetTitles(analysisDataMap, stateIdMap) {
            const { chartId, tableId } = this.conditionParams
            return Object.fromEntries(Object.keys(stateIdMap).map(stateId => {
                const searchId = stateIdMap[stateId]
                if (searchId === chartId || searchId === tableId) {
                    return [stateId, searchId === chartId ? '消息总数' : '所有信息']
                }
                const name = analysisDataMap.get(searchId)?.config?.name
                return [stateId, name]
            }))
        }

        createWidgets(analysisDataMap, stateIdMap) {
            const { chartId, tableId } = this.conditionParams
            return Object.keys(stateIdMap).map(stateId => {
                const searchId = stateIdMap[stateId]
                if (searchId === chartId) {
                    return {
                        id: stateId,
                        type: 'aggregation',
                        config: {
                            column_pivots: [],
                            rollup: true,
                            row_pivots: [
                                {
                                    field: 'timestamp',
                                    type: 'time',
                                    config: {
                                        interval: {
                                            type: 'auto',
                                            scaling: 1
                                        }
                                    }
                                }
                            ],
                            series: [
                                {
                                    config: {
                                        'name': null
                                    },
                                    function: 'count()'
                                }
                            ],
                            sort: [],
                            visualization: 'bar',
                            event_annotation: false
                        },
                        streams: []
                    }
                }
                if (searchId === tableId) {
                    return {
                        id: stateId,
                        type: 'messages',
                        config: {
                            decorators: [],
                            fields: this.conditionParams.displayFields,
                            show_message_row: true,
                            show_summary: true,
                            sort: [
                                {
                                    type: 'pivot',
                                    field: 'timestamp',
                                    direction: 'Descending'
                                }
                            ]
                        },
                        streams: []
                    }
                }
                const { view_type: viewType, logParams: { group, columnRollup, measure, order } } = analysisDataMap.get(searchId).config
                const chartTypeMap = {
                    'log-table': 'table',
                    'log-pie': 'pie',
                    'log-line': 'line',
                    'log-single': 'numeric',
                    'log-bar': 'bar'
                }
                return {
                    id: stateId,
                    type: 'aggregation',
                    query: null,
                    streams: [],
                    timerange: null,
                    config: {
                        column_pivots: group.filter(item => item.direction === 'column').map(({ field, isDateType, limit, unit, duration }) => ({
                            field: field,
                            type: isDateType ? 'time' : 'values',
                            config: isDateType ? {
                                interval: { type: 'timeunit', unit, value: duration }
                            } : { limit }
                        })),
                        event_annotation: false,
                        rollup: columnRollup,
                        row_pivots: group.filter(item => item.direction === 'row').map(({ field, isDateType, limit, unit, duration }) => ({
                            field: field,
                            type: isDateType ? 'time' : 'values',
                            config: isDateType ? {
                                interval: { type: 'timeunit', unit, value: duration }
                            } : { limit }
                        })),
                        series: measure.map(({ name, type, field }) => ({
                            function: `${type}(${field})`,
                            config: {
                                name
                            }
                        })),
                        sort: order.map(({ field, orderType, type }) => ({
                            type,
                            field,
                            direction: orderType
                        })),
                        visualization: chartTypeMap[viewType],
                        visualization_config: null
                    }
                }
            })
        }
    }
</script>
