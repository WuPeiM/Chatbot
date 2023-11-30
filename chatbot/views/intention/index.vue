<template>
    <div class="intention-page">
        <div class="header">
            <div class="left"></div>
        </div>
        <page-explanation :title="'意图'" :content="'用于创建/管理用户在交互中表达的目的或意图。意图反映了用户想要做什么'"></page-explanation>
        <div class="intention-box">
            <intention-list></intention-list>
            <intention-detail></intention-detail>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import PageExplanation from '@/components/pageExplanation.vue'
    import IntentionList from './intentionList.vue'
    import IntentionDetail from './intentionDetail.vue'

@Component({
    components: {
        PageExplanation,
        IntentionList,
        IntentionDetail
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
