<template>
    <div class="log-wrapper">
        <div class="log-wrapper-search">
            <bk-select
                class="search-group"
                v-model="group"
                multiple
                display-tag
                :auto-height="false"
                searchable>
                <bk-option v-for="option in groupList"
                    :key="option.id"
                    :id="option.id"
                    :name="option.title">
                </bk-option>
            </bk-select>
            <div class="search-field">
                <ace-editor
                    ref="aceEditor"
                    placeholder="在此处输入您的搜索查询，然后按Enter"
                    :value="searchField"
                    :fields="allFields"
                    @change="handleChangeField"
                    @enter="handleSearch" />
                <span class="cw-icon weops-deng-pao" @click="checkLogSyntax"></span>
            </div>
            <div class="search-time">
                <search-time ref="searchTime" :default-time="defaultTime" />
                <bk-button theme="primary" class="mr10 ml10" @click="handleSearch">
                    查询
                </bk-button>
                <div class="search-time-interval">
                    <bk-button theme="primary" :icon="isStarted ? 'pause' : 'play2'" @click="handleStart">
                    </bk-button>
                    <bk-select
                        v-model="interval"
                        :clearable="false"
                        style="width: 150px;"
                        @change="handleIntervalChange($event)">
                        <bk-option v-for="option in intervalList" :key="option.id" :id="option.id" :name="option.name">
                        </bk-option>
                    </bk-select>
                </div>
            </div>
        </div>
        <div class="log-wrapper-operate">
            <div class="operate-btn" v-for="item in logBtnList" :key="item.type">
                <bk-button
                    text
                    :disabled="item.type === 'saveModal' && loading || item.type === 'alarmModal'"
                    class="mr10"
                    @click="handleLog(item.type)">
                    {{ item.name }}
                </bk-button>
            </div>
        </div>
        <div class="widget-container-wrapper">
            <grid-layout
                :layout.sync="logDataForAnalysis"
                :col-num="12"
                :row-height="50"
                :is-draggable="true"
                :is-resizable="true"
                :vertical-compact="true"
                :use-css-transforms="true"
                class="grid-layout-container"
                :margin="[10, 10]">
                <grid-item
                    v-for="item in logDataForAnalysis"
                    :x="item.x"
                    :y="item.y"
                    :w="item.w"
                    :h="item.h"
                    :i="item.i"
                    :key="item.i"
                    :data-grid-item="item.i"
                    drag-allow-from=".vue-draggable-handle"
                    drag-ignore-from=".no-drag">
                    <div class="vue-draggable-handle">
                        <span class="cw-icon weops-align"></span>
                    </div>
                    <div class="no-drag">
                        <div class="widget">
                            <div class="header">
                                <div class="title">{{ item.config.name || '--' }}</div>
                                <bk-dropdown-menu
                                    align="right"
                                    trigger="click">
                                    <div
                                        class="dropdown-trigger-text"
                                        slot="dropdown-trigger">
                                        <bk-icon style="font-size: 18px; cursor: pointer; color: #989898;" type="ellipsis" class="icon more-icon-custom" />
                                    </div>
                                    <ul
                                        class="bk-dropdown-list"
                                        slot="dropdown-content">
                                        <li @click="handleCopy(item)">
                                            <a href="javascript:;">
                                                复制
                                            </a>
                                        </li>
                                        <li @click="handleCopyToPanel(item)">
                                            <a href="javascript:;">
                                                复制到仪表盘
                                            </a>
                                        </li>
                                        <li @click="handleEditPanel(item)">
                                            <a href="javascript:;">
                                                编辑
                                            </a>
                                        </li>
                                        <li @click="handleDeletePanel(item)">
                                            <a href="javascript:;">
                                                删除
                                            </a>
                                        </li>
                                    </ul>
                                </bk-dropdown-menu>
                            </div>
                        </div>
                        <div
                            class="content"
                            v-bkloading="{
                                isLoading: item.loading,
                                opacity: 1,
                                zIndex: 10,
                                theme: 'primary',
                                mode: 'spin',
                                size: 'small'
                            }">
                            <component
                                v-if="!item.loading"
                                :id="item.i"
                                :row="item"
                                :ref="`view_${item.i}`"
                                :is="item.widget"
                                :analysis-search-value="item.searchValue" />
                        </div>
                    </div>
                </grid-item>
            </grid-layout>
        </div>
        <chart-line
            class="log-wrapper-chat"
            ref="chartLine"
            :chart-data="chartData"
            :current-search-info="currentSearchInfo"
            @selectChartTime="selectChartTime">
        </chart-line>
        <div class="log-wrapper-main">
            <menu-tab :panels="panels" type="line" :active-panel="active" @click="toTabMenu" class="tap"></menu-tab>
            <log-tree
                ref="logTree"
                v-bkloading="{ isLoading: treeLoading || loading, zIndex: 10 }"
                :group-list="groupList"
                :field-list="fieldList"
                @showFeildDetail="showFeildDetail">
                <template slot="operate" slot-scope="{ sec }">
                    <popover
                        class="tree-popover"
                        ref="operatePopover"
                        :operation-list="getOperationList(dealTableKeys(sec.id))"
                        @handleOperate="handleOperate($event,sec)">
                        <template slot="trigger">
                            <div class="field-list-item">
                                <div class="list-info">
                                    <span :class="['cw-icon','list-info-icon', iconMaps[sec.type]]"></span>
                                    <span class="hide-text" v-bk-overflow-tips> {{ sec.value }}</span>
                                </div>
                            </div>
                        </template>
                        <template slot="title">
                            <span>{{ `${sec.value} = ${sec.type}` }}</span>
                        </template>
                    </popover>
                </template>
            </log-tree>
            <log-message-table
                v-if="active === 'originalLog'"
                class="ml10"
                v-bkloading="{ isLoading: loading, zIndex: 10 }"
                :data="logDetail"
                :columns="fieldList.displayFields"
                :pagination="pageConfig"
                @handleSort="handleSort"
                @handleLog="handleLog"
                @handlePageChange="handlePageChange"
                @limitChange="limitChange"
            >
                <template slot="operate" slot-scope="{ fieldKey,field,item }">
                    <popover
                        :operation-list="getOperationList(dealTableKeys(fieldKey))"
                        @handleOperate="handleOperate($event,{
                            value: fieldKey,
                            id: fieldKey,
                            sort: true,
                            active: false,
                            type: getFieldTypeById(fieldKey)
                        })">
                        <template slot="trigger">
                            <div class="table-row-label">
                                <span class="label">{{ fieldKey }}</span>
                                <bk-icon type="down-shape" class="show-more" />
                            </div>
                        </template>
                        <template slot="title">
                            <span>{{ `${fieldKey} = ${getFieldTypeById(fieldKey)}` }}</span>
                        </template>
                    </popover>
                    <popover
                        class="detail-wrapper-popover"
                        :operation-list="getOperationList(dealTableValues(item,fieldKey))"
                        @handleOperate="handleOperate($event,{
                            id: fieldKey,
                            fieldValue: field,
                            logInfo: item
                        })">
                        <template slot="trigger">
                            <div class="row-content">
                                <span :class="[item.lightenList && item.lightenList.includes(fieldKey) && 'lighten']" v-html="field" />
                                <bk-icon type="down-shape" class="show-more" />
                            </div>
                        </template>
                        <template slot="title">
                            <span>{{ `${fieldKey} = ${getFeildValue(field)}` }}</span>
                        </template>
                    </popover>
                </template>
            </log-message-table>
            <log-cluster
                v-else
                class="ml10"
                :current-search-info="currentSearchInfo"
                @addPatten="addPatten"
            />
        </div>
        <save-modal ref="saveModal" :analysis-data="logDataForAnalysis" @save-success="updateExecuteResult" />
        <load-modal ref="loadModal" @selectLoadCondition="selectLoadCondition" />
        <download-modal ref="downloadModal" />
        <log-syntax ref="logSyntax" />
        <select-extractor ref="selectExtractor" />
        <edit-view
            ref="editView"
            :view-cate="viewCate"
            :is-analysis-panel="true"
            @submit="handleUpdatePanel" />
        <dashboard-modal ref="dashboardModal" />
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    import Popover from './components/popover.vue'
    import ChartLine from './components/chartLine.vue'
    import SearchTime from '@log/views/components/logTimeSelector.vue'
    import SaveModal from './components/saveModal.vue'
    import LoadModal from './components/loadModal.vue'
    import DownloadModal from './components/downloadModal.vue'
    import LogSyntax from './components/logSyntax.vue'
    import AceEditor from '@log/views/components/aceEditor/index.vue'
    import logMessageTable from '@log/views/components/logMessageTable.vue'
    import LogTree from './components/logTree.vue'
    import { LogSearchConfig } from '@/controller/func/logConfigs'
    import { getMinutesAgoToNow } from '@log/controller/formatTime'
    import { replaceLabel, replaceShader } from '@log/controller/utils'
    import SelectExtractor from './components/selectExtractor.vue'
    import moment from 'moment'
    import { GridLayout, GridItem } from 'vue-grid-layout'
    import { getLogParamsForAnalysis } from '@log/data/analysis'
    import EditView from '@log/views/log/monitorAlarm/dashBoard/components/editView.vue'
    import { viewCateList } from '@log/views/log/monitorAlarm/dashBoard/views'
    import {
        dealCommonParams,
        dealTrendParams,
        reverseDealLogParams
    } from '@log/views/log/monitorAlarm/dashBoard/utils/logParams'
    import { AnalysisLayout } from '@log/types'
    // 仪表盘日志组件集合
    // import LogTable from '@monitorAlarm/views/dashBoard/views/logTable.vue'
    // import LogLineBar from '@monitorAlarm/views/dashBoard/views/logLineBar.vue'
    // import LogSingle from '@monitorAlarm/views/dashBoard/views/logSingle.vue'
    // import LogPie from '@monitorAlarm/views/dashBoard/views/logPie.vue'
    import DashboardModal from '@log/views/log/components/dashboardModal.vue'
    import MenuTab from '@/components/menuTab.vue'
    import LogCluster from '@log/views/log/components/logCluster.vue'

    @Component({
        name: 'Log',
        components: {
            DashboardModal,
            Popover,
            ChartLine,
            SearchTime,
            SaveModal,
            LoadModal,
            DownloadModal,
            LogSyntax,
            AceEditor,
            logMessageTable,
            LogTree,
            SelectExtractor,
            GridItem,
            GridLayout,
            EditView,
            // LogTable,
            // LogLineBar,
            // LogSingle,
            // LogPie,
            MenuTab,
            LogCluster
        }
    })
    export default class Log extends Vue {
        fieldList: any = {
            displayFields: [],
            hideFields: []
        }
        pageConfig: any = {
            current: 1,
            limit: 20,
            count: 0,
            position: 'top'
        }
        logDetail: Array<any> = []
        operationList: Array<any> = [
            {
                title: '在表格中展示',
                type: 'display',
                belongedIds: ['hideFields']
            },
            {
                title: '在表格中移除',
                type: 'hide',
                belongedIds: ['displayFields']
            },
            {
                title: '统计分析',
                type: 'analysis',
                belongedIds: ['displayFields', 'hideFields']
            },
            {
                title: '添加到查询语句',
                type: 'addField'
            },
            {
                title: '从结果中排除',
                type: 'exclude',
                belongedIds: ['light', 'dark']
            },
            {
                title: '创建提取器',
                type: 'extract',
                belongedIds: ['light', 'dark']
            },
            {
                title: '高亮',
                type: 'light',
                belongedIds: ['light']
            },
            {
                title: '取消高亮',
                type: 'dark',
                belongedIds: ['dark']
            }
        ] // popover分四种：展示字段、隐藏字段、高亮、取消高亮
        logBtnList: Array<any> = [
            { name: '保存条件', type: 'saveModal' },
            { name: '加载条件', type: 'loadModal' },
            { name: '新建监控', type: 'alarmModal' },
            { name: '下载日志', type: 'downloadModal' }
        ]
        isStarted: Boolean = false
        interval: number = 0
        intervalList: Array<any> = [
            { name: '不刷新', id: 0 },
            { name: '1秒', id: 1000 },
            { name: '2秒', id: 2000 },
            { name: '5秒', id: 5000 },
            { name: '30秒', id: 30000 },
            { name: '1分钟', id: 60000 },
            { name: '5分钟', id: 300000 }
        ]
        searchField: string = '' // ace组件默认值
        aceEditorVal: string = '' // 查询时ace组件的值
        chartData: any = {}
        loading: boolean = false
        treeLoading: boolean = false
        allFields: Array<any> = []
        conditionParams: any = {}
        executeResult: any = {}
        timer: any = null
        sortParams: any = {
            field: 'timestamp',
            order: 'DESC'
        }
        iconMaps = {
            string: 'weops-font',
            long: 'weops-line-chart',
            date: 'weops-date',
            boolean: 'weops-kai-guan'
        }
        currentSearchInfo: any = {
            time: '',
            begintime: '',
            response: '0ms',
            effectiveTimerange: {},
            searchId: '',
            queryId: '',
            messageId: ''
        }
        group: Array<any> = []
        groupList: Array<any> = []
        allGroupList: Array<any> = []
        defaultTime: any = {}
        // 统计分析面板的集合
        logDataForAnalysis: Array<AnalysisLayout> = []
        // 固定的消息总数的折线图搜索Id
        fixedChartSearchId: string = ''
        currentStateId: string = ''
        panels = [
            { name: 'originalLog', label: '原始日志' },
            { name: 'logCluster', label: '日志聚类' }
        ]
        active: string = 'originalLog'

        get viewCate() {
            const viewList = this.$Copy(viewCateList)
            return viewList.filter(group => {
                if (group.name !== 'log') {
                    return false
                }
                group.views = group.views.filter(view => !['log-msg', 'log-map'].includes(view.type))
                return true
            })
        }
        get belongModule() {
            return this.$store.state.permission.user.applications
        }

        created() {
            this.defaultTime = this.getDefaultTime()
            this.getLogFields()
            this.getAllLogGroupList()
        }

        async mounted() {
            this.loading = true
            await this.getLogGroup()
            this.initFunc()
        }

        beforeDestroy() {
            document.querySelector('body').style.overflow = null
            this.clearTimer()
        }

        getFeildValue(val) {
            return replaceShader(val)
        }
        addPatten(value) {
            const patten = this.aceEditorVal ? `${this.aceEditorVal} AND ${value}` : value
            if (value) {
                this.searchField = patten
                this.$refs.aceEditor.setDefaultVal(this.searchField)
            }
        }
        toTabMenu(item) {
            this.active = item.name
        }
        showFeildDetail(rowGroups, item) {
            const { effectiveTimerange } = this.currentSearchInfo
            if (!Object.keys(effectiveTimerange).length) {
                return
            }
            const params = this.getSaveConditionParams()
            const searchTypes = params.queries[0].search_types[0]
            searchTypes.id = item.fieldId
            searchTypes.row_groups = rowGroups
            params.queries[0].timerange = effectiveTimerange
            params.queries[0].search_types = [searchTypes]
            const logTree:any = this.$refs.logTree
            logTree.getTreeInfo(params, item)
        }
        getDefaultTime() {
            const { timerange, searchField } = this.$route.query
            const defaultTime = {
                type: 'relative',
                minutes: searchField ? 1800 : 900
            }
            try {
                const timeRange: any = JSON.parse(timerange)
                // 处理绝对时间的情况, 添加minutes属性
                if (timeRange.type === 'relative') {
                    timeRange.minutes = timeRange.from
                    delete timeRange.from
                }
                return timerange ? timeRange : defaultTime
            } catch (error) {
                return defaultTime
            }
        }
        initFunc() {
            document.querySelector('body').style.overflow = 'hidden'
            const { searchField = '' } = this.$route.query
            this.searchField = this.aceEditorVal = searchField
            this.handleSearch(searchField ? 'logAdmin' : '')
        }
        // 获取分组列表
        async getLogGroup() {
            const res = await this.$api.logGroup.getUserStreams()
            if (!res.result) {
                return this.$error(res.message)
            }
            this.groupList = res.data
            const { logGroup = '' } = this.$route.query
            const groupIds = this.groupList.map(item => item.id)
            let filters = []
            if (logGroup) {
                filters = groupIds.filter(item => logGroup.split(',').find(sec => sec === item))
            }
            this.group = logGroup ? filters : groupIds
        }
        // 获取全部分组的列表
        async getAllLogGroupList() {
            const res = await this.$api.logGroup.getLogGroup({
                page_size: -1,
                page: 1
            })
            if (!res.result) {
                return false
            }
            const { data: { items } } = res
            this.allGroupList = items
        }
        formatTime(item, id) {
            return id === 'timestamp' ? moment(new Date(item)).format('YYYY-MM-DD HH:mm:ss') : item
        }
        clearTimer() {
            if (this.timer) clearInterval(this.timer)
        }
        // 判断当前的searchId集合是否和stateIdMap的匹配,如果匹配不上数据,stateIdMap设置为undefined
        updateExecuteResult(params, stateId = '') {
            const arraysEqual = (arr1, arr2) => {
                if (arr1.length !== arr2.length) {
                    return false
                }
                return arr1.filter(value => !arr2.includes(value)).length === 0
            }
            this.executeResult = {
                ...this.executeResult,
                ...params,
                results: {
                    ...(params.results ? params.results : this.executeResult.results)
                },
                stateValue: {
                    ...(params.stateValue ? params.stateValue : this.executeResult.stateValue)
                }
            }
            const { search_types: searchTypes = {} } = Object.values(this.executeResult?.results || {})?.[0] || {}
            const { stateValue: { searchIdMap = {} } = {} } = this.executeResult
            // 根据判断结果返回的key集合是否和条件详情的key集合一致
            const isSame = arraysEqual(Object.keys(searchTypes), Object.keys(searchIdMap))
            if (!isSame && this.executeResult.stateValue) {
                delete this.executeResult.stateValue.searchIdMap
            }
            // 更新当前的条件状态id
            if (stateId) {
                this.currentStateId = stateId
            }
        }
        async selectLoadCondition(id) {
            this.loading = true
            await this.getViewDetail(id)
        }
        dealTableKeys(key) {
            return this.fieldList.displayFields.find(item => item.id === key) ? 'displayFields' : 'hideFields'
        }
        dealTableValues(item, fieldKey) {
            return (item.lightenList || []).includes(fieldKey) ? 'dark' : 'light'
        }
        // 根据字段id获取字段类型
        getFieldTypeById(id) {
            const target = this.allFields.find(item => item.id === id)
            return target?.type || 'string'
        }
        // 搜索框change事件
        handleChangeField(val) {
            this.aceEditorVal = val
        }
        // 图表选择时间事件
        selectChartTime(value) {
            const timerange = {
                type: 'absolute',
                from: value.at(),
                to: value.at(-1)
            }
            this.$refs.searchTime.setDefaultTime(timerange)
            this.handleSearch()
        }
        // 当页码发生变化时触发
        handlePageChange(page) {
            this.pageConfig.current = page
            this.handleSearch()
        }
        // 当每页展示条数发生变化时触发
        limitChange(size) {
            this.pageConfig.current = 1
            this.pageConfig.limit = size
            this.handleSearch()
        }
        async getViewDetail(id) {
            const res = await this.$api.log.getViewDetail({ id })
            const { data, message, result } = res
            if (!result) {
                return this.$error(message)
            }
            const { search_id: searchId } = data
            const { widgets, positions, titles: { widget: widgetTitles }, widget_mapping: widgetMapping } = Object.values(data.state)[0]
            const displayFields = (widgets || []).find(item => item.type === 'messages')?.config.fields || []
            this.fieldList.displayFields = this.allFields.filter(item => displayFields.find(sec => sec === item.id)).sort((a, b) => {
                return b.active - a.active
            })
            // 根据positions获取分析面板的数据,包括x,y,w,h,widget等
            await this.handleAnalysisDataByDetail({
                widgets, positions, widgetTitles, widgetMapping, searchId
            }, data, id)
        }
        async handleAnalysisDataByDetail({ widgets, positions, widgetTitles, widgetMapping, searchId }, state, id) {
            const res = await this.$api.log.getLogViewCondition({
                id: searchId
            })
            const { data, message, result } = res
            if (!result) return this.$error(message)
            const positionsArray = Object.entries(positions)
            const filteredPositions = positionsArray.filter(([id, position]) => position.width === 'Infinity')
            const sortedPositions = filteredPositions.sort(([, a], [, b]) => b.row - a.row)
            const sliceData: any[] = sortedPositions.slice(0, 2).map(([id]) => id)
            // 获取消息总数固定的面板searchId
            const chartTypeMap = {
                table: 'log-table',
                pie: 'log-pie',
                line: 'log-line',
                numeric: 'log-single',
                bar: 'log-bar'
            }
            const { search_types: searchTypes, filter } = data.queries[0]
            const filters = filter && filter.filters ? filter.filters : []
            const premissionGroupList = this.groupList.map(e => e.id)
            const allGroupIds = this.allGroupList.map(r => r.id)
            const filterByAllGroups = filters.filter(filter => allGroupIds.includes(filter.id))
            const filteredFilters = filterByAllGroups.filter(item => !premissionGroupList.includes(item.id))
            const matchedNames = filteredFilters.map(filter => {
                const matchedGroup = this.allGroupList.find(group => group.id === filter.id)
                return matchedGroup ? matchedGroup.title : ''
            })
            const subTitle = matchedNames.join(',')
            if (filteredFilters.length > 0) {
                this.loading = false
                this.$bkInfo({
                    type: 'warning',
                    width: 500,
                    title: '加载条件失败，需联系管理员获取以下日志分组权限',
                    subTitle: `${subTitle}`,
                    showFooter: false
                })
                return false
            }
            this.currentStateId = id
            this.fixedChartSearchId = widgetMapping[sliceData[1] || '']?.[0]
            // 当重新加载条件时,记录当前条件的state信息,以便在保存条件时记录更新还是创建
            const { title, search_id: stateSearchId, id: stateId } = state
            this.executeResult.stateValue = { title, searchId: stateSearchId, id: stateId, searchIdMap: {} }
            this.executeResult.stateValue.searchIdMap = Object.fromEntries(
                Object.entries(widgetMapping).map(([key, value]) => [value[0], key])
            )
            const widgetsMap = new Map(widgets.map(widget => [widget.id, widget]))
            const searchTypesMap = new Map(searchTypes.map(row => [row.id, row]))
            // 根据positions里的col,height,row和width获取分析面板的数据,需过滤掉包含在data的数据
            this.logDataForAnalysis = positionsArray.filter(([id, position]) => {
                return !sliceData.includes(id)
            }).map(([id, position], index) => {
                const type = chartTypeMap[widgetsMap.get(id)?.config?.visualization] || 'log-table'
                const curViewCate = this.viewCate?.[0]?.views.find(view => view.type === type)
                const searchId = widgetMapping[id][0]
                return {
                    i: index,
                    x: position.col - 1,
                    y: position.row - 1,
                    w: position.width === 'Infinity' ? 12 : position.width,
                    h: position.height,
                    loading: true,
                    type,
                    widget: curViewCate?.widget,
                    name: curViewCate?.name,
                    searchId,
                    config: {
                        name: widgetTitles[id],
                        view_type: type,
                        logParams: reverseDealLogParams(searchTypesMap.get(searchId))
                    }
                }
            })
            this.getLogData(searchId, 'refresh')
        }
        async handleSearch(timer = null) {
            this.active = 'originalLog'
            this.setLoadingForAnalysis()
            const selectedTime = this.$refs.searchTime.getSelectedTime()
            const isAbsolute = selectedTime.type === 'absolute'
            let timeRange = []
            if (isAbsolute) {
                timeRange = [selectedTime.from, selectedTime.to]
            } else {
                timeRange = getMinutesAgoToNow((selectedTime.minutes || 0) / 60).map(item => moment(item).format('YYYY-MM-DD HH:mm:ss'))
                if (!selectedTime.minutes) {
                    timeRange[0] = '以前'
                }
            }
            this.$refs.chartLine.changeSelectedTime(timeRange)
            this.currentSearchInfo.time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            this.currentSearchInfo.begintime = Date.now()
            this.clearTimer()
            this.loading = timer !== 'interval'
            const params = this.getSaveConditionParams()
            const res = await this.$api.log.createSearchId(params)
            if (!res.result) {
                this.$error(res.message)
                this.loading = false
                return
            }
            this.getLogData(res.data.id, timer)
            if (this.interval) {
                this.clearTimer()
                this.timer = setInterval(() => {
                    this.handleSearch('interval')
                }, this.interval)
            }
        }
        setLoadingForAnalysis() {
            this.logDataForAnalysis.forEach(row => {
                row.loading = true
            })
        }
        getSaveConditionParams() {
            const searchTime: any = this.$refs.searchTime
            const timerange = searchTime.getTimeRange()
            const isAll = !this.group.length
            const filter = {
                type: 'or',
                filters: (isAll ? this.groupList : this.group).map(item => {
                    return {
                        type: 'stream',
                        id: isAll ? item.id : item
                    }
                })
            }
            const params = {
                queries: [
                    {
                        query: {
                            query_string: this.aceEditorVal
                        },
                        timerange,
                        filter,
                        search_types: [
                            {},
                            {
                                limit: this.pageConfig.limit,
                                offset: (this.pageConfig.current - 1) * this.pageConfig.limit,
                                sort: [this.sortParams]
                            }
                        ].concat(this.getAnalysisSearchTypes())
                    }
                ]
            }
            const logSearchConfig: any = new LogSearchConfig(params)
            this.conditionParams = logSearchConfig.getParams()
            const { search_types: searchTypes } = this.conditionParams?.queries?.[0]
            this.fixedChartSearchId = searchTypes.find(row => row.name === 'chart')?.id
            return this.conditionParams
        }
        getAnalysisSearchTypes() {
            const analysisSearchTypes = []
            this.logDataForAnalysis.forEach(row => {
                const { view_type: viewType, logParams } = row.config
                const commonParams = dealCommonParams(logParams)
                row.searchId = commonParams.id
                analysisSearchTypes.push(commonParams)
                const { trendChecked } = logParams
                let trendParams
                if (viewType === 'log-single' && trendChecked) {
                    trendParams = dealTrendParams(commonParams)
                    row.trendId = trendParams.id
                    analysisSearchTypes.push(trendParams)
                }
            })
            return analysisSearchTypes || []
        }
        // 获取日志列表
        async getLogData(id, searchType: string = '') {
            this.active = 'originalLog'
            if (!this.groupList.length) {
                this.chartData = {}
                this.loading = false
                return
            }
            if (searchType === 'refresh') {
                this.currentSearchInfo.time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                this.currentSearchInfo.begintime = Date.now()
            }
            try {
                const res = await this.$api.log.getLogData({ id })
                const { result, message, data } = res
                this.currentSearchInfo.response = Date.now() - this.currentSearchInfo.begintime + 'ms'
                if (!result) {
                    return this.$error(message)
                }
                const logResults: any = Object.values(data.results)[0]
                const {
                    search_types: searchTypes,
                    errors,
                    query: { search_types: querySearch, id: queryId },
                    execution_stats: { effective_timerange: effectiveTimerange }
                } = logResults || {}
                const logData = Object.values(searchTypes || {})
                this.dealAnalysisData(searchTypes, errors, querySearch, effectiveTimerange)
                const logMessage: any = logData.find(({ type }) => type === 'messages') || {}
                const { messages = [] } = logMessage
                const logChart: any = logData.find(({ id }) => id === this.fixedChartSearchId) || {}
                this.logDetail = messages.map(msg => {
                    const { highlight_ranges: highlightRanges } = msg
                    const { message } = msg
                    for (const key of Object.keys(highlightRanges)) {
                        if (message.hasOwnProperty(key)) {
                            const ranges = highlightRanges[key]
                            const result = message[key]
                            let shaderResult = ''
                            let lastIndex = 0
                            for (const range of ranges) {
                                const { start, length } = range
                                const highlighted = `<span class="log-message-shader">${result.slice(start, start + length)}</span>`
                                shaderResult += result.slice(lastIndex, start)
                                shaderResult += highlighted
                                lastIndex = start + length
                            }
                            shaderResult += result.slice(lastIndex)
                            message[key] = shaderResult
                        }
                    }
                    for (const key of Object.keys(message)) {
                        message[key] = replaceLabel(message[key])
                    }
                    return msg
                })
                const { total, rows } = logChart
                this.pageConfig.count = total || 0
                this.currentSearchInfo = {
                    ...this.currentSearchInfo,
                    effectiveTimerange,
                    queryId,
                    searchId: data.search_id,
                    messageId: querySearch.find(item => item.type === 'messages')?.id,
                    total
                }
                const flag = this.pageConfig.count > 100000 || !this.pageConfig.count || !this.belongModule.includes('aiops')
                this.$set(this.panels[1], 'disabled', flag)
                if (flag) {
                    this.active = 'originalLog'
                }
                const xAxisData = rows.filter(item => item.source !== 'non-leaf').map(item => item.key?.[0] || '')
                const yAxisData = rows.filter(item => item.source !== 'non-leaf').map(item => item.values?.[0].value || 0)
                this.chartData = {
                    total,
                    xAxisData,
                    yAxisData,
                    max: Math.max(...yAxisData)
                }
                if (['refresh', 'logAdmin'].includes(searchType)) {
                    this.searchField = logResults?.query.query.query_string || ''
                    const { filters = [] } = logResults?.query.filter
                    const groupIds = this.groupList.map(item => item.id)
                    this.group = !filters?.length ? groupIds : groupIds.filter(item => filters.find(sec => sec.id === item))
                    const { type, from, to } = logResults?.query.timerange
                    const timerange: any = {
                        type
                    }
                    const chartLine: any = this.$refs.chartLine
                    if (type === 'relative') {
                        timerange.from = from || '以前'
                        timerange.minutes = (from || 0)
                        const selectedTime = getMinutesAgoToNow(timerange.minutes / 60).map(item => moment(item).format('YYYY-MM-DD HH:mm:ss'))
                        if (!from) {
                            selectedTime[0] = '以前'
                        }
                        chartLine.changeSelectedTime(selectedTime)
                    } else {
                        timerange.from = moment(from).format('YYYY-MM-DD HH:mm:ss')
                        timerange.to = moment(to).format('YYYY-MM-DD HH:mm:ss')
                        chartLine.changeSelectedTime([timerange.from, timerange.to])
                    }
                    const searchTime: any = this.$refs.searchTime
                    searchTime.setDefaultTime(timerange)
                }
                this.updateExecuteResult(data)
            } catch {
                // 日志信息没数据时，chart不显示
                this.chartData = {}
            } finally {
                this.loading = false
            }
        }

        /*
        * 处理统计分析面板的数据
        * this.logDataForAnalysis的数据循环找到searchId,匹配上logData是个对象{ key: value },key值如果匹配上了searchId
        * 将匹配上的value,当条数据添加一个字段searchValue存储
        * */
        dealAnalysisData(logData: any, errors: any = [], searchTypes: any = [], effectiveTimerange) {
            const errorsMap = new Map(errors.map(err => [err.search_type_id, err]))
            const searchTypesMap = new Map(searchTypes.map(type => [type.id, type]))

            this.logDataForAnalysis.forEach(row => {
                const { searchId, trendId } = row
                const curError = errorsMap.get(searchId)
                const query = searchTypesMap.get(searchId)
                const searchValue = logData[searchId]
                if (searchValue) {
                    row.searchValue = {
                        ...searchValue,
                        curError,
                        query,
                        effectiveTimerange,
                        ...(trendId ? { trendValue: logData[trendId] } : {})
                    }
                    row.loading = false
                }
            })
        }

        // 获取隐藏/显示字段列表
        async getLogFields() {
            const params = {
                timerange: {
                    from: 900,
                    type: 'relative'
                }
            }
            this.treeLoading = true
            try {
                const res = await this.$api.log.getLogFields(params)
                const { result, message, data } = res
                if (!result) {
                    return this.$error(message)
                }
                const fieldData = data.map(item => {
                    return {
                        value: item.name,
                        id: item.name,
                        sort: true,
                        active: item.name === 'timestamp',
                        type: item.type?.type || 'string',
                        rows: []
                    }
                })
                this.fieldList.displayFields = fieldData.filter(item => ['source', 'timestamp'].includes(item.id)).sort((a, b) => b.value.length - a.value.length)
                this.fieldList.hideFields = fieldData.filter(item => !['source', 'timestamp'].includes(item.id))
                this.allFields = fieldData
            } finally {
                this.treeLoading = false
            }
        }

        handleLog(type) {
            if (type === 'alarmModal') {
                const { href } = this.$router.resolve({
                    name: 'AddLogPolicy',
                    query: {
                        queryCondition: this.aceEditorVal
                    }
                })
                window.open(href, '_blank')
                return
            }
            const params: any = {}
            params.allFields = this.allFields
            params.conditionParams = this.conditionParams
            params.executeResult = this.executeResult
            params.displayFields = this.fieldList.displayFields.map(item => item.id)
            if (type === 'saveModal') {
                params.fixedChartSearchId = this.fixedChartSearchId
                params.logDataForAnalysis = this.logDataForAnalysis
            }
            if (['loadModal', 'saveModal'].includes(type)) {
                params.currentStateId = this.currentStateId
            }
            this.$refs[type].show(params)
        }

        getOperationList(param) {
            return this.operationList.filter(item => item.belongedIds?.includes(param) || !item.belongedIds)
        }

        // 排序
        handleSort(item) {
            const selectItem = this.$copy(item)
            this.fieldList.displayFields.forEach(item => {
                item.active = false
                item.sort = true
            })
            item.active = true
            item.sort = selectItem.active ? !selectItem.sort : true
            this.sortParams.field = item.id
            this.sortParams.order = item.sort ? 'DESC' : 'ASC'
            this.handleSearch()
        }

        // popover操作
        handleOperate(operateItem, item) {
            const { type } = operateItem
            // 展示隐藏字段
            if (['display', 'hide'].includes(type)) {
                this.fieldList[`${type}Fields`].push(item)
                const field = type === 'display' ? 'hideFields' : 'displayFields'
                const targetIndex = this.fieldList[field].findIndex(sec => sec.id === item.id)
                if (targetIndex !== -1) {
                    this.fieldList[field].splice(targetIndex, 1)
                }
                return
            }
            // 高亮
            if (type === 'light') {
                this.logDetail.forEach(lightItem => {
                    if (lightItem.lightenList) {
                        lightItem.lightenList.push(item.id)
                        return
                    }
                    lightItem.lightenList = [item.id]
                })
                this.logDetail = [...this.logDetail]
                return
            }
            // 取消高亮
            if (type === 'dark') {
                this.logDetail.forEach(lightItem => {
                    const targetIndex = lightItem.lightenList.findIndex(sec => sec === item.id)
                    lightItem.lightenList.splice(targetIndex, 1)
                })
                this.logDetail = [...this.logDetail]
                return
            }
            // 添加到查询语句、从结果中排除
            if (['addField', 'exclude'].includes(type)) {
                const isAddField = type === 'addField'
                const bridge = `${isAddField ? ' AND ' : ' AND NOT '}`
                const fieldValue = replaceShader(item.fieldValue)
                const vaule = this.dealFieldValue(fieldValue)
                if (item.fieldValue) {
                    this.searchField = `${this.aceEditorVal}${this.aceEditorVal ? bridge : (isAddField ? '' : 'NOT ')}${item.id}:${vaule}`
                } else {
                    this.searchField = `${this.aceEditorVal}${this.aceEditorVal ? bridge : (isAddField ? '' : 'NOT ')}_exists_:${item.id}`
                }
                this.$refs.aceEditor.setDefaultVal(this.searchField)
                return
            }
            // 创建提取器
            if (type === 'extract') {
                const selectExtractor: any = this.$refs.selectExtractor
                item.fieldValue = replaceShader(item.fieldValue)
                selectExtractor.show(item)
            }
            // type为analysis时, 统计分析
            if (type === 'analysis') {
                this.handleAnalysisData(item)
            }
        }
        getMaxIndex(): number {
            const layoutValue: any = this.logDataForAnalysis.reduce((max, item) => {
                return item.i > max ? item.i : max
            }, 0)
            return layoutValue + 1
        }
        /*
        * 统计分析
        * 添加面板的数据,添加到logDataForAnalysis数组中
        * 默认是表格组件,定位位置为最后一个面板
        * */
        handleAnalysisData(field) {
            const { id, type } = field
            const i: number = this.getMaxIndex()
            const data: AnalysisLayout = {
                x: 0,
                y: 0,
                i,
                h: 4,
                w: 4,
                loading: true,
                type: 'log-table',
                widget: 'log-table',
                name: '表格',
                config: {
                    name: `统计分析: ${id}`,
                    view_type: 'log-table',
                    logParams: getLogParamsForAnalysis(id, type)
                }
            }
            // 将新数据插入到数组末尾
            this.logDataForAnalysis.push(data)
            this.computedLogLayout(data)
        }
        dealFieldValue(val) {
            if (Array.isArray(val)) {
                return JSON.stringify(val).replace(/^\[|\]$/g, '')
            }
            return `\"${String(val).replace(/"/g, '\\"')}\"`
        }
        // 是否开始轮询
        handleStart() {
            this.clearTimer()
            this.isStarted = !this.isStarted
            if (!this.isStarted) {
                this.interval = this.intervalList[0].id
                return
            }
            this.interval = this.intervalList[3].id
        }
        // 选择轮询间隔时触发
        handleIntervalChange(id) {
            this.clearTimer()
            this.isStarted = !!id
            if (this.isStarted) {
                this.handleSearch('interval')
            }
        }

        checkLogSyntax() {
            this.$refs.logSyntax.show()
        }

        handleCopy(item) {
            const { searchValue, searchId, ...data } = item
            const i: number = this.getMaxIndex()
            // 将新数据插入到数组末尾
            this.logDataForAnalysis.push({
                ...data,
                i
            })
           this.computedLogLayout(data)
        }

        handleCopyToPanel(item) {
            return 0
            // const dashboardModal: any = this.$refs.dashboardModal
            // const params = item
            // params.config.logParams['logGroup'] = this.group
            // params.config.logParams['aceEditorVal'] = this.aceEditorVal
            // dashboardModal.show(params)
        }

        computedLogLayout(data) {
            // 计算新数据的 x 和 y 值, 从左往右布局
            const lastItem = this.logDataForAnalysis[this.logDataForAnalysis.length - 2]
            if (lastItem) {
                data.x = lastItem.x + lastItem.w
                data.y = lastItem.y
                if (data.x + data.w > 12) {
                    data.x = 0
                    data.y = lastItem.y + lastItem.h
                }
            }
            this.handleSearch()
        }

        // 编辑分析面板
        handleEditPanel(item: any) {
            const editView: any = this.$refs.editView
            editView.updateView(item)
        }

        /*
        * 更新面板信息
        * @param data: 更新后的数据 id为this.logDataForAnalysis数组对象内的属性i
        * 在this.logDataForAnalysis中找到对应的对象, 更新对象的config属性
        * @param id: 面板id
        * */
        handleUpdatePanel(data: any, id: string) {
            const item = this.logDataForAnalysis.find(item => item.i === id)
            if (item) {
                item.config = data
            }
            const { name, type, widget } = this.viewCate?.[0]?.views.find(r => r.type === data.view_type)
            item.name = name
            item.type = type
            item.widget = widget
            this.handleSearch()
        }

        handleDeletePanel(item) {
            const index = this.logDataForAnalysis.findIndex(r => r.i === item.i)
            this.logDataForAnalysis.splice(index, 1)
            this.handleSearch()
        }
    }
</script>

<style scoped lang="scss">
.log-wrapper {
    .log-wrapper-search {
        display: flex;
        margin-bottom: 10px;

        .search-time {
            display: flex;
            align-items: center;

            .search-time-interval {
                width: 120px;
                display: flex;
                align-items: center;
                background: #3a84ff;
            }

            /deep/.bk-button.no-slot .left-icon {
                margin-right: 8px;
                font-size: 18px;
            }

            /deep/.bk-select {
                background: #3a84ff;
                border: 1px solid #3a84ff;
                border-radius: 0;
            }

            /deep/.bk-select-name,
            /deep/.bk-select-angle {
                color: #fff;
            }
        }

        .search-group {
            width: 250px;
            min-width: 250px;
            margin-right: 10px;
            background: #fff;
        }

        .search-field {
            width: 100%;
            display: flex;
            align-items: center;
            margin-right: 20px;

            /deep/.bk-form-input {
                padding-right: 24px !important;
            }

            .weops-deng-pao {
                font-size: 24px;
                cursor: pointer;
                color: #3a84ff;
            }
        }
    }

    .log-wrapper-operate {
        display: flex;
        margin-bottom: 10px;

        .operate-btn {
            margin-right: 10px;
            border-right: 1px solid #aaa;
        }
    }

    .log-wrapper-chat {
        background: #fff;
        margin-bottom: 10px;
    }

    .log-wrapper-main {
        height: 100%;
        display: flex;
        position: relative;
        /deep/ .line-container {
            width: 180px;
            background-image: none;
            position: absolute !important;
            top: 0;
            right: 10px;
            z-index: 99;
            margin-right: 20px;
        }
        /deep/ .log-wrapper-nav-area {
            height: 36px;
        }
    }

    .widget-container-wrapper {
        .grid-layout-container {
            margin: -10px -10px 0 -10px;
            .vue-grid-item {
                display: inline-block;
                background: #ffffff;
                position: relative;
                padding: 5px;
                .vue-draggable-handle {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    top: 5px;
                    left: 5px;
                    span {
                        font-size: 18px !important;
                        color: #989898;
                    }
                }
                .header {
                    display: flex;
                    height: 30px;
                    line-height: 20px;
                    .title {
                        flex: 1;
                        text-align: center;
                    }
                }
                .no-drag {
                    height: 100%;
                    .content {
                        height: 100%;
                    }
                }
            }
        }
    }
}
</style>
