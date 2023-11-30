<template>
    <div class="story-page">
        <page-explanation :title="'故事'" :content="'故事是一系列有序的意图和响应组合，用于训练模型以理解并回应用户的不同交互场景'"></page-explanation>
        <div class="story-box">
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import PageExplanation from '@/components/pageExplanation.vue'

@Component({
    components: {
        PageExplanation
    }
})

export default class Intention extends Vue {}
</script>

<style  lang="scss" scoped>
.story-page {
    .story-box {
        display: flex;
    }
}
</style>
