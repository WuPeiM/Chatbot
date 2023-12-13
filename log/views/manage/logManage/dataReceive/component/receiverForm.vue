<template>
    <bk-sideslider
        :is-show.sync="isShow"
        :quick-close="false"
        :title="isAdd ? `启动新的 ${receiver.name} 接收器` : `编辑输入 ${receiverDetail.title}`"
        @hidden="hiddenSideslider"
        :width="700">
        <div slot="content" class="content-box">
            <div class="main-box" id="mainBox">
                <bk-checkbox
                    :true-value="true"
                    :false-value="false"
                    v-model="formData.global">
                    全局启用
                </bk-checkbox>
                <div class="tip-text mt10 mb10">是否在全节点启用</div>
                <bk-form
                    :model="formData"
                    :rules="rules"
                    form-type="vertical"
                    ref="validateForm"
                    :label-width="500">
                    <bk-form-item
                        v-if="!formData.global"
                        label="节点"
                        :required="true"
                        property="node"
                        :error-display-type="'normal'">
                        <bk-select
                            v-model="formData.node"
                            :clearable="false"
                            searchable>
                            <bk-option
                                v-for="option in nodeList"
                                :key="option.node_id"
                                :id="option.node_id"
                                :name="option.name">
                            </bk-option>
                        </bk-select>
                        <div class="tip-text">指定启动的节点</div>
                    </bk-form-item>
                    <bk-form-item
                        label="标题"
                        :required="true"
                        property="title"
                        :error-display-type="'normal'">
                        <bk-input
                            v-model="formData.title"
                            clearable
                            show-clear-only-hover
                            placeholder="请输入标题">
                        </bk-input>
                        <div class="tip-text">为新的接收器起个标题</div>
                    </bk-form-item>
                    <bk-form-item
                        v-for="(value, key) in customFormList"
                        :rules="rules['configuration.' + key]"
                        :property="`configuration.${key}`"
                        :key="key"
                        :label="value.type === 'boolean' ? '' : value.human_name"
                        :required="!value.is_optional"
                        :error-display-type="'normal'">
                        <component
                            v-model="formData.configuration[key]"
                            :custom-data="value"
                            :is="value.componentName">
                        </component>
                        <div class="tip-text hide-text" v-bk-overflow-tips>{{value.description}}</div>
                    </bk-form-item>
                </bk-form>
            </div>
            <div class="footer-box">
                <bk-button :theme="'default'" type="submit" :title="'取消'" @click="cancel">
                    取消
                </bk-button>
                <bk-button :loading="loading" :theme="'primary'" :title="'保存'" class="mr10" @click="confirm">
                    保存
                </bk-button>
            </div>
        </div>
    </bk-sideslider>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from 'vue-property-decorator'
    // 自动引入receiver下的组件
    // @ts-ignore
    const modulesFiles = require.context('../receiver', true, /\.vue$/)
    const receiverComponentTypes = modulesFiles.keys().map(key => key.slice(2, -4))
    const modules = modulesFiles.keys().reduce((modules, modulePath) => {
        const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
        const value = modulesFiles(modulePath)
        modules[moduleName] = value.default
        return modules
    }, {})
    @Component({
        name: 'receiver-form',
        components: {
            ...modules
        }
    })
    export default class ReceiverForm extends Vue {
        @Prop({
            type: Array,
            default: () => []
        })
        nodeList: any[]
        @Prop({
            type: Array,
            default: () => []
        })
        receiverList: any[]
        isShow: boolean = false
        receiver: any = {}
        formData: any = {
            configuration: {},
            global: false,
            node: '',
            title: '',
            type: ''
        }
        rules: any = {
            node: [
                {
                    required: true,
                    message: '请选择节点',
                    trigger: 'blur'
                }
            ],
            title: [
                {
                    required: true,
                    message: '请输入标题',
                    trigger: 'blur'
                }
            ]
        }
        customFormList: any = {}
        type: string = ''
        receiverDetail: any = {}
        loading: boolean = false
        get isAdd() {
            return this.type === 'add'
        }
        show(data, type) {
            this.isShow = true
            this.type = type
            if (!this.isAdd) {
                const target = this.receiverList.find(item => item.name === data.name)
                this.receiver = target || {}
                this.receiverDetail = data
                this.formData.node = this.receiverDetail.node
                this.formData.title = this.receiverDetail.title
                this.formData.global = this.receiverDetail.global
            } else {
                this.receiver = data
            }
            this.formData.type = this.receiver.type
            this.handleCustomComponent(this.receiver.requested_configuration)
        }
        handleCustomComponent(configInfo) {
            let typeArr = []
            for (const k in configInfo) {
                this.$set(this.formData.configuration, k, this.isAdd ? configInfo[k].default_value : this.receiverDetail.attributes[k])
                if (receiverComponentTypes.includes(`custom${this.toUpperCase(configInfo[k].type)}`)) {
                    this.customFormList[k] = configInfo[k]
                    this.customFormList[k].componentName = `custom${this.toUpperCase(this.customFormList[k].type)}`
                    if (!configInfo[k].is_optional) {
                        this.$set(this.rules, `configuration.${k}`, [
                            {
                                required: true,
                                message: `请输入${this.customFormList[k].human_name}`,
                                trigger: 'blur'
                            }
                        ])
                    }
                }
                typeArr.push(`custom${this.toUpperCase(configInfo[k].type)}`)
            }
            typeArr = Array.from(new Set(typeArr)).filter(item => !receiverComponentTypes.find(tex => tex === item))
            if (typeArr.length) {
                console.error(`当前缺少注册的组件有${typeArr.join('、')}`)
            }
        }
        confirm() {
            const validateForm: any = this.$refs.validateForm
            validateForm.validate().then(() => {
                this.loading = true
                const url = this.isAdd ? 'createCluster' : 'editCluster'
                let params = {}
                if (this.isAdd) {
                    params = {
                        ...this.formData
                    }
                } else {
                    params = {
                        id: this.receiverDetail.id,
                        body: this.formData
                    }
                }
                this.$api.logManage[url](params).then(res => {
                    if (!res.result) {
                        this.$error(res.message)
                        return false
                    }
                    this.$success(this.isAdd ? `数据接收 ${this.formData.title} 启动成功` : `接收器 ${this.formData.title} 更新成功`)
                    this.$emit('update-list')
                    this.cancel()
                }).finally(() => {
                    this.loading = false
                })
            })
        }
        cancel() {
            this.isShow = false
        }
        hiddenSideslider() {
            Object.assign(this.$data, this.$options.data.call(this))
        }
        toUpperCase(word) {
            return word.charAt(0).toUpperCase() + word.slice(1)
        }
    }
</script>

<style lang="scss" scoped>
.content-box {
    height: calc(100vh - 60px);
    padding: 20px 20px 0 20px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    .main-box {
        flex: 1;
        height: 0;
        padding-right: 10px;
        overflow-y: auto;
        overflow-x: hidden;
        .tip-text {
            color: #838383;
        }
    }
    .footer-box {
        padding-right: 10px;
        height: 70px;
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
    }
}
</style>
