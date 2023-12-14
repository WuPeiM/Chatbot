<template>
    <div class="custom-config-wrapper">
        <div class="custom-config-content" v-bkloading="{ isLoading: loading, zIndex: 10 }">
            <bk-form
                :label-width="100"
                :model="formData"
                :rules="rules"
                ref="configForm">
                <bk-form-item
                    label="配置名称"
                    :required="true"
                    style="width: 450px;"
                    :property="'name'">
                    <bk-input v-model="formData.name" />
                </bk-form-item>
                <bk-form-item
                    label="探针类型"
                    :required="true"
                    style="width: 450px;"
                    :property="'collector_name'">
                    <bk-input
                        :disabled="true"
                        v-model="formData.collector_name" />
                </bk-form-item>
                <bk-form-item
                    label="操作系统"
                    :required="true"
                    style="width: 450px;"
                    :property="'os_type'">
                    <bk-select
                        :disabled="routeName === 'UpdateConfig'"
                        :clearable="false"
                        v-model="formData.os_type">
                        <bk-option
                            v-for="option in typeList"
                            :key="option.os_type"
                            :id="option.os_type"
                            :name="option.os_type">
                        </bk-option>
                    </bk-select>
                </bk-form-item>
                <template v-if="routeName === 'TempConfig'">
                    <bk-card
                        v-for="item in config"
                        :key="item.templateId"
                        :title="item.templateName"
                        :is-collapse="true"
                        :collapse-icons="icons">
                        <component
                            v-for="(widget, index) in item.field"
                            :option="widget"
                            :key="widget.type + index"
                            :is="compType[widget.type]" />
                    </bk-card>
                </template>
                <template v-else>
                    <bk-form-item
                        label="配置"
                        :required="true"
                        property="template">
                        <div style="display: flex;">
                            <div id="my-editor" class="code-editor">
                                <div class="editor-contain" ref="container" />
                                <i
                                    :class="['cw-icon', isFullScreen ? 'weops-exit-full-screen' : 'weops-full-view']"
                                    @click="setFullScreen" />
                            </div>
                            <div class="editor-side-notice">
                                <div class="side-btn" @click="showEditorSide">
                                    <bk-icon :type="isHideSide ? 'angle-double-left' : 'angle-double-right'" />
                                </div>
                                <div v-if="!isHideSide" class="shell-side-notice">
                                    <div class="notice-title">参数说明</div>
                                    <p>这些变量可用于配置中</p>
                                    <div class="notice-table">
                                        <div class="table-list">
                                            <span>变量</span>
                                            <span>描述</span>
                                        </div>
                                        <div class="table-list">
                                            <span>${sidecar.operatingSystem}</span>
                                            <span>日志节点的操作系统类型</span>
                                        </div>
                                        <div class="table-list">
                                            <span>${sidecar.nodeName}</span>
                                            <span>日志节点的IP</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </bk-form-item>
                </template>
            </bk-form>
        </div>
        <div class="footer">
            <bk-button
                class="mr10"
                theme="default"
                :disabled="isConfirm"
                @click="handleReturn">
                返回
            </bk-button>
            <bk-button
                class="mr10"
                theme="primary"
                :loading="isConfirm"
                @click="handleConfirm">
                确认
            </bk-button>
        </div>
    </div>
</template>

<script lang="ts">
    import CustomInput from './components/customInput.vue'
    import CustomList from './components/customList.vue'
    import CustomSelect from './components/customSelect.vue'
    import {Vue, Component, Watch} from 'vue-property-decorator'
    import * as monaco from 'monaco-editor'
    import throttle from 'lodash/throttle'

    @Component({
        name: 'custom-config',
        components: {
            CustomInput,
            CustomList,
            CustomSelect
        },
        beforeRouteLeave(to, from, next) {
            if (this.$compareFormData(this.formData, this.formCloneData)) {
                next()
                return false
            }
            this.$bkInfo({
                title: '确认离开当前页面',
                subTitle: '离开将导致未保存信息丢失',
                confirmLoading: true,
                confirmFn: () => {
                    next()
                },
                cancelFn: () => {
                    this.$bus.$emit('refreshNav', from)
                }
            })
        },
        provide() {
            // 处理key为xx.xxx.xxxx的情况,转换成对象
            const proxyValue = new Proxy(this.tempData, {
                set: function(target, key, value) {
                    const path = key.toString()
                    const keys = path.split('.')
                    let temp = target
                    for (let i = 0; i < keys.length - 1; i++) {
                        const currentKey = keys[i]
                        temp[currentKey] = temp[currentKey] || {}
                        temp = temp[currentKey]
                    }
                    temp[keys[keys.length - 1]] = value
                    return true
                },
                get: function(target, key) {
                    const path = key.toString()
                    const keys = path.split('.')
                    let temp = target
                    for (let i = 0; i < keys.length; i++) {
                        const currentKey = keys[i]
                        if (temp && typeof temp === 'object' && !(temp instanceof Date)) {
                            temp = temp[currentKey]
                        } else {
                            return undefined
                        }
                    }
                    return temp
                }
            })
            return {
                formModel: proxyValue,
                formInstance: this
            }
        }
    })
    export default class CustomConfig extends Vue {
        loading: boolean = false
        icons: string[] = ['icon-right-shape', 'icon-down-shape']
        compType = {
            boolean: 'custom-select',
            text: 'custom-input',
            list: 'custom-list',
            'list.int': 'custom-list'
        }
        formData: any = {
            collector_name: '',
            name: '',
            os_type: 'linux'
        }
        formCloneData: any = {}
        tempData: any = {}
        rules = {
            name: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ],
            os_type: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ]
        }
        isConfirm: boolean = false
        typeList: any = []
        config: any = []
        isFullScreen: boolean = false
        isHideSide: boolean = false
        handleResize: any = null
        monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null

        get routeName() {
            return this.$route.name
        }
        get editorValue(): string {
            if (this.monacoEditor) {
                return this.monacoEditor.getValue()
            }
            return ''
        }
        @Watch('editorValue', {
            deep: true,
            immediate: true
        })
        onEditorValueChanged(val) {
            this.formData.template = val
        }

        created() {
            // 修改配置时,通过id请求数据该条配置的详情
            // 自定义模板和新建配置时,通过config模板配置配置信息和类型赋值
            const { query } = this.$route
            if (this.routeName === 'UpdateConfig') {
                this.getConfigurationsById(query)
            } else {
                const type: string = query['type']
                const ids: string = query['ids']
                this.formData.collector_name = type
                this.getProbeList(type)
                this.getJsonByType(ids.split(','), type)
            }

            this.handleResize = throttle(() => {
                this.$nextTick(() => {
                    if (this.monacoEditor) {
                        this.monacoEditor.layout()
                    }
                })
            }, 200) // 设置节流的时间间隔，单位为毫秒
        }
        mounted() {
            window.addEventListener('resize', this.handleResize)
            if (this.routeName === 'TempConfig') {
                this.formCloneData = this.$Copy(this.formData)
                return false
            }
            let _value = ''
            // 如果是自定义模板.则需要设置默认模板
            if (this.routeName === 'CustomConfig') {
                const _field = this.config.find(row => row.templateId === 'custom')?.field || []
                // 自定义模板若有{{host}}替换成window.log_output_host变量的值
                _value = _field[0]?.default.replace(/{{host}}/g, window['log_output_host']).replace(/\[(.*?)\]/g, '[\'$1\']') || ''
                this.$set(this.formData, 'template', _value)
                this.setTemplateEditor(_value)
                this.formCloneData = this.$Copy(this.formData)
            }
        }

        async getProbeList(activeMenu: string) {
            this.loading = true
            try {
                const res = await this.$api.logNode.getProbeList()
                const { data, result, message } = res
                if (!result) {
                    this.$error(message)
                    return false
                }
                this.typeList = data.filter(row => row.name === activeMenu)
            } finally {
                this.loading = false
            }
        }
        getJsonByType(ids: string[], activeMenu: string) {
            const modulesFiles = require.context('./json', true, /\.json$/)
            modulesFiles.keys().reduce((modules, modulePath) => {
                const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
                if (moduleName === activeMenu) {
                    this.config = (modulesFiles(modulePath) || []).filter(temp => ids.includes(temp.templateId))
                }
            }, {})
        }
        setTemplateEditor(_value) {
            this.monacoEditor = monaco.editor.create(this.$refs['container'], {
                value: _value,
                language: 'python',
                theme: 'vs-dark'
            })
        }
        async getConfigurationsById(query) {
            this.loading = true
            try {
                const { id, os_type: type } = query
                if (!id) {
                    return false
                }
                this.typeList = [{ os_type: type }]
                const res = await this.$api.logNode.getConfigurationsById({ id })
                const { result, message, data } = res
                if (!result) {
                    return this.$error(message)
                }
                this.formData = { ...query, ...data }
                this.formCloneData = this.$Copy(this.formData)
                this.setTemplateEditor(data.template)
            } finally {
                this.loading = false
            }
        }
        handleReturn() {
            this.$router.push({
                name: this.routeName === 'UpdateConfig' ? 'CollectionConfig' : 'AddConfig'
            })
        }
        handleConfirm() {
            this.$refs.configForm.validate().then(async validator => {
                this.isConfirm = true
                const params = this.formData
                const isUpdate = this.routeName === 'UpdateConfig'
                if (this.routeName === 'TempConfig') {
                    params['params'] = {
                        ...this.tempData,
                        log_output_host: [window['log_output_host']]
                    }
                }
                const url = isUpdate ? 'updateConfigurations' : 'createConfigurations'
                try {
                    const res = await this.$api.logNode[url](params)
                    const { result, message } = res
                    if (!result) {
                        this.$warn(message)
                        return false
                    }
                    this.formCloneData = this.$Copy(this.formData)
                    this.$success(`${isUpdate ? '修改' : '新建'}成功`)
                    this.$router.push({
                        name: 'CollectionConfig'
                    })
                } finally {
                    this.isConfirm = false
                }
            }, validator => {
                console.warn(`${validator.field}：${validator.content}`)
            })
        }
        setFullScreen() {
            this.isFullScreen = !this.isFullScreen
            const myEditor = document.getElementById('my-editor')
            if (this.isFullScreen) {
                this.$nextTick(() => {
                    myEditor.style.position = 'fixed'
                    myEditor.style.zIndex = '9999'
                    myEditor.style.top = '0'
                    myEditor.style.left = '0'
                    myEditor.style.height = '100vh'
                    myEditor.style.width = '100vw'
                    this.monacoEditor?.layout()
                })
            } else {
                this.$nextTick(() => {
                    myEditor.style.position = 'relative'
                    myEditor.style.zIndex = '1'
                    myEditor.style.height = 'calc(100vh - 380px)'
                    myEditor.style.flex = '1'
                    myEditor.style.width = '0'
                    this.monacoEditor?.layout()
                })
            }
        }
        showEditorSide() {
            this.isHideSide = !this.isHideSide
            this.$nextTick(() => {
                this.monacoEditor.layout()
            })
        }
        beforeDestroy() {
            window.removeEventListener('resize', this.handleResize)
        }
    }
</script>

<style scoped lang="scss">
.custom-config-wrapper {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 130px);
    background: #ffffff;
    padding: 20px 20px 0 20px;
    /deep/.bk-card {
        width: calc(100% - 40px) !important;
        margin: 20px;
        .bk-card-body {
            cursor: initial !important;
        }
    }
    .custom-config-content {
        overflow-y: auto;
        flex: 1;
    }
    .code-editor {
        flex: 1;
        width: 0;
        position: relative;
        height: calc(100vh - 380px);
        .editor-contain {
            height: 100%;
        }
        .cw-icon {
            cursor: pointer;
            position: absolute;
            right: 15px;
            top: 10px;
            color: #fff;
        }
    }
    .editor-side-notice {
        display: flex;
        height: calc(100vh - 380px);
        .side-btn {
            background: #46464c;
            color: #fff;
            cursor: pointer;
            font-size: 12px;
            height: 100%;
            padding-top: 45%;
            text-align: center;
            width: 25px;

            .bk-icon {
                font-size: 16px !important;
            }
        }
        .shell-side-notice {
            padding: 25px 10px 20px;
            width: 400px;
            background: #3b3c42;
            font-size: 12px;
            overflow: auto;
            color: #c4c6cc;
            .notice-title {
                color: #fff;
                font-size: 12px;
                font-weight: 700;
                height: 16px;
                line-height: 16px;
                margin-bottom: 5px;
            }
            .notice-table {
                background: #313238;
                padding: 10px;
                margin-top: 10px;
                margin-bottom: 20px;
                .table-list {
                    display: flex;
                    span {
                        flex: 1;
                    }
                }
            }
        }
    }
    .footer {
        height: 40px;
        text-align: center;
    }
}
</style>
