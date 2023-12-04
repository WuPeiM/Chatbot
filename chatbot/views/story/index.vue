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
            <div class="card">
                <story-card v-for="item in storyArr"
                    :key="item.id"
                    :type="item.type"
                    :id="item.id"
                    :name="item.name"
                    :intention="item.intention"
                    :response="item.response"
                    @updateName="updateName"
                    @deleteStory="deleteStory">
                </story-card>
                <div class="add-box" @click="handleAdd">
                    <div class="text">+ 创建故事</div>
                </div>
            </div>
        </div>
        <bk-dialog v-model="visible"
            theme="primary"
            width="500"
            :mask-close="false"
            :header-position="'left'"
            :show-footer="false"
            title="选择故事类型"
            ext-cls="story-dialog">
            <div class="option-box">
                <div class="type rules-type" @click="addStory(0)">
                    <div class="name">规则类</div>
                    <div class="detail">规则类的故事是遵循相同路径的单轮对话</div>
                </div>
                <div class="type story-type" @click="addStory(1)">
                    <div class="name">故事类</div>
                    <div class="detail">故事类支持创建机器人和用户的多轮对话</div>
                </div>
            </div>
        </bk-dialog>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import PageExplanation from '@/components/pageExplanation.vue'
    import StoryCard from './storyCard.vue'

@Component({
    components: {
        PageExplanation,
        StoryCard
    }
})

export default class Intention extends Vue {
    searchName: string = ''
    count = 100
    storyArr = [
        {id: '1', name: '这是一个故事', intention: 2, response: 3, type: 1},
        {id: '11', name: '这是', intention: 13, response: 4, type: 2},
        {id: '121', name: '一个故事', intention: 1, response: 3, type: 1},
        {id: '131', name: '这是一个', intention: 2, response: 6, type: 2}
    ]
    type: number = 0
    visible: boolean = false

    updateName(name, id) {
        console.log('更新', name, id)
    }
    searchStory() {
        console.log('搜索', this.searchName)
        this.storyArr = this.storyArr.filter(item => item.name.includes(this.searchName))
    }
    handleAdd() {
        console.log('新增')
        this.visible = true
    }
    deleteStory(id) {
        this.storyArr = this.storyArr.filter(item => item.id !== id)
    }
    addStory(type) {
        this.$router.push({name: 'StoryDetail'})
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
            margin-bottom: 20px;
        }
        .search-box {
            width: 400px;
        }
        .card {
            display: flex;
            flex-wrap: wrap;
            .add-box {
                position: relative;
                height: 200px;
                width: 350px;
                border: 2px dashed #979ba5;
                &:hover {
                    cursor: pointer;
                }
                .text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: x-large;
                    font-weight: 800;
                }
            }
        }
    }
}
.option-box {
    display: flex;
    justify-content: space-around;
    .type {
        padding: 20px;
        border: 1px solid rgb(95, 187, 253);
        width: 200px;
        &:hover {
            cursor: pointer;
        }
        .name {
            font-size: x-large;
            font-weight: 800;
            text-align: center;
        }
        .detail {
            margin-left: 20px;
        }
    }
}
</style>
