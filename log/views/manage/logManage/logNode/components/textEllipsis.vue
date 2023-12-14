<template>
    <div id="text-ellipsis" @click="toClick">
        <div class="content-cls" :style="{ width: width }" v-bk-tooltips="baseUsage" :disabled="isShowEllipsis" :delay="[0,0]">
            <label ref="txt" :class="{ 'is-link': isLink }">{{ value }}</label>
        </div>
    </div>
</template>

<script lang="ts">
    /**
     * @comopnent 文字省略提示公用组件
     * @props {
     *   value:'' //文字内容
     *   outerShellWidth //Tooltip 外层壳的宽度,default自定义设置
     *   required 是否必填
     * }
     */
    import { Vue, Component, Prop } from 'vue-property-decorator'
    @Component({
        name: 'text-ellipsis'
    })
    export default class TextEllipsis extends Vue {
        @Prop({ type: String, default: '' }) value: string
        @Prop({ type: Number, default: 0 }) outerShellWidth: number
        @Prop({ type: Boolean, default: false }) isLink: boolean

        isShowEllipsis: boolean = true
        baseUsage = {
            content: this.value,
            showOnInit: true,
            placements: ['top-start']
        }
        get width() {
            // const _width = this.outerShellWidth
            // Tooltip 外层壳宽度自动填充px
            return this.outerShellWidth ? this.outerShellWidth + 'px' : '100%'
        }
        mounted() {
            this.$nextTick(() => {
                const width = this.outerShellWidth || document.getElementById('text-ellipsis').offsetWidth
                if (this.$refs.txt.offsetWidth > width) {
                    // 作比较：文本实际的宽度与外层壳的宽度
                    this.isShowEllipsis = false
                }
            })
        }
        toClick() {
            this.$emit('click')
        }
    }
</script>

<style scoped lang="scss">
#text-ellipsis {
    width: 100%;
    .content-cls {
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
        vertical-align: middle;
    }
    .is-link {
        cursor: pointer;
    }
}
</style>
