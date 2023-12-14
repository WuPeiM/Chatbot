<template>
    <div class="add-config-container">
        <div class="search-box">
            <bk-input
                :clearable="true"
                :right-icon="'bk-icon icon-search'"
                v-model="keyword" />
        </div>
        <div class="config-tab-contains" v-bkloading="{ isLoading: loading, zIndex: 10 }">
            <menu-tab
                :panels="panels"
                type="line"
                :active-panel="activeMenu"
                v-model="activeMenu"
                @click="selectedIds = []" />
            <div class="template-list-container">
                <bk-exception
                    v-if="!templateList.length"
                    class="exception-wrap-item exception-part mt40"
                    type="empty"
                    scene="part"
                    :class="{ 'exception-gray': false }" />
                <ul v-else>
                    <li
                        v-for="item in templateList"
                        :key="item.templateId"
                        :class="{ 'active': selectedIds.includes(item.templateId) }">
                        <div class="box" @click="clickConfig(item)">
                            <svg><use xlink:href="#weops-health-scan"></use></svg>
                            <div class="info">
                                <p>{{ item.templateName }}</p>
                                <span>{{ item.probeType }}</span>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="footer">
                <bk-button
                    class="mr10"
                    theme="default"
                    @click="handleCancel">
                    返回
                </bk-button>
                <bk-button
                    class="mr10"
                    theme="primary"
                    @click="handleNextConfig">
                    下一步
                </bk-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    import { Probe } from '@log/types'
    import MenuTab from '@/components/menuTab.vue'

    // 自动引入views下的组件
    const modulesFiles = require.context('./json', true, /\.json$/)
    const modules = modulesFiles.keys().reduce((modules, modulePath) => {
        const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
        modules[moduleName] = modulesFiles(modulePath) || []
        return modules
    }, {})

    @Component({
        name: 'add-config',
        components: {
            MenuTab
        }
    })
    export default class AddConfig extends Vue {
        keyword: string = ''
        loading: boolean = false
        panels: Array<{
            label: string,
            name: string
        }> = []
        activeMenu: string = ''
        probeList: Probe[] = []
        selectedIds: string[] = []

        get templateList() {
            return (modules[this.activeMenu] || []).filter(item => item.templateName.includes(this.keyword))
        }

        created() {
            this.getProbeList()
        }

        async getProbeList() {
            this.loading = true
            try {
                const res = await this.$api.logNode.getProbeList()
                const { data, result, message } = res
                if (!result) {
                    this.$error(message)
                    return false
                }
                this.probeList = data
                this.panels = data.reduce((result, current) => {
                    if (!result.find(r => r.label === current.name)) {
                        result.push({ label: current.name, name: current.name })
                    }
                    return result
                }, [])
                this.activeMenu = this.panels[0]?.name
            } finally {
                this.loading = false
            }
        }
        clickConfig(item) {
            const spliceTemp = (id) => {
                const index = this.selectedIds.findIndex(row => row === id)
                this.selectedIds.splice(index, 1)
            }
            if (item.templateId === 'custom') {
                this.selectedIds = ['custom']
                return false
            }
            if (this.selectedIds.includes('custom') && item.templateId !== 'custom') {
                spliceTemp('custom')
            }
            if (this.selectedIds.includes(item.templateId)) {
                spliceTemp(item.templateId)
            } else {
                this.selectedIds.push(item.templateId)
            }
        }
        handleCancel() {
            this.$router.push({
                name: 'CollectionConfig'
            })
        }
        handleNextConfig() {
            if (!this.selectedIds.length) {
                this.$warn('请先选择该探针类型下的模板')
                return false
            }
            // 若自定义模板,则跳转到自定义配置页面
            const name = this.selectedIds.includes('custom') ? 'CustomConfig' : 'TempConfig'
            this.$router.push({
                name,
                query: {
                    type: this.activeMenu,
                    ids: this.selectedIds.join(',')
                }
            })
        }
    }
</script>

<style scoped lang="scss">
.add-config-container {
    background: #ffffff;
    height: calc(100vh - 140px);
    .search-box {
        padding: 20px 20px 10px 20px;
    }
    .config-tab-contains {
        min-height: 350px;
    }
    .template-list-container {
        height: calc(100vh - 300px);
        overflow-y: auto;
        ul {
            padding: 20px;
            li {
                display: inline-block;
                width: calc(25% - 12px);
                margin-right: 16px;
                border-radius: 4px;
                border: 1px solid #e6e9ee;
                margin-bottom: 15px;
                .box {
                    display: flex;
                    padding: 10px 15px;
                    align-items: center;
                    cursor: pointer;
                    >svg {
                        width: 50px;
                        height: 50px;
                    }
                }
                .info {
                    margin-left: 20px;
                    p {
                        font-weight: bold;
                        margin-top: 0;
                    }
                }
                &:hover {
                    background: #e8f5ff;
                }
                &.active {
                    border: 1px solid #3D91FF;
                }
                &:nth-child(4n+4) {
                    margin-right: 0;
                }
            }
        }
    }
    .footer {
        text-align: center;
    }
}
</style>
