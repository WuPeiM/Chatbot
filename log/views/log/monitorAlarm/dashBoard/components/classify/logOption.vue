<template>
    <div class="log-option mt20">
        <bk-form-item
            v-if="!isAnalysisPanel"
            required
            label="日志分组"
            property="logGroup"
            :error-display-type="'normal'">
            <bk-select
                v-model="paramsFormData.logGroup"
                :loading="groupLoading"
                multiple
                display-tag
                searchable>
                <bk-option v-for="option in groupList"
                    :key="option.id"
                    :id="option.id"
                    :name="option.title">
                </bk-option>
            </bk-select>
        </bk-form-item>
        <bk-form-item
            v-if="!isAnalysisPanel"
            required
            label="查询语句"
            property="aceEditorVal"
            :error-display-type="'normal'">
            <div :class="[!!paramsFormData.aceEditorVal && 'hide-placeholder', 'ace-editor-container']">
                <ace-editor
                    ref="aceEditor"
                    placeholder="在此处输入您的搜索查询"
                    :fields="allFields"
                    :value="paramsFormData.aceEditorVal"
                    @change="handleChangeField" />
            </div>
        </bk-form-item>
        <div class="param-wrap">
            <div class="param-title">
                <div class="title-wrap">
                    <span>分组</span>
                    <div class="line"></div>
                    <i class="bk-icon icon-plus" @click="addParamItem('group')"></i>
                </div>
                <bk-checkbox v-model="paramsFormData.columnRollup" :disabled="disableColumnRollup">
                    汇总列
                    <bk-icon
                        type="question-circle-shape"
                        v-bk-tooltips="'启用汇总后，将包括一个总计单个子跟踪的附加跟踪。'" />
                </bk-checkbox>
            </div>
            <div class="param-content">
                <Draggable
                    :list="paramsFormData.group"
                    v-bind="getDragOptions('group')">
                    <transition-group>
                        <div
                            class="param-item group-item"
                            v-for="(item, index) in paramsFormData.group"
                            :key="`group-${index}`">
                            <bk-form-item label="排序类型" property="sort-type">
                                <bk-radio-group
                                    v-model="item.direction"
                                    @change="changeGroupDirect(item, index)">
                                    <bk-radio
                                        v-for="dirItem in directList"
                                        :key="dirItem.type"
                                        :value="dirItem.type">
                                        {{dirItem.label}}
                                    </bk-radio>
                                </bk-radio-group>
                            </bk-form-item>
                            <bk-form-item
                                label="字段"
                                required
                                :rules="rules.field(item)"
                                :error-display-type="'normal'">
                                <bk-select
                                    :loading="fieldLoading"
                                    v-model="item.field"
                                    :clearable="false"
                                    searchable
                                    @change="changeGroupField(item)">
                                    <bk-option
                                        v-for="option in allFields"
                                        :key="option.id"
                                        :id="option.id"
                                        :name="option.value"
                                        :disabled="optDisabledFun(item, option, index)">
                                    </bk-option>
                                </bk-select>
                            </bk-form-item>
                            <bk-form-item
                                v-if="item.isDateType"
                                label="聚合"
                                required
                                property="duration"
                                :rules="rules.duration(item)"
                                :error-display-type="'normal'">
                                <div class="duration-wrap">
                                    <bk-input
                                        type="number"
                                        :min="1"
                                        :max="1000"
                                        :precision="0"
                                        v-model="item.duration">
                                    </bk-input>
                                    <bk-select v-model="item.unit" :clearable="false">
                                        <bk-option v-for="option in unitList"
                                            :key="option.id"
                                            :id="option.id"
                                            :name="option.label">
                                        </bk-option>
                                    </bk-select>
                                </div>
                            </bk-form-item>
                            <bk-form-item
                                v-else
                                required
                                label="限制数量"
                                property="limit"
                                :rules="rules.limit(item)"
                                :error-display-type="'normal'">
                                <bk-input
                                    type="number"
                                    :max="1000"
                                    :min="1"
                                    :precision="0"
                                    v-model="item.limit">
                                </bk-input>
                            </bk-form-item>
                            <div class="operate">
                                <i class="cw-icon weops-drag-drop" />
                                <i
                                    class="bk-icon icon-delete"
                                    @click="handleRemove(paramsFormData.group, index)" />
                            </div>
                        </div>
                    </transition-group>
                </Draggable>
            </div>
        </div>
        <div class="param-wrap">
            <div class="param-title">
                <div class="title-wrap">
                    <span>度量</span>
                    <div class="line"></div>
                    <i class="bk-icon icon-plus" @click="addParamItem('measure')"></i>
                </div>
            </div>
            <div class="param-content">
                <div
                    class="param-item"
                    v-for="(item, index) in paramsFormData.measure"
                    :key="`measure-${index}`">
                    <bk-form-item
                        label="函数"
                        required
                        :rules="rules.type(item)"
                        :error-display-type="'normal'">
                        <bk-select
                            v-model="item.type"
                            searchable
                            :clearable="false"
                            @change="changeItemFunc($event, item)">
                            <bk-option v-for="option in funList"
                                :key="option.type"
                                :id="option.type"
                                :name="option.description">
                            </bk-option>
                        </bk-select>
                    </bk-form-item>
                    <bk-form-item
                        label="字段"
                        :required="item.type !== 'count'"
                        property="measureField"
                        :rules="rules.measureField(item)"
                        :error-display-type="'normal'">
                        <bk-select
                            :loading="fieldLoading"
                            v-model="item.field"
                            :clearable="item.type === 'count'"
                            searchable>
                            <bk-option
                                v-for="option in allFields"
                                :key="option.id"
                                :id="option.id"
                                :name="option.value">
                            </bk-option>
                        </bk-select>
                    </bk-form-item>
                    <bk-form-item
                        required
                        v-if="item.isPercentile"
                        label="百分位数"
                        property="percentile"
                        :rules="rules.percentile(item)"
                        :error-display-type="'normal'">
                        <bk-select v-model="item.percentile" :clearable="false">
                            <bk-option
                                v-for="option in percentileOpts"
                                :key="option.value"
                                :id="option.value"
                                :name="option.label">
                            </bk-option>
                        </bk-select>
                    </bk-form-item>
                    <bk-form-item label="名称" property="measure-name">
                        <bk-input placeholder="指定显示名称" v-model="item.name">
                        </bk-input>
                    </bk-form-item>
                    <div class="operate">
                        <i class="bk-icon icon-delete" @click="handleRemove(paramsFormData.measure, index)"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="param-wrap">
            <div class="param-title">
                <div class="title-wrap">
                    <span>排序</span>
                    <div class="line"></div>
                    <i class="bk-icon icon-plus" @click="addParamItem('order')"></i>
                </div>
            </div>
            <div class="param-content">
                <Draggable
                    :list="paramsFormData.group"
                    v-bind="getDragOptions('order')">
                    <transition-group>
                        <div
                            class="param-item"
                            v-for="(item, index) in paramsFormData.order"
                            :key="`order-${index}`">
                            <bk-form-item
                                label="字段"
                                required
                                property="orderField"
                                :rules="rules.orderField(item)"
                                :error-display-type="'normal'">
                                <bk-select
                                    v-model="item.field"
                                    searchable
                                    :clearable="false"
                                    placeholder="指定要排序的字段/指标"
                                    @change="changeOrderField(item)">
                                    <bk-option
                                        v-for="option in displayFields"
                                        :key="option.id"
                                        :id="option.id"
                                        :name="option.value">
                                    </bk-option>
                                </bk-select>
                            </bk-form-item>
                            <bk-form-item
                                label="排序类型"
                                required
                                property="orderType"
                                :rules="rules.orderType(item)"
                                :error-display-type="'normal'">
                                <bk-select
                                    v-model="item.orderType"
                                    :clearable="false"
                                    searchable>
                                    <bk-option v-for="option in orderList"
                                        :key="option.label"
                                        :id="option.label"
                                        :name="option.value">
                                    </bk-option>
                                </bk-select>
                            </bk-form-item>
                            <div class="operate">
                                <i class="cw-icon weops-drag-drop"></i>
                                <i class="bk-icon icon-delete" @click="handleRemove(paramsFormData.order, index)"></i>
                            </div>
                        </div>
                    </transition-group>
                </Draggable>
            </div>
        </div>
        <div class="param-wrap" v-if="['log-single', 'log-bar'].includes(formData.view_type)">
            <div class="param-title">
                <div class="title-wrap">
                    <span>可视化</span>
                    <div class="line"></div>
                </div>
            </div>
            <div class="param-content trend-content">
                <div class="param-item" v-if="formData.view_type === 'log-single'">
                    <bk-checkbox
                        v-model="paramsFormData.trendChecked"
                        @change="changeTrendChecked">
                        趋势
                        <bk-icon
                            type="question-circle-shape"
                            v-bk-tooltips="'启用趋势后，当前值下方会显示一个单独的框，通过图标以及</br>当前值与前一个值之间的绝对和相对差异指示变化的方向。'" />
                    </bk-checkbox>
                    <div class="desc">显示此值的趋势信息</div>
                    <bk-select
                        :clearable="false"
                        v-if="paramsFormData.trendChecked"
                        v-model="paramsFormData.trendDirect">
                        <bk-option
                            v-for="option in trendList"
                            :key="option.type"
                            :id="option.type"
                            :name="option.label">
                        </bk-option>
                    </bk-select>
                </div>
                <div v-else style="display: flex;align-items: center;" class="param-item">
                    <span>模式</span>
                    <bk-select
                        style="flex: 1; margin: 0 0 0 12px;"
                        :clearable="false"
                        v-model="paramsFormData.barMode">
                        <bk-option
                            v-for="option in modeList"
                            :key="option.type"
                            :id="option.type"
                            :name="option.label">
                        </bk-option>
                    </bk-select>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

    import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
    // @ts-ignore
    import AceEditor from '@log/views/components/aceEditor'
    import Draggable from 'vuedraggable'
    import { ViewForm } from '../../types/index'
    import {
        TIME_UNITS,
        FUN_MAP,
        ORDER_LIST,
        VIEW_MAP,
        DIRECTION_LIST,
        TREND_LIST,
        MODE_LIST,
        PERCENTILE
    } from '../../views'

    const TEMPLATE_MAP = {
        group: {
            direction: 'row',
            field: '',
            duration: 1,
            unit: 'minutes',
            limit: 15
        },
        measure: {
            type: '',
            field: '',
            name: '',
            percentile: 25
        },
        order: {
            field: '',
            orderType: ''
        }
    }
    const INIT_FORM = {
        logGroup: [], // 日志分组
        aceEditorVal: '*', // 查询时ace组件的值
        columnRollup: true,
        group: [],
        measure: [],
        order: [],
        barMode: 'group', // group/stack
        trendChecked: false,
        trendDirect: 'up' // up/down/universal
    }
    @Component({
        components: {
            AceEditor,
            Draggable
        }
     })
    export default class LogOption extends Vue {
        @Prop({ type: Object }) formData: ViewForm
        @Prop({ type: Object }) rules: any
        @Prop({ type: Boolean, default: false }) isAnalysisPanel: boolean
        @Prop({ type: Boolean, default: false }) isMapToOther: boolean
        fieldLoading = false
        funcLoading = false
        groupLoading: boolean = false
        optDisabledMap = {}
        allFields: Array<any> = []
        groupList: Array<any> = []
        unitList = TIME_UNITS
        funList = FUN_MAP
        orderList = ORDER_LIST
        directList = DIRECTION_LIST
        modeList = MODE_LIST
        trendList = TREND_LIST
        percentileOpts = PERCENTILE.map((value) => ({ label: value, value }))
        paramsFormData = this.$Copy(INIT_FORM)

        created() {
            this.initParamRules()
            const logParams = this.formData.logParams || {}
            for (const key in this.paramsFormData) {
                if (logParams.hasOwnProperty(key) && key !== 'logGroup') {
                   this.paramsFormData[key] = logParams[key]
                }
            }
            if (this.isMapToOther && logParams.localeField) {
                this.paramsFormData.measure = [
                    {
                        field: logParams.localeField,
                        isPercentile: false,
                        name: '',
                        type: 'count'
                    }
                ]
                this.paramsFormData.group = [
                    {
                        direction: 'row',
                        duration: 1,
                        field: logParams.localeField,
                        isDateType: false,
                        limit: '15',
                        unit: 'minutes'
                    }
                ]
            }
            this.getLogFields()
            this.getLogGroup()
        }

        mounted() {
            // 判断排除字段是否包含aceEditorVal,不包含则初始化编辑器
            if (!this.isAnalysisPanel) {
                const aceEditor: any = this.$refs.aceEditor
                aceEditor.setDefaultVal(this.formData.logParams?.aceEditorVal || '*')
            }
        }

        get optDisabledFun() {
            return (item, option, index) => {
                const target = this.optDisabledMap[`${option.id}-${item.direction}`]
                return target && target.selected && target.index !== index
            }
        }

        get isTimeGrouping() {
            return !!this.paramsFormData.group.find(({ direction, isDateType }) => {
                return direction === 'row' && isDateType
            })
        }

        get disableColumnRollup() {
            return !this.paramsFormData.group.find(({ direction = '' } = {}) => direction === 'column')
        }

        get displayFields() {
            const result = []
            this.paramsFormData.measure.forEach(({ field, type, name }) => {
                if (!type) return
                const key = `${type}${`(${field || ''})`}`
                result.push({
                    type: 'series',
                    id: key,
                    value: name || key
                })
            })
            this.paramsFormData.group.forEach(({ field, direction }) => {
                if (!field || direction !== 'row') return
                result.push({
                    type: 'pivot',
                    id: field,
                    value: field
                })
            })
            return result
        }

        @Watch('disableColumnRollup', { immediate: true })
        disableColumnChange() {
            this.paramsFormData.columnRollup = true
        }

        @Watch('paramsFormData.group', { deep: true })
        @Watch('paramsFormData.measure', { deep: true })
        handleGroupChange(newVal) {
            this.paramsFormData.order.forEach(el => {
                if (!this.displayFields.find(item => item.id === el.field)) {
                    el.field = ''
                }
            })
            // 切换分组需要重新校验排序
            if (newVal[0]?.direction && this.paramsFormData.order?.length) {
                this.$nextTick().then(() => {
                    const formRef: any = this.$parent
                    formRef.validateField('orderField')
                })
            }
        }

        @Watch('paramsFormData.group', { deep: true })
        getOptDisabledMap() {
            const mapData = {}
            this.paramsFormData.group.forEach((el, index) => {
                mapData[`${el.field}-${el.direction}`] = {
                    index,
                    selected: true
                }
            })
            this.optDisabledMap = mapData
        }

        initCompFormItem() {
            const INIT_FORM = {
                logParams: null
            }
            Object.entries(INIT_FORM).forEach(({ 0: key, 1: value }) => {
                if (!this.formData.hasOwnProperty(key)) {
                    this.$set(this.formData, key, value)
                }
            })
        }

        // 父组件编辑提交前校验, group分组按先行后列排序
        validSubmit() {
            const { view_type: type } = this.formData
            const { measure = [], group = [] } = this.paramsFormData
            if (['log-line', 'log-bar', 'log-pie'].includes(type) && !measure.length) {
                this.$error(`日志${VIEW_MAP[type]}至少需要一个指标`)
                return false
            }
            group.sort(({ direction: aDir }, { direction: bDir }) => {
                if (aDir === 'row' && bDir === 'column') return -1
                if (bDir === 'row' && aDir === 'column') return 1
            })
            this.formData.logParams = this.paramsFormData
            return true
        }

        addParamItem(key) {
            this.paramsFormData[key].push(this.$Copy(TEMPLATE_MAP[key]))
            if (key === 'order') {
                this.$nextTick().then(() => {
                    const formRef: any = this.$parent
                    formRef.validateField('orderField')
                })
            }
        }
        changeOrderField(item) {
            const target = this.displayFields.find(el => el.id === item.field)
            if (target) {
                this.$set(item, 'type', target.type)
            }
        }
        changeItemFunc(val, item) {
            const defaultPercent = 25
            this.$set(item, 'isPercentile', val === 'percentile')
            item.percentile = item.isPercentile ? defaultPercent : undefined
        }
        changeGroupDirect(item, index) {
            const target = this.optDisabledMap[`${item.field}-${item.direction}`]
            if (target && target.selected && target.index !== index) {
                this.$set(item, 'field', '')
            }
        }
        changeGroupField(item) {
            const DateType = 'date'
            const target = this.allFields.find(el => el.id === item.field)
            if (target) {
                this.$set(item, 'isDateType', target.type === DateType)
            }
        }
        changeTrendChecked(val) {
            if (val && !this.paramsFormData.trendDirect) {
                this.paramsFormData.trendDirect = 'up'
            }
        }
        async getLogFields() {
            const params: any = {
                timerange: {
                    type: 'relative'
                }
            }
            if (this.isMapToOther) {
                params.timerange.range = 0
            } else {
                params.timerange.from = 900
            }
            this.fieldLoading = true
            const { result, message, data } = await this.$api.log.getLogFields(params)
            .finally(() => {
                this.fieldLoading = false
            })
            if (!result) return this.$error(message)
            this.allFields = data.map(item => ({
                value: item.name,
                id: item.name,
                type: item.type?.type || 'string'
            }))
        }
        // 获取分组列表
        async getLogGroup() {
            this.groupLoading = true
            try {
                const res = await this.$api.logGroup.getUserStreams()
                if (!res.result) {
                    return this.$error(res.message)
                }
                this.groupList = res.data
                this.paramsFormData.logGroup = this.formData.logParams?.logGroup || this.groupList.map(item => item.id)
            } finally {
                this.groupLoading = false
            }
        }
            // 搜索框change事件
        handleChangeField(val) {
            this.paramsFormData.aceEditorVal = val
            const formRef: any = this.$parent
            formRef.validateField('aceEditorVal')
        }
        handleRemove(list, index) {
            list.splice(index, 1)
        }
        getDragOptions(name) {
            return {
                group: name,
                draggable: '.param-item',
                handle: '.weops-drag-drop',
                animation: '300'
            }
        }
        initParamRules() {
            const that = this
            const requireList = ['field', 'duration', 'limit', 'type', 'orderType', 'percentile']
            requireList.forEach(name => {
                this.rules[name] = (item) => [
                    {
                        message: '必填字段',
                        trigger: 'blur',
                        validator: function() {
                            return !!item[name]
                        }
                    }
                ]
            })
            const otherList = ['logGroup', 'aceEditorVal']
            otherList.forEach(name => {
                this.rules[name] = [
                    {
                        message: '必填字段',
                        trigger: 'blur',
                        validator: function() {
                            return !!that.paramsFormData[name].length
                        }
                    }
                ]
            })
           this.rules.orderField = (item) => [
                {
                    message: '使用基于时间的行分组对非数据表进行排序不起作用',
                    trigger: 'change',
                    validator: function() {
                        return !that.isTimeGrouping || that.formData.view_type === 'log-table'
                    }
                },
                {
                    message: '必填字段',
                    trigger: 'change',
                    validator: function() {
                        return !!item.field
                    }
                }
            ]
            this.rules.measureField = (item) => [
                {
                    message: '必填字段',
                    trigger: 'change',
                    validator: function() {
                        return item.type === 'count' || item.field
                    }
                }
            ]
        }
    }
</script>

<style lang="scss" scoped>
.ace-editor-container {
    display: flex;
    .ace-editor {
        /deep/ {
            .ace-queryinput {
                border: 1px solid #c4c6cc;
                color: #63656e;
                .ace-placeholder {
                    font-family: "PingFang SC";
                    color: #c6ccd8;
                }
            }
        }
    }
    &.hide-placeholder {
        .ace-editor {
            /deep/ {
                .ace-queryinput {
                    .ace-placeholder {
                        display: none;
                    }
                }
            }
        }
    }
}
/deep/ .bk-form-item.is-error {
    .ace-queryinput {
        border-color: #ff5656;
        color: #ff5656;
    }
}
</style>
