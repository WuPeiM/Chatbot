<template>
    <div class="mt20">
        <bk-form-item
            label="对象类型"
            :required="true"
            :property="'bk_obj_id'"
            :error-display-type="'normal'">
            <bk-select
                searchable
                :loading="loading"
                v-model="formData.bk_obj_id"
                style="width: 100%;"
                @change="getObjMetric">
                <bk-option
                    v-for="option in monitorObj"
                    :key="option.bk_obj_id"
                    :id="option.bk_obj_id"
                    :name="option.bk_obj_name">
                </bk-option>
            </bk-select>
        </bk-form-item>
        <template v-if="formData.showAsset">
            <bk-form-item
                v-if="isShowAsset"
                label="应用"
                :required="true"
                :property="'applicationId'"
                :error-display-type="'normal'">
                <bk-select
                    searchable
                    :loading="appLoading"
                    v-model="formData.applicationId"
                    style="width: 100%;"
                    @change="changeApp">
                    <bk-option
                        v-for="option in appList"
                        :key="option.bk_biz_id"
                        :id="option.bk_biz_id"
                        :name="option.bk_biz_name">
                    </bk-option>
                </bk-select>
            </bk-form-item>
            <bk-form-item
                label="资产展示"
                :required="true"
                :property="'assetId'"
                :error-display-type="'normal'">
                <bk-select
                    searchable
                    :loading="assetLoading"
                    v-model="formData.assetId"
                    style="width: 100%;">
                    <bk-option
                        v-for="option in assetList"
                        :key="option.id"
                        :id="option.id"
                        :name="option.bk_inst_name">
                    </bk-option>
                </bk-select>
            </bk-form-item>
        </template>
        <bk-form-item
            label="监控模板"
            :required="true"
            :property="'template'"
            :error-display-type="'normal'"
        >
            <div class="monitor-template">
                <bk-select
                    searchable
                    placeholder="请选择分组"
                    :loading="netWorkLoading"
                    v-model="formData.brand"
                    @change="changeBrand">
                    <bk-option
                        v-for="option in netClassifycationList"
                        :key="option.id"
                        :id="option.id"
                        :name="option.name">
                    </bk-option>
                </bk-select>
                <bk-select
                    searchable
                    placeholder="请选择模板"
                    :loading="netWorkLoading"
                    v-model="formData.template"
                    @change="changeTemplate">
                    <bk-option
                        v-for="option in templateList"
                        :key="option.id"
                        :id="option.id"
                        :name="option.name">
                    </bk-option>
                </bk-select>
            </div>
        </bk-form-item>
        <bk-form-item
            label="展示指标"
            :required="true"
            :property="'metric_id'"
            :error-display-type="'normal'">
            <bk-select
                searchable
                v-model="formData.metric_id"
                style="width: 100%;"
                :loading="metricLoading"
                @change="changeMetricData">
                <bk-option
                    v-for="option in metricData"
                    :key="option.id"
                    :id="option.id"
                    :name="option.name">
                </bk-option>
            </bk-select>
        </bk-form-item>
        <bk-form-item
            v-if="['dashboard', 'single'].includes(formData.view_type)"
            label="多维度示值"
            :required="true"
            :property="'aggregate_type'"
            :error-display-type="'normal'">
            <bk-select
                searchable
                v-model="formData.aggregate_type"
                style="width: 100%;">
                <bk-option
                    v-for="option in avgData"
                    :key="option.id"
                    :id="option.id"
                    :name="option.name">
                </bk-option>
            </bk-select>
        </bk-form-item>
        <!-- 折线图的配置 -->
        <line-option
            v-if="formData.view_type === 'line'"
            ref="line"
            :unit="unit"
            :form-data="formData" />
        <!-- 仪表盘仅有的配置 最大/小值、阈值配色 -->
        <dash-board-option
            v-if="formData.view_type === 'dashboard'"
            ref="dashBoard"
            :unit="unit"
            :is-confirm="isConfirm"
            :rules="rules"
            :form-data="formData" />
        <!--单值仅有的配置 条件过滤、阈值配色 -->
        <single-option
            v-if="formData.view_type === 'single'"
            ref="single"
            :unit="unit"
            :is-confirm="isConfirm"
            :rules="rules"
            :form-data="formData" />
    </div>
</template>

<script lang="ts">
    import LineOption from './lineOption.vue'
    import DashBoardOption from './dashboardOption.vue'
    import SingleOption from './singleOption.vue'
    import { Vue, Component, Prop } from 'vue-property-decorator'
    import { InstInfo, MetricInfo, ViewForm } from '../../types'

    // 云平台对象
    const CLOUND_OBJ = ['vmware_esxi', 'vmware_ds', 'vmware_vm', 'qcloud_cvm', 'aliyun_ecs', 'mo_server', 'sangforhci_vm', 'huaweicloud_ecs']
    // k8s集群展示对象
    const K8S_INCLUDE_OBJ = ['k8s_pod-k8s', 'k8s_pod-biz', 'bk_node']
    // 不需要选择集群和模块的对象
    const SET_AND_MODULE_EXCLUDE_OBJ = ['uptimecheck'].concat(CLOUND_OBJ)

    @Component({
        name: 'monitorOption',
        components: {
            LineOption,
            DashBoardOption,
            SingleOption
        }
    })
    export default class MonitorOption extends Vue {
        @Prop({ type: Object }) formData: ViewForm
        @Prop({ type: Object }) rules: any
        @Prop({ type: Boolean }) isConfirm: boolean
        loading: boolean = false
        metricLoading: boolean = false
        metricData: Array<MetricInfo> = []
        monitorObj: Array<InstInfo> = []
        unit: string = ''
        netWorkLoading: boolean = false
        assetLoading: boolean = false
        appLoading: boolean = false
        netClassifycationList = []
        appList = []
        assetList = []
        avgData: Array<{
            id: string,
            name: string
        }> = [
            {
                id: 'sum',
                name: '累加值'
            },
            {
                id: 'max',
                name: '最大值'
            },
            {
                id: 'min',
                name: '最小值'
            },
            {
                id: 'mean',
                name: '平均值'
            },
            {
                id: 'count',
                name: '维度数量'
            }
        ]
        k8sIncludeObj = K8S_INCLUDE_OBJ
        moduleExcludeObj = SET_AND_MODULE_EXCLUDE_OBJ

        get templateList() {
            if (this.formData.brand) {
                return this.netClassifycationList.find(item => item.id === this.formData.brand)?.children
            }
            return []
        }

        get isShowAsset() {
            return ['host', 'uptimecheck'].includes(this.formData.bk_obj_id)
        }

        created() {
            this.initCompFormItem()
            this.initCompFormRule()
            this.getMonitorObj()
            if (this.formData.showAsset) {
                this.getBizTopo()
            }
        }

        changeApp(value: string, flag: boolean) {
            if (flag && this.isShowAsset) {
                this.formData.assetId = ''
            }
            this.handleAsset(this.formData.bk_obj_id)
        }

        async updateCompView(row: any) {
            const config = row?.config || {}
            await this.getObjMetric(config.bk_obj_id, false)
            this.changeApp(config.applicationId, false)
            this.changeTemplate(this.formData.template)
            const unitList = this.metricData.find(item => item.id === this.formData.metric_id)?.unit_suffix_list || []
            this.unit = unitList[0]?.name
        }

        initCompFormItem() {
            const INIT_FORM = {
                bk_obj_id: '',
                metric_id: '',
                metric: '',
                table_id: '',
                aggregate_type: '',
                brand: '',
                template: '',
                assetId: '',
                applicationId: ''
            }
            Object.entries(INIT_FORM).forEach(({ 0: key, 1: value }) => {
                if (!this.formData.hasOwnProperty(key)) {
                    this.$set(this.formData, key, value)
                }
            })
        }

        initCompFormRule() {
            const formOptions: Array<{
                key: string,
                tip: string
            }> = [{
                key: 'bk_obj_id',
                tip: '请选择对象类型'
            }, {
                key: 'applicationId',
                tip: '请选择应用'
            }, {
                key: 'assetId',
                tip: '请选择资产展示'
            }, {
                key: 'metric_id',
                tip: '请选择展示指标'
            }, {
                key: 'template',
                tip: '请选择监控模板'
            }, {
                key: 'aggregate_type',
                tip: '请选择多维度示值'
            }]
            formOptions.forEach(option => {
                this.rules[option.key] = [
                    {
                        required: true,
                        message: option.tip,
                        trigger: 'blur'
                    }
                ]
            })
        }

        async getBizTopo() {
            this.appLoading = true
            try {
                const res = await this.$api.dashBoard.getBizTopo()
                const { result, data } = res
                if (result) {
                    this.appList = data
                }
            } finally {
                this.appLoading = false
            }
        }

        async getMonitorObj() {
            this.loading = true
            try {
                const res = await this.$api.dashBoard.getAllObj()
                if (res.result) {
                    this.monitorObj = res.data
                    this.handleAsset(this.formData.bk_obj_id)
                }
            } finally {
                this.loading = false
            }
        }

        getObjMetric(value: string, flag: boolean) {
            this.metricData = []
            if (flag) {
                this.formData.metric_id = ''
                this.formData.threshold_value = ''
                this.formData.brand = ''
                this.formData.template = ''
                this.formData.assetId = ''
                this.formData.applicationId = ''
                this.assetList = []
            }
            this.getNetworkClassification()
            this.handleAsset(value)
        }

        handleAsset(value) {
            if (this.formData.showAsset && value) {
                const current = this.monitorObj.find(obj => obj.bk_obj_id === value)
                if (this.isShowAsset && !this.formData.applicationId) {
                    return
                }
                if (this.shouldFetchInstList(current)) {
                    this.fetchInstList(current)
                }
                if (current?.is_cmdb_obj) {
                     this.fetchAssetInstList(current)
                }
            }
        }

        async getNetworkClassification() {
            this.netWorkLoading = true
            try {
                const res = await this.$api.monitorAlarm.getNetworkClassificationList({
                    bk_obj_id: this.formData.bk_obj_id
                })
                if (res.result) {
                    this.netClassifycationList = res.data
                }
            } finally {
                this.netWorkLoading = false
            }
        }
        changeBrand() {
            this.formData.template = ''
        }

        changeTemplate(id) {
            if (!id) {
                this.metricData = []
                this.formData.metric_id = ''
                return false
            }
            const current = this.monitorObj.find(item => item.bk_obj_id === this.formData.bk_obj_id)
            this.getObjMetricList(current?.id, id)
        }

        async getObjMetricList(id, templateId) {
            this.metricLoading = true
            try {
                const res = await this.$api.dashBoard.getObjMetricList({
                    plugin_template_id: templateId,
                    bk_obj_id: this.formData.bk_obj_id,
                    id
                })
                if (res.result) {
                    this.metricData = res.data
                    this.unit = ''
                }
            } finally {
                this.metricLoading = false
            }
        }

        validSubmit() {
            const dashBoard: any = this.$refs.dashBoard
            const single: any = this.$refs.single
            const { view_type: viewType } = this.formData
            if (viewType === 'dashboard' && dashBoard?.handleValidate()) {
                return false
            }
            if (viewType === 'single' && single?.handleValidate()) {
                return false
            }
            return true
        }

        changeMetricData(value: number | string) {
            const current = this.metricData.find(item => item.id === value)
            this.formData.metric = current?.metric
            this.formData.table_id = current?.table_id
            const unitList = current?.unit_suffix_list || []
            this.unit = unitList[0]?.name
            this.formData.threshold_value = ''
        }

        isDevice(item) {
            return !!(item?.is_device || item?.is_cmdb_obj)
        }

        fetchAssetInstList(row) {
            this.assetLoading = true
            const { bk_obj_id: objId = '' } = row
            const params = this.getParams(row, objId)
            const url = objId === 'host' ? 'getHostList' : 'getOtherResourceList'
            this.$api.Resource[url](params).then(res => {
                if (!res.result) {
                    return this.$error(res.message)
                }
                res.data.info.forEach(el => {
                    if (el.id) return
                    el.id = JSON.stringify({ bk_inst_id: el.bk_inst_id, bk_inst_name: el.bk_inst_name })
                })
                this.assetList = res.data.info
            }).finally(() => {
                this.assetLoading = false
            })
        }

        async fetchInstList(row) {
            this.assetLoading = true
            const { bk_obj_id: bkObjId } = row
            let params = {
                bk_set_ids: row.bk_set_ids || [0], // 集群ID， ESXI和数据存储、服务拨测传0或者不传都可以
                bk_module_ids: row.bk_module_ids || [0] // 模块ID， ESXI和数据存储、服务拨测传0或者不传都可以
            }
            if (this.isShowAsset) {
                params.bk_biz_id = this.formData.applicationId || 2
            } else {
                params.is_cmdb_obj = 1
            }
            // 判断若为k8s类型对象
            if (this.k8sIncludeObj.includes(bkObjId)) {
                params = this.handleK8sParams(row)
            }
            const current = this.monitorObj.find(obj => obj.bk_obj_id === bkObjId)
            try {
                const res = await this.$api.dashBoard.getInstListByCondition({
                    bk_obj_id: bkObjId, // 对象类型ID
                    is_device: current?.is_device || 0,
                    ...params
                })
                if (res.result) {
                    this.assetList = res.data
                }
            } finally {
                this.assetLoading = false
            }
        }

        handleK8sParams(row) {
            // 处理当对象为pod(k8s)，k8s工作负载为所有出，处理数据【-1, 加上所有负载列表的ids】
            let workloadId = row.workload_id
            if (row.bk_obj_id === 'k8s_pod-k8s' && workloadId.includes(-1)) {
                workloadId = workloadId.concat((row?.k8sMap?.workload.map(i => i.bk_inst_id) || []))
            }
            const K8S_PARAMS = {
                'k8s_pod-k8s': {
                    cluster_id: row.cluster_id,
                    namespace_id: row.namespace_id,
                    workload_id: workloadId
                },
                'k8s_pod-biz': {
                    bk_biz_id: row.bk_biz_id,
                    bk_set_ids: row.bk_set_ids,
                    workload_id: [-1].concat(row.workload_id),
                    namespace_id: row.namespace_id
                },
                'bk_node': {
                    cluster_id: row.cluster_id
                }
            }
            return K8S_PARAMS[row.bk_obj_id]
        }

        getParams(row, bkObjId) {
            let params = {}
            if (bkObjId === 'host') {
                params = {
                    bk_biz_id: this.formData.applicationId,
                    biz_type: 'biz',
                    bk_obj_id: bkObjId,
                    bk_inst_id: '',
                    page_size: -1
                }
            } else {
                params = {
                    bk_obj_id: bkObjId,
                    body: {
                        bk_classification_id: '',
                        page_size: -1
                    }
                }
            }
            return params
        }

        shouldFetchInstList(current) {
            const relatedKey = {
                'k8s_pod-k8s': 'workload_id',
                'k8s_pod-biz': 'workload_id',
                'bk_node': 'cluster_id',
                'uptimecheck': 'bk_biz_id'
            }
            if (!current) return false
            const key = relatedKey[current.bk_obj_id]
            if (current.is_cmdb_obj) {
                return false
            } else if (CLOUND_OBJ.includes(current.bk_obj_id) || current.is_device) {
                if (key) {
                    return Array.isArray(current[key]) ? current[key].length > 0 : Boolean(current[key])
                } else {
                    return true
                }
            } else {
                if (key) {
                    if (key === 'bk_biz_id') return true
                    return Array.isArray(current[key]) ? current[key].length > 0 : Boolean(current[key])
                } else {
                    return !this.moduleExcludeObj.includes(current.bk_obj_id) && !this.isDevice(current)
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
.unit-span {
    display: inline-block;
    padding-left: 5px;
}
.monitor-template {
    display: flex;
    .bk-select {
        width: 50%;
    }
}
</style>
