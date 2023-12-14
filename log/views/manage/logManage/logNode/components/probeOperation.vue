<template>
    <bk-sideslider
        :width="650"
        :quick-close="true"
        :is-show.sync="visible"
        ext-cls="common-dialog-wrapper"
        :before-close="handleCancel">
        <div slot="header">
            {{ title || '--' }}
        </div>
        <div class="probe-operation-wrapper" slot="content">
            <bk-form
                :label-width="120"
                :model="formData"
                :rules="rules"
                ref="probeConfig">
                <bk-form-item
                    label="探针类型"
                    :required="true"
                    property="probe_type">
                    <bk-select
                        v-model="formData.probe_type"
                        searchable
                        multiple
                        @change="changeProbeType">
                        <bk-option
                            v-for="option in enableProbe"
                            :key="option.name"
                            :id="option.name"
                            :name="option.name">
                        </bk-option>
                    </bk-select>
                </bk-form-item>
                <template v-if="['start', 'config'].includes(actionType)">
                    <bk-form-item
                        :label="`${ probe }配置`"
                        :required="true"
                        :property="probe"
                        :key="probe"
                        v-for="probe in formData.probe_type">
                        <bk-select
                            v-model="formData[probe]"
                            searchable>
                            <bk-option
                                v-for="option in configOptionsMap[probe]"
                                :key="option.id"
                                :id="option.id"
                                :name="option.name">
                            </bk-option>
                        </bk-select>
                    </bk-form-item>
                </template>
            </bk-form>
        </div>
        <div slot="footer">
            <bk-button
                class="mr10"
                theme="primary"
                :loading="loading"
                :disabled="loading"
                @click="handleConfirm">
                确定
            </bk-button>
            <bk-button
                theme="default"
                :disabled="loading"
                @click="handleCancel">
                取消
            </bk-button>
        </div>
    </bk-sideslider>
</template>

<script lang="ts">
    import {Vue, Component, Prop} from 'vue-property-decorator'
    import { PROBE_ACTIONS_MAPS } from './../field'

    @Component({
        name: 'probe-operation'
    })
    export default class ProbeOperation extends Vue {
        @Prop({
            type: Array,
            default: () => ([])
        })
        probeList: any
        @Prop({
            type: Array,
            default: () => ([])
        })
        selectedList: any
        visible: boolean = false
        formData: any = {
            probe_type: []
        }
        originData = {}
        title: string = ''
        actionType: string = ''
        loading: boolean = false
        rules = {
            probe_type: [
                {
                    required: true,
                    message: '请选择',
                    trigger: 'blur'
                }
            ]
        }
        enableProbe = []
        configOptionsMap = {}

        show(list, type) {
            this.visible = true
            this.title = PROBE_ACTIONS_MAPS[type]
            this.actionType = type
            this.enableProbe = JSON.parse(JSON.stringify(list))
        }

        async handleConfirm() {
            this.$refs.probeConfig.validate().then(validator => {
                this.handleApplyByType()
            }, validator => {
                console.warn(`${validator.field}：${validator.content}`)
            })
        }
        handleApplyByType() {
            // 重启探针时,判断配置是否修改过,修改过的探针调用应用接口即可.应用后会启动
            // 若没有修改过配置,调用启动探针
            if (this.actionType === 'start') {
                const isUpdateStatus = this.formData.probe_type.every(probe => this.formData[probe] === this.originData[probe])
                isUpdateStatus ? this.fetchProbeAction() : this.handleApply(true)
            } else if (this.actionType === 'config') {
                this.handleApply(true)
            } else {
                this.fetchProbeAction()
            }
        }
        async fetchProbeAction() {
            this.loading = true
            try {
                const res = await this.$api.logNode.probeAction({
                    action: this.actionType,
                    probes: this.enableProbe.filter(r => this.formData.probe_type?.includes(r.name)).map(probe => ({ id: probe.id, probe_type: probe.name })),
                    hosts: this.selectedList.map(row => ({
                        bk_host_id: row.bk_host_id,
                        node_id: row.node_id,
                        inner_ip: row.inner_ip,
                        bk_cloud_id: row.bk_cloud_id,
                        os_type: row.os_type,
                        id: row.id
                    }))
                })
                const { result, message } = res
                if (!result) {
                    this.$error(message)
                    return false
                }
                this.$emit('success')
                this.$success(`${this.title}中`)
                this.handleCancel()
            } finally {
                this.loading = false
            }
        }
        changeProbeType(_probe) {
            if (!['start', 'config'].includes(this.actionType)) {
                return false
            }
            const typeMap = {
                LINUX: 'linux',
                WINDOWS: 'windows'
            }
            _probe.forEach(async row => {
                const res = await this.$api.logNode.getConfigurations({
                    page: 1,
                    page_size: 10000,
                    query: {
                        collector_name: row,
                        os_type: typeMap[this.selectedList[0]?.os_type]
                    }
                })
                if (res.result) {
                    this.$set(this.configOptionsMap, row, res.data?.data)
                    // 判断所选日志里该探针下的列表配置信息,如果都相同则设置默认值,否则为空
                    const probeConfig = this.selectedList.map(item => {
                        const cur = item.probes.find(r => r.probe_type === row)
                        return cur?.probe_config
                    })
                    const areAllEqual = probeConfig.every((element, index, array) => {
                        return element === array[0]
                    })
                    const id = areAllEqual ? this.configOptionsMap[row].find(r => r.name === probeConfig[0])?.id : ''
                    // originData 用于存初始时的配置信息
                    this.originData[row] = id
                    this.$set(this.formData, row, id)
                    this.rules[row] = [
                        {
                            required: true,
                            message: '请选择',
                            trigger: 'blur'
                        }
                    ]
                }
            })
        }
        async handleApply(status) {
            this.loading = status
            try {
                const resTotal = []
                for (const item of this.formData.probe_type) {
                    const res = await this.$api.logNode.associativeConfiguration({
                        collector_id: this.configOptionsMap[item]?.find(r => r.id === this.formData[item])?.collector_id,
                        id: this.formData[item],
                        node_names: this.selectedList.map(row => row.node_name)
                    })
                    resTotal.push(res)
                }

                const results = await Promise.all(resTotal)
                if (results.every(r => r.result)) {
                    this.$success('操作成功')
                    this.handleCancel()
                    this.$emit('success')
                } else {
                    this.$error('操作失败')
                }
            } catch (error) {
                console.error('请求错误:', error)
            } finally {
                this.loading = false
            }
        }
        getProbeName(id) {
            return this.enableProbe.find(item => item.id === id)?.name
        }
        handleCancel() {
            this.visible = false
            Object.assign(this.$data, this.$options.data.call(this))
        }
    }
</script>

<style scoped lang="scss">
.probe-operation-wrapper {
    padding: 20px;
    height: calc(100vh - 110px);
    overflow-y: auto;
}
</style>
