<template>
    <div>
        <bk-sideslider
            title="Search Syntax Help"
            :is-show.sync="visible"
            :quick-close="true"
            :width="500"
            ext-cls="common-dialog-wrapper"
            :before-close="handleClose"
        >
            <div slot="content" class="common-dialog-wrapper-main" v-bkloading="{ isLoading: tableLoading, zIndex: 10 }">
                <h4 class="search-title">
                    可用的搜索字段
                </h4>
                <ComTable
                    class="common-table-max-height"
                    v-bkloading="{ isLoading: tableLoading, zIndex: 10 }"
                    ref="healthTable"
                    :data="fieldList"
                    :columns="columns"
                    :max-height="maxHeight"
                >
                </ComTable>
                <div class="example">
                    <h4>
                        示例
                    </h4>
                    <div class="example-label">
                        查找描述中包含安全性的实体：
                    </div>
                    <span class="example-value">
                        description:security
                    </span>
                    <div class="example-label">
                        查找 id 为 5f4dfb9c69be46153b9a9a7b 的实体：
                    </div>
                    <span class="example-value">
                        id:5f4dfb9c69be46153b9a9a7b
                    </span>
                </div>
            </div>
            <div slot="footer">
                <bk-button theme="default" @click="handleClose">取消</bk-button>
            </div>
        </bk-sideslider>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    import ComTable from '@/components/comTable.vue'
@Component({
    components: {
        ComTable
    }
})
export default class TipsModal extends Vue {
    visible: boolean = false
    maxHeight: string | number = ''
    fieldList: Array<any> = []
    tableLoading: boolean = false
    columns = [
        {
            label: '字段',
            key: 'field',
            width: '180px'
        },
        {
            label: '描述',
            key: 'description'
        }
    ]

    mounted() {
        this.getFieldList()
        const PAGE_OCCUPIED_HEIGHT = 184
        this.maxHeight = window.innerHeight - PAGE_OCCUPIED_HEIGHT
        window.onresize = () => {
            this.maxHeight = window.innerHeight - PAGE_OCCUPIED_HEIGHT
        }
    }

    getFieldList() {
        this.fieldList = [
            {
                id: 1,
                field: 'field',
                description: 'search 的 ID，它是唯一的引用'
            },
            {
                id: 2,
                field: 'description',
                description: 'search 的标题'
            }
        ]
    }

    // 显示弹窗
    show() {
        this.visible = true
    }
    handleClose() {
        this.visible = false
    }
}
</script>

<style lang="scss" scoped>
.example-value {
    display: inline-block;
    padding: 4px;
    margin: 10px 0;
    color: rgb(116, 5, 5);
    background-color: rgb(247, 239, 239);
}
</style>
