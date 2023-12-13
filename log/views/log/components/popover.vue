<template>
    <div class="popover">
        <bk-popover
            v-if="showTips"
            ref="commonPopover"
            ext-cls="pop-custom"
            theme="light"
            placement="bottom"
            v-bind="$attrs"
            transfer
            :tippy-options="{
                duration: [0,0],
                boundary: 'scrollParent'
            }"
            :arrow="false"
            width="250"
            trigger="click"
            :on-hide="hidePopover">
            <div slot="content">
                <div class="title">
                    <slot name="title"></slot>
                </div>
                <ul>
                    <li v-for="item in operationList" :key="item.type">
                        <bk-button
                            size="small"
                            :disabled="item.disabled"
                            text
                            @click="handleOperate(item)">
                            {{ item.title }}
                        </bk-button>
                    </li>
                </ul>
            </div>
            <slot name="trigger"></slot>
        </bk-popover>
        <div v-else @click="showPopover">
            <slot name="trigger"></slot>
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({
    name: 'Popover',
    components: {}
})

export default class Popover extends Vue {
    @Prop({
        type: Array,
        default: () => []
    })
    operationList: []

    showTips: boolean = false

    handleOperate(item) {
        this.$emit('handleOperate', item)
        this.$refs.commonPopover?.hideHandler()
    }
    showPopover() {
        this.showTips = true
        this.$nextTick(() => {
            this.$refs['commonPopover'].showHandler()
        })
    }
    hidePopover() {
        this.showTips = false
    }
}
</script>

<style scoped lang="scss">
.pop-custom {
    padding: 0;

    .title {
        font-weight: 800;
        font-size: 12px;
        padding: 4px 0 10px 0;
        border-bottom: 1px solid #ddd;
        margin-bottom: 10px;
        word-wrap: break-word;
        word-break: break-all;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        line-height: 20px;
        max-height: 50px;
        -webkit-line-clamp: 2;
    }

    ul {
        li {
            display: flex;
            width: 100%;
        }
    }

    .bk-button-text {
        padding: 0;
    }
}
</style>
