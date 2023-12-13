<template>
    <bk-dialog
        :position="{ top: 100 }"
        :width="600"
        v-model="visible"
        theme="primary"
        :mask-close="false"
        header-position="left"
        :title="`为提取器 ${title}排序`">
        <div>
            <div class="mb10">在列表中拖放提取器以更改它们的应用顺序.</div>
            <div class="list-box">
                <transition-group class="container" name="sort">
                    <div
                        v-for="(item, index) in extractorList"
                        :class="[
                            'already-add-list-item',
                            index !== extractorList.length - 1 && 'list-item-border',
                            item.id === dragEndId && dragStartId !== dragEndId && (dragStartIndex > dragEndIndex ? 'already-add-active-top' : 'already-add-active-bottom')
                        ]"
                        :key="item.id">
                        <div
                            class="drag-box"
                            draggable="true"
                            @dragstart="dragstart(item, index)"
                            @dragenter="dragenter(item, index)"
                            @dragend="getDragend()"
                            @dragover="dragover($event)">
                            <i class="cw-icon weops-drag-drop"></i><span class="name">{{item.title}}</span>
                        </div>
                    </div>
                </transition-group>
            </div>
        </div>
        <template slot="footer">
            <bk-button
                :loading="loading"
                :theme="'primary'"
                :title="'确认'"
                class="mr10"
                @click="confirm">
                确认
            </bk-button>
            <bk-button
                :theme="'default'"
                type="submit"
                :title="'取消'"
                @click="close">
                取消
            </bk-button>
        </template>
    </bk-dialog>
</template>

<script lang="ts">
    import {Vue, Component} from 'vue-property-decorator'
    @Component({})
    export default class extractorOrder extends Vue {
        loading: boolean = false
        extractorList: any[] = []
        visible: boolean = false
        title: string = ''
        oldData: any = ''
        dragStartId: string = ''
        dragEndId: string = ''
        dragStartIndex: string | number = ''
        dragEndIndex: string | number = ''
        dragstart(value, index) {
            this.oldData = value
            this.dragStartId = value.id
            this.dragStartIndex = index
        }
        dragenter(value, index) {
            this.dragEndId = value.id
            this.dragEndIndex = index
        }
        dragover(e) {
            e.preventDefault()
        }
        getDragend() {
            if (this.dragStartId !== this.dragEndId) {
                const oldIndex = this.extractorList.findIndex(item => item.id === this.dragStartId)
                const newIndex = this.extractorList.findIndex(item => item.id === this.dragEndId)
                // 删除之前DOM节点
                this.extractorList.splice(oldIndex, 1)
                // 在拖拽结束目标位置增加新的DOM节点
                this.extractorList.splice(newIndex, 0, this.oldData)
            }
            this.dragEndId = ''
        }
        confirm() {
            const orderObj = {
                order: {}
            }
            this.extractorList.forEach((item, index) => {
                orderObj.order[index] = item.id
            })
            this.loading = true
            this.$api.extractor.orderExtractors({
                id: this.$route.query.receiverId,
                body: orderObj
            }).then(res => {
                const { result, message } = res
                if (!result) {
                    this.$error(message)
                    return false
                }
                this.$success('提取器位置更新成功')
                this.$emit('refresh-list')
                this.close()
            }).finally(() => {
                this.loading = false
            })
        }
        show(title, list) {
            this.visible = true
            this.title = title
            this.extractorList = JSON.parse(JSON.stringify(list))
        }
        close() {
            this.visible = false
        }
    }
</script>

<style lang="scss" scoped>
    .list-box {
        max-height: 350px;
        overflow: auto;
        border: 1px solid #d0d0d0;
        border-radius: 4px;
    }
    .already-add-list-item {
        display: flex;
        justify-content: space-between;
        height: 36px;
        line-height: 36px;
        padding-right: 12px;
        position: relative;
        .drag-box {
            padding-left: 10px;
            .name {
                color: $cw-color-text-0;
                margin-left: 5px;
            }
            .cw-icon {
                //opacity: 0;
                font-size: 16px !important;
                color: $cw-color-text-3;
            }
        }
    }
    .drag-box {
        cursor: move !important;
        flex: 1;
    }
    .already-add-active-top::after,
    .already-add-active-bottom::after {
        position: absolute;
        display: block;
        content: "";
        width: 100%;
        height: 1px;
        background-color: #0D90FC;
    }
    .already-add-active-top::after {
        top: 0;
    }
    .already-add-active-bottom::after {
        bottom: 0;
    }
    .already-add-list-item:hover {
        background-color: $cw-color-bg-1;
        cursor: pointer;
    }
    .list-item-border {
        border-bottom: 1px solid #d0d0d0;
    }
</style>
