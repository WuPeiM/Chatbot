<template>
    <div class="detail-info" v-bkloading="{ isLoading: pageLoading, zIndex: 10 }">
        <bk-card :is-collapse="true"
            :collapse-icons="icons"
            v-if="$route.query.otherType === 'host' && !isConfigFile">
            <div class="content-box-title" slot="header">
                <span>拓扑信息</span>
            </div>
            <div class="host-path">
                <ul>
                    <li v-for="(item, index) in instanceData.topology" :key="index" v-if="(!isExpand && index < 1) || isExpand">
                        {{item}}
                        <span v-if="instanceData.topology.length > 1 && index === 0" @click="isExpand = !isExpand">
                            {{ isExpand ? '收起' : '更多' }}
                            <bk-icon type="angle-down" v-if="!isExpand" />
                            <bk-icon type="angle-up" v-else />
                        </span>
                    </li>
                </ul>
            </div>
        </bk-card>
        <bk-card
            v-for="item in instanceFieldsCopy.filter(item => item.title)"
            :key="item.id"
            :border="false"
            :is-collapse="true"
            :collapse-icons="icons"
            :collapse-status.sync="item.collapseStatus">
            <div class="content-box-title" slot="header">
                <span>{{item.title}}</span>
            </div>
            <div class="list-box">
                <div
                    class="list-box-item"
                    :style="{ width: ($route.name === 'RemoteConnect' || readOnly || allowEdit) ? '50%' : '33%' }"
                    v-bkloading="{ isLoading: tex.editLoading, zIndex: 10 }"
                    v-for="(tex, index) in item.children"
                    :key="tex.bk_property_id + index">
                    <span class="label hide-text" v-bk-overflow-tips>{{tex.bk_property_name}}</span>
                    <span class="mr10">:</span>
                    <div v-if="tex.bk_property_type === 'objuser'" :id="`person-dialog-${tex.bk_property_id}`" class="person-dialog">
                        <div class="person-tab">
                            <div class="person-nav">
                                <div
                                    v-for="nev in tex.personTab"
                                    :key="nev.name"
                                    :class="['nav-item hide-text', tex.activeTab === nev.name && 'active-nav-item']"
                                    v-bk-overflow-tips
                                    @click="getPersonDetailInfo(tex, nev)">
                                    {{nev.label}}
                                </div>
                            </div>
                            <div class="person-content" v-bkloading="{ isLoading: tex.loading, zIndex: 10 }">
                                <div class="content-item">
                                    <span class="label">电话:</span>
                                    <span class="value hide-text" v-bk-overflow-tips>{{tex.userInfo.phone}}</span>
                                </div>
                                <div class="content-item">
                                    <span class="label">邮箱:</span>
                                    <span class="value hide-text" v-bk-overflow-tips>{{tex.userInfo.email}}</span>
                                </div>
                                <div class="content-item">
                                    <span class="label">部门:</span>
                                    <span class="value hide-text" v-bk-overflow-tips>{{tex.userInfo.departments}}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        v-show="!tex.editStatus"
                        v-bk-tooltips="tex.htmlConfig || {}"
                        ref="tooltipsHtml"
                        class="show-text">
                        <span class="value hide-text" v-bk-overflow-tips>
                            {{getShowValue(tex)}}
                        </span>
                    </div>
                    <div v-if="tex.editStatus" :class="tex['bk_property_type'] !== 'bool' && 'edit-box'">
                        <bk-date-picker
                            v-if="['date', 'time'].includes(tex['bk_property_type'])"
                            v-model="tex.editValue"
                            style="width: 100%;"
                            :placeholder="'选择日期时间'"
                            :type="tex['bk_property_type'] === 'date' ? 'date' : 'datetime'">
                        </bk-date-picker>
                        <bk-select
                            v-else-if="['enum', 'list'].includes(tex['bk_property_type'])"
                            v-model="tex.editValue"
                            :popover-options="{
                                appendTo: 'parent'
                            }"
                            ext-cls="select-custom"
                            :clearable="false"
                            style="width: 100%;"
                            ext-popover-cls="select-popover-custom"
                            searchable>
                            <bk-option
                                v-for="option in tex.option"
                                :key="option.id"
                                :id="option.id"
                                :name="option.name">
                            </bk-option>
                        </bk-select>
                        <bk-switcher
                            v-else-if="tex['bk_property_type'] === 'bool'"
                            theme="primary"
                            v-model="tex.editValue">
                        </bk-switcher>
                        <timezone :placeholder="tex.placeholder"
                            v-model="tex.editValue"
                            v-else-if="tex['bk_property_type'] === 'timezone'">
                        </timezone>
                        <bk-select
                            v-else-if="tex.bk_property_type === 'objuser'"
                            :disabled="userLoading"
                            multiple
                            search-placeholder="请输入"
                            style="width: 100%;"
                            :search-with-pinyin="true"
                            v-model="tex.editValue"
                            ext-cls="select-custom"
                            ext-popover-cls="select-popover-custom"
                            searchable
                            display-tag
                            enable-virtual-scroll
                            :list="userData"
                            id-key="key"
                            display-key="displayKey">
                        </bk-select>
                        <bk-input
                            v-else
                            style="width: 100%;"
                            :clearable="true"
                            v-model="tex.editValue"
                            :type="['int', 'float'].includes(tex['bk_property_type']) ? 'number' : 'text'" />
                    </div>
                    <span class="operate" v-if="($route.name !== 'RemoteConnect' && !readOnly) || allowEdit">
                        <span v-if="!tex.editStatus" class="edit-icon">
                            <bk-icon
                                v-permission="powerParams"
                                v-if="tex.editable"
                                class="operate-icon-edit"
                                type="edit"
                                @click="editInfo(tex)" />
                            <bk-icon
                                v-copy="getShowValue(tex)"
                                class="operate-icon-copy"
                                type="clipboard" />
                        </span>
                        <span v-else class="confirm-cancel">
                            <bk-icon type="check-1" class="operate-icon-left" style="font-size: 28px;color: #3A84FF;" @click="confirmEdit(tex)" />
                            <bk-icon type="close" class="operate-icon-right" style="font-size: 26px;color: #3A84FF;" @click="cancelEdit(tex)" />
                        </span>
                    </span>
                </div>
            </div>
        </bk-card>
    </div>
</template>

<script lang="ts">
    import timezone from './widget/timezone.vue'
    import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
    @Component({
        name: 'detail-info',
        components: {
            timezone
        }
    })
    export default class DetailInfo extends Vue {
        @Prop({
            type: Object,
            default: () => ({})
        })
        instanceData: any | undefined
        @Prop({
            type: Array,
            default: () => []
        })
        instanceFields: Array<any> | undefined
        @Prop({
            type: Boolean,
            default: () => false
        })
        pageLoading: boolean | undefined
        @Prop({
            type: Boolean,
            default: () => false
        })
        isConfigFile: boolean | undefined
        @Prop({
            type: Boolean,
            default: () => false
        })
        readOnly: boolean | undefined
        @Prop({
            type: Boolean,
            default: () => false
        })
        allowEdit: boolean | undefined
        isExpand: boolean = false
        icons = ['icon-right-shape', 'icon-down-shape']
        userData = []
        userLoading: boolean = false
        htmlConfig = {
            allowHTML: true,
            width: 240,
            trigger: 'click',
            theme: 'light',
            content: '#person-dialog',
            placement: 'right-start'
        }
        instanceFieldsCopy = []
        @Watch('instanceFields', { immediate: true, deep: true })
        watchInstanceFields(val: any) {
            this.instanceFieldsCopy = JSON.parse(JSON.stringify(val))
            this.updateObjUserProperties()
        }
        @Watch('instanceData', { immediate: true, deep: true })
        watchInstanceData() {
            this.updateObjUserProperties()
        }
        get powerParams() {
            return {
                id: this.$route.query.formPage,
                type: this.$route.query.formPage === 'AssetRecordsHost' ? 'hostManage' : `${this.$route.query.formPage}Manage`
            }
        }
        mounted() {
            this.userData = sessionStorage.getItem('allUserData') ? JSON.parse(sessionStorage.getItem('allUserData')) : []
        }
        updateObjUserProperties() {
            this.instanceFieldsCopy.forEach(item => {
                (item.children || []).forEach(tex => {
                    if (tex.bk_property_type === 'objuser') {
                        tex.personTab = this.getShowValue(tex).split(',').map(item => {
                            return {
                                name: item.split('(')[0],
                                label: item
                            }
                        })
                        this.$set(tex, 'activeTab', tex.personTab[0].name)
                        this.$set(tex, 'userInfo', {})
                        this.$set(tex, 'loading', false)
                        tex.htmlConfig = {
                            allowHTML: true,
                            width: 240,
                            trigger: 'click',
                            theme: 'light',
                            content: `#person-dialog-${tex.bk_property_id}`,
                            placement: 'right-start',
                            disabled: tex.bk_property_type !== 'objuser',
                            extCls: 'select-popover-custom',
                            onShow: (e) => {
                                this.getPersonDetailInfo(tex, tex.personTab[0])
                            }
                        }
                    }
                })
            })
        }
        async getPersonDetailInfo(tex, nev) {
            this.$set(tex, 'activeTab', nev.name)
            try {
                this.$set(tex, 'loading', true)
                const { result, message, data } = await this.$api.userManage.getUserList({
                    page: 1,
                    page_size: 20,
                    search: '',
                    roles: [],
                    usernames: [nev.name]
                })
                if (!result) {
                    this.$error(message)
                    return false
                }
                const userInfo = data.items[0]
                userInfo.departments = userInfo.departments.map(item => item.name).join('-')
                this.$set(tex, 'userInfo', userInfo)
            } finally {
                this.$set(tex, 'loading', false)
            }
        }
        // 获取展示值
        getShowValue(tex) {
            if (tex['bk_property_type'] === 'time') {
                return this.instanceData[tex.bk_property_id] ? this.$FormatTime('yyyy-MM-dd hh:mm:ss', this.instanceData[tex.bk_property_id]) : '--'
            } else if (tex['bk_property_type'] === 'bool') {
                return this.instanceData[tex.bk_property_id] ? '是' : '否'
            } else if (tex['bk_property_type'] === 'enum') {
                return this.getEnumValue(this.instanceData[tex.bk_property_id], tex)
            } else if (['int', 'float'].includes(tex['bk_property_type'])) {
                return this.instanceData[tex.bk_property_id]
            } else {
                return this.instanceData[tex.bk_property_id] || '--'
            }
        }
        // 获取枚举值
        getEnumValue(value, item) {
            // eslint-disable-next-line camelcase
            const { bk_property_type, option } = item
            const optionFind = id => option?.find(tex => tex.id === id)?.name || '--'
            // eslint-disable-next-line camelcase
            return bk_property_type === 'bool' ? optionFind(value.toString()) : optionFind(value)
        }
        // 编辑信息
        editInfo(tex) {
            if (!this.$BtnPermission(this.powerParams)) {
                return false
            }
            this.$set(tex, 'editStatus', true)
            if (tex['bk_property_type'] === 'objuser') {
                const data = this.instanceData[tex.bk_property_id]
                if (data) {
                    const userArr = data.split(',').map(item => {
                        return item.split('(')[0]
                    })
                    this.$set(tex, 'editValue', userArr)
                } else {
                    this.$set(tex, 'editValue', '')
                }
            } else {
                this.$set(tex, 'editValue', this.instanceData[tex.bk_property_id])
            }
        }
        // 确认编辑
        confirmEdit(tex) {
            const url = this.$route.query.instanceType === 'host' && !this.isConfigFile ? 'modifyHostsBulk' : 'modifyOtherSrcDetail'
            const params = {
                data: [],
                bk_host_ids: [
                    Number(this.$route.query.instanceId)
                ],
                bk_obj_id: this.isConfigFile ? 'profile' : this.$route.query.otherType,
                bk_inst_id: this.isConfigFile ? this.instanceData.bk_inst_id : this.$route.query.instanceId,
                body: {
                    data: []
                }
            }
            let editValue: string | number = ''
            if (tex['bk_property_type'] === 'objuser') {
                editValue = tex.editValue ? tex.editValue.join(',') : ''
            } else if (tex['bk_property_type'] === 'int') {
                editValue = tex.editValue && Number(tex.editValue)
            } else if (['date', 'time'].includes(tex['bk_property_type'])) {
                const time = this.$FormatTime(tex['bk_property_type'] === 'time' ? 'yyyy-MM-dd hh:mm:ss' : 'yyyy-MM-dd', tex['editValue'])
                editValue = time === '--' ? null : time
            } else {
                editValue = tex['editValue']
            }
            params.data.push({
                key: tex['bk_property_id'],
                value: editValue,
                type: tex['bk_property_type']
            })
            params.body.data = params.data
            this.$set(tex, 'editLoading', true)
            this.$api.Resource[url](params).then(res => {
                const { result, message } = res
                if (!result) {
                    this.$error(message)
                    return false
                }
                this.$success('信息编辑成功！')
                this.$emit('updateInstanceData', true)
            }).finally(() => {
                this.$set(tex, 'editLoading', false)
                this.$set(tex, 'editValue', '')
                this.$set(tex, 'editStatus', false)
                this.$set(tex, 'editIconShow', false)
            })
        }
        // 取消编辑
        cancelEdit(tex) {
            this.$set(tex, 'editValue', '')
            this.$set(tex, 'editStatus', false)
            this.$set(tex, 'editIconShow', false)
        }
    }
</script>

<style lang="scss">
    .select-popover-custom {
        .tippy-tooltip {
            width: auto !important;
            max-width: 345px !important;
        }
        .tippy-content {
            .person-tab {
                display: flex;
                .person-nav {
                    max-width: 120px;
                    width: auto;
                    border-right: 1px solid #dcdee5;
                    .nav-item {
                        text-align: right;
                        margin-bottom: 10px;
                        margin-top: 10px;
                        cursor: pointer;
                        padding-right: 10px;
                    }
                    .active-nav-item {
                        position: relative;
                        &::after {
                            position: absolute;
                            z-index: 999;
                            top: 0;
                            right: 0;
                            content: "";
                            display: block;
                            width: 2px;
                            height: 20px;
                            background: #3A84FF;
                        }
                    }
                }
                .person-content {
                    padding-top: 10px;
                    padding-left: 10px;
                    .content-item {
                        margin-bottom: 10px;
                        display: flex;
                        .label,
                        .value {
                            display: block;
                        }
                        .value {
                            flex: 1;
                            margin-left: 5px;
                            cursor: pointer;
                        }
                    }
                }
            }
        }
    }
</style>

<style scoped lang="scss">
    .detail-info {
        height: 100%;
        overflow: auto;
        /deep/ .bk-card {
            border: none;
            .collapse {
                border: none;
            }
            .bk-card-body {
                padding: 0;
            }
        }
        /deep/ .bk-card:hover {
            box-shadow: 0 0 0 0 !important;
        }
        /deep/ .bk-card-border-none {
            box-shadow: 0 0 0 0 !important;
        }
        .content-box-title {
            font-size: 14px;
            font-weight: bold;
        }
        .list-box {
            display: flex;
            flex-wrap: wrap;
            padding: 0 0 0 30px;
            .list-box-item {
                width: 33%;
                height: 32px;
                line-height: 32px;
                display: flex;
                margin-bottom: 5px;
                padding-right: 5px;
                .edit-box {
                    flex: 1;
                    width: 0;
                    .bk-select.select-custom {
                        /deep/ .bk-tooltip-ref.tippy-active {
                            position: relative;
                            background: #fff;
                            z-index: 1;
                        }
                    }
                }
                .operate {
                    margin-left: 8px;
                    width: 60px;
                    .edit-icon {
                        display: none;
                    }
                    .operate-icon-edit {
                        margin-right: 5px;
                        color: #3A84FF;
                    }
                    .operate-icon-copy {
                        color: #3A84FF;
                    }
                    .confirm-cancel {
                        position: relative;
                        top: 2px;
                    }
                }
                .show-text {
                    max-width: calc(100% - 145px);
                    .value {
                        width: 100%;
                    }
                    /deep/ .bk-tooltip {
                        width: 100%;
                        .bk-tooltip-ref {
                            max-width: 100%;
                            span {
                                width: 100%;
                            }
                        }
                    }
                }
                span {
                    display: inline-block;
                    font-size: 12px;
                    font-family: MicrosoftYaHei;
                }
                .label {
                    width: 90px;
                    min-width: 90px;
                    text-align: left;
                    color: #63656E;
                }
                .value {
                    flex: 1;
                    color: #313238;
                }
            }
            .list-box-item:hover {
                .operate {
                    .edit-icon {
                        display: inline-block;
                    }
                }
            }
        }
        .host-path {
            ul {
                width: 100%;
                padding-left: 30px;
                li {
                    display: block;
                    margin-bottom: 14px;
                    font-size: 12px;
                    color: #313238;
                    span {
                        color: #0D90FC;
                        font-size: 12px;
                        display: inline-block;
                        margin-left: 20px;
                    }
                }
            }
        }
    }
</style>
