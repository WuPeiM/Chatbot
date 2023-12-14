<template>
    <bk-sideslider transfer :is-show.sync="isShow" :quick-close="true" :width="600" @hidden="handleIframeFocus">
        <div slot="header">
            <span>主机信息</span>
            <span style="font-size: 13px;color: #c4c6cc;">
                -
                {{ currentNode.name }}
            </span>
        </div>
        <div class="p20 content-box" slot="content">
            <show-list
                :read-only="true"
                :instance-data="instanceData"
                :instance-fields="instanceFields"
                :page-loading="pageLoading">
            </show-list>
        </div>
    </bk-sideslider>
</template>

<script lang="ts">
    import { Vue, Component, Emit, Prop } from 'vue-property-decorator'
    import ShowList from './detailInfo.vue'
    @Component({
        name: 'detail-info',
        components: {
            ShowList
        }
    })
    export default class detailInfo extends Vue {
        @Prop({ type: Object, default: () => {} }) currentNode: any
        isShow: boolean = false
        instanceFields: Array<any> = []
        instanceData: any = {}
        pageLoading: boolean = false
        show() {
            this.isShow = true
            this.instanceFields = []
            this.instanceData = {}
            this.getOriginData()
        }
        get isHost() {
           return !this.currentNode.bkObjId || this.currentNode.bkObjId === 'host'
        }
        getOriginData() {
            this.pageLoading = true
            if (this.currentNode.row) {
                this.instanceData = this.currentNode.row
                this.getInstanceFields().finally(() => { this.pageLoading = false })
            } else {
                const detailRes = this[this.isHost ? 'getHostDetail' : 'getOtherDetail']()
                Promise.all([detailRes, this.getInstanceFields()]).finally(() => { this.pageLoading = false })
            }
        }
        getOtherDetail() {
            const params = {
                bk_obj_id: this.currentNode.bkObjId,
                bk_inst_id: this.currentNode.bkInstId
            }
            return this.$api.Resource.getOtherResDetail(params).then(res => {
                if (res.result) {
                    this.instanceData = res.data
                }
            })
        }
        getHostDetail() {
            return this.$api.Resource.getHostDetail({
                ip: this.currentNode.name,
                bk_biz_id: this.currentNode.bkBizId,
                bk_cloud_id: this.currentNode.bkCloudId
            }).then(res => {
                const { data, result } = res
                if (!result) return false
                this.instanceData = data
            })
        }
        getInstanceFields() {
            const bkObjId = this.currentNode.bkObjId || 'host'
            const params = {
                bk_obj_id: bkObjId
            }
            const url = bkObjId === 'host' ? 'getHostCustomFields' : 'getOtherResourceFields'
            return this.$api.Resource[url](params).then(res => {
                if (res.result) {
                    this.handleAllFields(res.data['all_field'])
                }
            })
        }
        handleAllFields(allFields) {
            allFields.forEach(item => {
                if (['list', 'bool'].includes(item['bk_property_type'])) {
                    if (item.option.length > 0) {
                        const list = item.option.map(tex => ({ id: tex, name: tex }))
                        item.option = list
                    }
                    if (typeof item.option === 'boolean') {
                        item.option = [
                            { id: 'true', name: '是' },
                            { id: 'false', name: '否' }
                        ]
                    }
                }
                item.checked = false
                item.batchValue = ''
                item.editStatus = false
                item.editValue = ''
                item.editLoading = false
                this.buildFieldData(item, this.instanceFields)
            })
        }
        // 将字段数据进行分组
        buildFieldData(item, data) {
            const index = data.findIndex(tex => tex.title === item['bk_property_group_name'])
            if (index === -1) {
                data.push(
                    {
                        title: item['bk_property_group_name'],
                        children: [item],
                        collapseStatus: true,
                        id: this.$random(3)
                    }
                )
            } else {
                data[index].children.push(item)
            }
        }

        @Emit('handleIframeFocus')
        handleIframeFocus() {
            return ''
        }
    }
</script>

<style scoped lang="scss">
    .content-box {
        height: calc(100vh - 60px);
        padding: 20px;
    }
</style>
