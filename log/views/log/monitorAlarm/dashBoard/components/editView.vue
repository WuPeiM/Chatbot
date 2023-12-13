<template>
    <bk-sideslider
        :width="480"
        :before-close="handleClose"
        :is-show.sync="visible"
        ext-cls="common-dialog-wrapper">
        <div slot="header">
            编辑视图
            <span class="sub-title" v-if="viewMaps[originForm.view_type]">
                - {{ viewMaps[originForm.view_type] || '--' }}
            </span>
        </div>
        <div slot="content"
            class="common-dialog-wrapper-main">
            <bk-form
                :label-width="isLogType ? 80 : 100"
                :rules="rules"
                ref="viewForm"
                :model="formData">
                <bk-form-item
                    label="视图名称"
                    :required="true"
                    :property="'name'"
                    :error-display-type="'normal'">
                    <bk-input v-model="formData.name" :clearable="true"></bk-input>
                </bk-form-item>
                <bk-form-item
                    label="视图类型"
                    :required="true"
                    :property="'view_type'"
                    v-if="type === 'edit'"
                    :error-display-type="'normal'">
                    <bk-cascade
                        v-model="selectedTypes"
                        :list="cateViewsList"
                        style="width: 100%;"
                        @change="handleChangeType">
                    </bk-cascade>
                </bk-form-item>
                <template v-if="compName">
                    <component
                        :is="`${compName}Option`"
                        :ref="`${compName}Option`"
                        :rules="rules"
                        :is-confirm="isConfirm"
                        :form-data="formData"
                        :is-map-to-other="isMapToOther"
                        :is-analysis-panel="isAnalysisPanel"
                        :range-type="rangeType"
                        :time-range="timeRange"
                        :condition-params-value="conditionParamsValue" />
                </template>
            </bk-form>
            <div class="preview-container" v-if="isPrevVisible">
                <p class="title">
                    <bk-icon type="close" @click="isPrevVisible = false" />
                    视图预览
                </p>
                <div class="content" v-if="rowInfo">
                    <component
                        v-bind="$attrs"
                        :id="rowInfo.id"
                        :row="rowInfo"
                        :is="widgetName"
                        :range-type="rangeType"
                        :time-range="timeRange"
                        :condition-params-value="conditionParamsValue">
                    </component>
                </div>
            </div>
        </div>
        <template slot="footer">
            <bk-button
                :theme="'primary'"
                :title="'确认'"
                class="mr10"
                @click="handleConfirmEdit">
                确认
            </bk-button>
            <bk-button
                :title="'预览'"
                class="mr10"
                v-if="!isAnalysisPanel"
                @click="handlePreview">
                预览
            </bk-button>
            <bk-button
                :title="'取消'"
                @click="handleClose()">
                取消
            </bk-button>
        </template>
    </bk-sideslider>
</template>

<script lang="ts">
    import LineOption from './classify/lineOption.vue'
    import DashBoardOption from './classify/dashboardOption.vue'
    import CapitalOption from './classify/capitalOption.vue'
    import AutoProtectOption from './classify/autoProtectOption.vue'
    import LogOption from './classify/logOption.vue'
    import MonitorOption from './classify/monitorOption.vue'
    import MessageOption from './classify/messageOption.vue'
    import MapOption from './classify/mapOption.vue'
    import SeniorOption from './classify/seniorOption.vue'
    import ConditionalOption from './classify/conditionalOption.vue'
    import { VIEW_MAP } from '../views'
    import { ViewsData, ViewForm } from '../types/index'
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

    // 自动引入views下的组件
    const modulesFiles = require.context('../views', true, /\.vue$/)
    const modules = modulesFiles.keys().reduce((modules, modulePath) => {
        const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
        const value = modulesFiles(modulePath)
        modules[moduleName] = value.default
        return modules
    }, {})

    const BASE_FORM = {
        name: '',
        view_type: ''
    }

    const BASE_RULE = {
        name: [{
            required: true,
            message: '请输入视图名称',
            trigger: 'blur'
        }]
    }

    @Component({
        components: {
            MonitorOption,
            LineOption,
            DashBoardOption,
            CapitalOption,
            AutoProtectOption,
            LogOption,
            MapOption,
            MessageOption,
            SeniorOption,
            ConditionalOption,
            ...modules
        }
    })
    export default class EditView extends Vue {
        @Prop({ type: Array }) viewCate: Array<ViewsData>
        @Prop({ type: Boolean, default: false }) showAsset: boolean // 表单是否显示资产展示
        @Prop({ type: Boolean, default: false }) isAnalysisPanel: boolean
        @Prop() rangeType: string
        @Prop() timeRange: string
        @Prop({ default: () => ({}) }) conditionParamsValue: any
        visible: boolean = false
        metricLoading: boolean = false
        formData: ViewForm = this.$Copy(BASE_FORM)
        originForm: ViewForm = this.$Copy(BASE_FORM)
        rules: any = BASE_RULE
        id: string = ''
        type: string = 'add'
        compName: string = ''
        isConfirm: boolean = false
        viewMaps = VIEW_MAP
        rowInfo = null
        widgetName = ''
        isPrevVisible = false
        isMapToOther: boolean = false
        selectedTypes = []

        get isLogType() {
            return this.formData.view_type.includes('log-')
        }

        get cateViewsList() {
            const result = this.viewCate.map(el => ({
                id: el.name,
                name: el.label,
                children: el.views.map(view => ({ name: view.name, id: view.type }))
            }))
            return result.length === 1 ? result[0].children : result
        }

        @Watch('formData.view_type', { immediate: true, deep: true })
        updateViewType(newVal: string, oldVal: string) {
            this.isMapToOther = oldVal === 'log-map'
        }

        show(type: string) {
            this.visible = true
            this.initData(type)
        }

        async updateView(row: any) {
            this.visible = true
            this.type = 'edit'
            this.id = row.i
            const config = row?.config || {}
            const viewType = config?.view_type
            this.originForm = JSON.parse(JSON.stringify(config))
            this.formData = this.$deepClone(this.originForm)
            this.updateViewConfig(viewType)
            this.initSelectedTypes(viewType)
            setTimeout(_ => {
                // updateView在每个视图内编辑时更新的方法
                this.workCompFunction('updateCompView', row)
            }, 0)
        }

        // 执行compOption内部方法
        workCompFunction(funTarget: string, params?: any) {
            const comp: any = this.$refs[`${this.compName}Option`]
            if (comp && comp[funTarget] instanceof Function) {
                return comp[funTarget](params)
            } else {
                return true
            }
        }

        findGroupNameByType(type) {
            return this.viewCate.find(item => item.views.find(view => view.type === type))?.name
        }

        initData(type: string) {
            this.type = 'add'
            this.originForm = {
                ...this.$Copy(BASE_FORM),
                view_type: type,
                aggregate_type: ['dashboard', 'single'].includes(type) ? 'mean' : '',
                showAsset: this.showAsset
            }
            this.formData = this.$Copy(this.originForm)
            this.updateViewConfig(type)
            this.initSelectedTypes(type)
        }

        initSelectedTypes(type) {
            this.selectedTypes = [this.findGroupNameByType(type), type]
        }

        handleChangeType(types = []) {
            this.formData.view_type = types.at(-1)
            this.updateViewConfig(types.at(-1))
        }

        updateViewConfig(type: string) {
            this.isPrevVisible = false
            const { view_type: viewType } = this.formData
            switch (viewType) {
                case 'log-msg':
                    this.compName = 'message'
                    break
                case 'log-map':
                    this.compName = 'map'
                    break
                case 'dropdown-list':
                case 'text-parameter':
                    this.compName = 'conditional'
                    break
                default:
                    this.compName = this.findGroupNameByType(type)
                    break
            }
        }

        getPreviewWidget() {
            let target = null
            this.viewCate.forEach(({ views }) => {
                views.forEach((el) => {
                    if (el.type === this.formData.view_type) {
                        target = el
                    }
                })
            })
            this.widgetName = target?.widget
        }

        handleClose() {
            this.visible = false
            if (this.type === 'edit') {
                this.$emit('update', this.originForm, this.id)
            }
        }

        handlePreview() {
            const viewForm: any = this.$refs.viewForm
            viewForm.validate().then(validator => {
                if (!this.workCompFunction('validSubmit')) return
                this.getPreviewWidget()
                this.rowInfo = null
                this.isPrevVisible = true
                const BASE_LAYOUT = {
                    w: 6, // 仪表盘计算每行显示个数
                    i: 9999 // id给个较大值
                }
                this.$nextTick(() => {
                    this.rowInfo = {
                        ...BASE_LAYOUT,
                        config: this.$Copy(this.formData)
                    }
                })
            }).catch(() => {
                this.$el.querySelector('.bk-form-item.is-error')?.scrollIntoView()
            })
        }

        handleConfirmEdit() {
            const viewForm: any = this.$refs.viewForm
            viewForm.validate().then(validator => {
                this.isConfirm = true
                if (!this.workCompFunction('validSubmit')) return
                this.visible = false
                if (this.type === 'edit') {
                    this.$emit('update', this.formData, this.id)
                    this.$emit('submit', this.formData, this.id)
                    if (this.formData?.paramName !== this.originForm?.paramName) {
                        this.$emit('paramNameChange', this.originForm?.paramName, this.formData?.paramName)
                    }
                } else {
                    this.$emit('confirm', this.formData)
                }
            }).catch(() => {
                this.$el.querySelector('.bk-form-item.is-error')?.scrollIntoView()
            })
        }
    }
</script>

<style lang="scss" scoped>
.preview-container {
    width: 540px;
    height: 100%;
    position: fixed;
    right: 480px;
    background: #fff;
    top: 0;
    border-right: 1px solid #dcdee5;
    .title {
        padding: 0 20px;
        font-size: 16px;
        color: #313238;
        line-height: 28px;
        .icon-close {
            cursor: pointer;
            color: #7588A3;
            vertical-align: middle;
            font-size: 28px !important;
            &:hover {
                color: #475468;
            }
        }
    }
    .content {
        width: 100%;
        padding: 0 12px;
        height: calc(100vh - 114px);
        border-top: 1px solid #dcdee5;
        display: flex;
        align-items: center;
        position: relative;
        & > div {
            padding: 20px 0;
            width: 100%;
            /deep/ {
                tr td,
                tr th,
                .hide-text {
                    pointer-events: none;
                }
            }
        }
        /deep/ .chart-legend {
            display: none;
        }
    }
}
</style>
<style lang="scss">
.param-wrap {
    .param-title {
        margin: 26px 0 10px;
        padding-left: 8px;
        position: relative;
        .bk-form-checkbox {
            margin: 12px 0 4px 0;
        }
        .title-wrap {
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: $cw-color-text-1;
            .line {
                flex: 1;
                border-bottom: 1px solid #aeb0bb;
                height: 1px;
                margin: 0 12px;
            }
            .icon-plus {
                font-weight: bold;
                font-size: 24px;
                cursor: pointer;
            }
        }
    }
    .param-content {
        width: 100%;
        .param-item {
            position: relative;
            padding: 32px 62px 16px 12px;
            margin-bottom: 12px;
            border-radius: 4px;
            border: 1px solid rgb(220, 218, 218);
            background-color: $cw-color-bg-1;
            &.group-item {
                padding-top: 16px;
            }
            .bk-select {
                background: #fff;
            }
            .bk-form-item + .bk-form-item {
                margin-top: 10px;
            }
            .bk-form-radio {
                margin-right: 20px;
            }
            .duration-wrap {
                display: flex;
                .bk-select {
                    width: 100px;
                    border-left-width: 0;
                }
            }
            .operate {
                position: absolute;
                right: 5px;
                top: 0;
                font-size: 16px;
                i {
                    cursor: pointer;
                    &.weops-drag-drop {
                        cursor: move;
                    }
                }
            }
        }
        &.trend-content {
            .param-item {
                position: relative;
                padding: 26px 62px 16px 32px;
                .bk-select {
                    margin-top: 6px;
                }
                .desc {
                    color: #a6a6a6;
                    line-height: 28px;
                    font-size: 12px;
                }
            }
        }
    }
}
</style>
