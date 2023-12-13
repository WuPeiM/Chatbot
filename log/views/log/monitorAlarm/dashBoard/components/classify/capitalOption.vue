<template>
    <div class="mt20">
        <bk-form-item
            label="对象类型"
            :required="true"
            :property="'bk_obj_id'"
            :error-display-type="'normal'">
            <bk-select
                searchable
                v-model="formData.bk_obj_id"
                style="width: 100%;">
                <bk-option
                    v-for="option in assetObjList"
                    :key="option.bk_obj_id"
                    :id="option.bk_obj_id"
                    :name="option.bk_obj_name">
                </bk-option>
            </bk-select>
        </bk-form-item>
        <bk-form-item
            required
            label="属性字段"
            property="fields_value"
            :error-display-type="'normal'">
            <div style="display: flex;">
                <bk-select
                    multiple
                    display-tag
                    searchable
                    :loading="loading"
                    :clearable="false"
                    v-model="fieldsVal"
                    style="flex: 1; width: 100%;"
                    @selected="handleChangeField">
                    <bk-option
                        v-for="option in attrFieldList"
                        :key="option.key"
                        :id="option.key"
                        :name="option.label">
                    </bk-option>
                </bk-select>
            </div>
        </bk-form-item>
    </div>
</template>

<script lang="ts">

    import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
    import {InstInfo, ViewForm} from '../../types/index'

    const HOST_FIELDS = 'getHostCustomFields'
    const OTHER_FIELDS = 'getOtherResourceFields'
    const AGENT_OPTION = [
        { id: 0, name: '正常' },
        { id: 1, name: '异常' },
        { id: 2, name: '未安装' },
        { id: 3, name: '未知' }
    ]
    const BOOL_OPTION = [
        { id: true, name: '是' },
        { id: false, name: '否' }
    ]
    const INST_JUMP_DATA = [
        'db_inst',
        'middleware_inst',
        'ad_server',
        'exchange_server'
    ]
    @Component({ components: {} })
    export default class TableOption extends Vue {
        @Prop({ type: Object }) formData: ViewForm
        @Prop({ type: Object }) rules: any
        loading: boolean = false
        fieldsVal: Array<string | number> = []
        attrFieldList: Array<any> = []
        assetObjList: Array<InstInfo> = []

        created() {
            this.initCompFormItem()
            this.initCompFormRule()
            this.getAssetObjList()
        }

        mounted() {
            this.fieldsVal = this.formData.fields_value.map(el => el.key)
        }

        get isHost() {
            return this.formData.bk_obj_id === 'host'
        }

        @Watch('formData.bk_obj_id', { deep: true, immediate: true })
        onTypeItemChanged(val) {
            this.attrFieldList = []
            this.fieldsVal = []
            if (val || val === 0) {
                this.getAppCustomFields()
            }
        }
        initCompFormItem() {
            const INIT_FORM = {
                bk_obj_id: '',
                fields_value: []
            }
            Object.entries(INIT_FORM).forEach(({ 0: key, 1: value }) => {
                if (!this.formData.hasOwnProperty(key)) {
                    this.$set(this.formData, key, value)
                }
            })
        }
        initCompFormRule() {
            const that = this
            const formOptions: Array<{
                key: string,
                tip: string
            }> = [
                { key: 'bk_obj_id', tip: '请选择对象类型' },
                { key: 'fields_value', tip: '请选择属性字段' }
            ]
            this.rules['bk_obj_id'] = [
                {
                    required: true,
                    message: formOptions[0].tip,
                    trigger: 'blur'
                }
            ]
                 this.rules['fields_value'] = [
                {
                    required: true,
                    message: formOptions[1].tip,
                    trigger: 'blur',
                    validator: function() {
                        return that.fieldsVal?.length
                    }
                }
            ]
        }
        async getAssetObjList() {
            const res = await this.$api.Resource.getResourceLabel()
            if (res.result) {
                this.assetObjList = res.data || []
            }
        }
        // 获取自定义表头字段, 暂时禁止排序、筛选：filterable、sortable
        getAppCustomFields() {
            const params: any = {}
            if (!this.isHost) {
                params.bk_obj_id = this.formData.bk_obj_id
            }
            this.loading = true
            const url = this.isHost ? HOST_FIELDS : OTHER_FIELDS
            this.$api.Resource[url](params).then(res => {
                if (!res.result) {
                    return this.$error(res.message)
                }
                const { all_field: allField = [], other_field: otherField = [] } = res.data
                this.attrFieldList = []
                this.handleAllFields(allField)
                this.handleOthersFields(otherField)
            }).finally(() => {
                this.loading = false
            })
        }
        handleOthersFields(otherField) {
            otherField.forEach(item => {
                const obj: any = {
                    label: item['bk_property_name'],
                    key: item['bk_property_id'],
                    align: 'left',
                    minWidth: '150px',
                    showOnly: true
                }
                if (item['bk_property_id'] === 'agent_status') {
                    obj.options = AGENT_OPTION
                    obj.scopedSlots = item['bk_property_id']
                    obj.filterable = true
                    obj.filterMultiple = false
                    obj.filterRemote = true
                    obj.filters = obj.options.map(tex => ({ text: tex.name, value: tex.id }))
                }
                if (item['bk_property_id'] === 'belong_app') {
                    obj.filterable = true
                    obj.filterMultiple = false
                    obj.filterRemote = true
                    obj.options = []
                    obj.filters = []
                    this.$api.Resource.getAppListMap().then(appRes => {
                        if (appRes.result) {
                            obj.options = appRes.data.map(tex => {
                                return {
                                    id: tex.bk_biz_id,
                                    name: tex.bk_biz_name
                                }
                            })
                            obj.filters = obj.options.map(tex => {
                                return {
                                    text: tex.name,
                                    value: tex.id
                                }
                            })
                            if (!this.isHost) {
                                obj.filters = obj.filters.filter(tex => tex.text !== '--')
                            }
                        }
                    })
                }
                if (INST_JUMP_DATA.find(tex => tex === item['bk_property_id'])) {
                    obj.noNeedTip = 'yes'
                    obj.scopedSlots = item['bk_property_id']
                }
                this.attrFieldList.push(obj)
            })
        }
        // 处理表头全部字段数据
        handleAllFields(allFields) {
            allFields.forEach((item, index) => {
                if (['list', 'bool'].includes(item['bk_property_type'])) {
                    if (item.bk_property_type === 'list') {
                        item.option = item.option.map(tex => ({ id: tex, name: tex }))
                    }
                    if (item.bk_property_type === 'bool') {
                        item.option = BOOL_OPTION
                    }
                }
                item.checked = false
                item.batchValue = ''
                item.editStatus = false
                item.editValue = ''
                item.editLoading = false
                item.editIconShow = false
                this.handleColumnData(item, index)
            })
        }
        // 处理列数据
        handleColumnData(item, index) {
            const column: any = {
                label: item['bk_property_name'],
                key: item['bk_property_id'],
                type: item['bk_property_type'],
                align: 'left',
                minWidth: '150px',
                option: item['option'],
                disabled: item['bk_property_id'] === 'bk_host_innerip'
            }
            if (index === 0) column.fixed = 'left'
            if (item['bk_property_type'] === 'enum') {
                column.filterable = true
                column.filterRemote = true
                if (column.option?.length) {
                    column.filters = column.option.map(tex => ({ text: tex.name, value: tex.id }))
                    column.scopedSlots = item['bk_property_id']
                    column.filterMultiple = false
                }
            } else {
                if (['time', 'bool'].includes(item['bk_property_type'])) {
                    column.scopedSlots = item['bk_property_id']
                }
                if (item['bk_property_id'] !== 'belong_app') {
                    column.sortable = true
                }
            }
            this.attrFieldList.push(column)
        }
        handleChangeField(fields: Array<string | Number>) {
            const list = this.attrFieldList.filter(el => fields.includes(el.key))
            this.formData.fields_value = list
        }
    }
</script>
