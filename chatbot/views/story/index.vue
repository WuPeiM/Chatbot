<template>
    <div class="story-page">
        <page-explanation :title="'故事'" :content="'故事是一系列有序的意图和响应组合，用于训练模型以理解并回应用户的不同交互场景'"></page-explanation>
        <div class="story-box">
            <div class="head">
                <bk-input
                    class="search-box"
                    :clearable="true"
                    :placeholder="'请输入名称进行搜索'"
                    :right-icon="'bk-icon icon-search'"
                    v-model="searchName"
                    @right-icon-click="searchStory"
                    @enter="searchStory">
                </bk-input>
                <bk-button class="btn" theme="primary" title="创建" icon="icon-bk" @click="handleAdd">创建故事</bk-button>
            </div>
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

export default class Intention extends Vue {
    searchName: string = ''

    searchStory() {
        console.log('搜索', this.searchName)
    }
    handleAdd() {
        console.log('新增')
    }
}
</script>

<style  lang="scss" scoped>
.story-page {
    .story-box {
        background-color: #fff;
        min-height: calc(100vh - 200px);
        padding: 20px 15px;
        .head {
            display: flex;
            justify-content: space-between;
        }
        .search-box {
            width: 400px;
        }
    }
}
</style>
