<template>
    <div class="intention-page">
        <div class="header">
            <div class="left"></div>
        </div>
        <page-explanation :title="'响应'" :content="'机器人或系统对用户的意图进行回应或操作的方式，响应包括文字回复、链接、按钮动作执行等等'"></page-explanation>
        <div class="intention-box">
            <response-list></response-list>
            <response-detail></response-detail>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import PageExplanation from '@/components/pageExplanation.vue'
    import ResponseList from './responseList.vue'
    import ResponseDetail from './responseDetail.vue'

@Component({
    components: {
        PageExplanation,
        ResponseList,
        ResponseDetail
    }
})

export default class Intention extends Vue {}
</script>

<style  lang="scss" scoped>
.intention-page {
    .intention-box {
        display: flex;
    }
}
</style>
