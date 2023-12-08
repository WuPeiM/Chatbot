<template>
    <div class="story-edit">
        <div class="breadcrumb">
            <bk-breadcrumb :separator="'/'">
                <bk-breadcrumb-item :to="{ path: '/chatbot/story' }"
                    :class="[$route.name === 'Story' ? 'ing' : '']">故事列表</bk-breadcrumb-item>
                <bk-breadcrumb-item :to="{ path: '/chatbot/story/detail' }"
                    :class="[$route.name === 'StoryDetail' ? 'ing' : '']">故事编辑</bk-breadcrumb-item>
            </bk-breadcrumb>
        </div>
        <!-- <div class="story-box">
            故事详情
        </div> -->
        <div class="container">
            <div class="container-head border-style">
                <div class="message">
                    <span class="cw-icon weops-index-manage"></span>
                    <div style="display: inline-block;" v-if="!isEdit">
                        <span class="name">{{ name }}</span>
                        <span class="cw-icon weops-edit" @click="handleEdit"></span>
                    </div>
                    <div class="edit-box" v-else>
                        <bk-input v-model="name" placeholder="" size="small" clearable @blur="handleBlur"></bk-input>
                        <div class="icon-right">
                            <bk-icon class="check-icon" type="check-1" @click="confirmNameEdit(id)" />
                            <bk-icon class="close-icon" type="close" @click="cancelNameEdit()" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="container-main">
                <div class="container-left border-style">
                    <ul>
                        <li class="li-item">
                            <div class="story-item">
                                <span class="cw-icon weops-other-capital" draggable="true"></span>
                                <div>意图</div>
                            </div>
                        </li>
                        <li class="li-item">
                            <div class="story-item">
                                <span class="cw-icon weops-reception"></span>
                                <div>意图</div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="container-middle">
                    <bk-button
                        theme="primary"
                        :outline="true"
                        @click="deleteNode"
                        ref="deleteBtn"
                        v-if="showContext"
                        :style="{ top: menuPosition.y + 'px', left: menuPosition.x + 'px' }"
                        class="context-menu">
                        删除节点
                    </bk-button>
                    <div ref="topoRef"></div>
                </div>
                <div class="container-right border-style" :class="{ 'is-open': !!selectedItem } ">
                    <div class="select-title">选择意图</div>
                    <bk-input
                        v-model="searchName"
                        :right-icon="'bk-icon icon-search'"
                        size="small"
                        @right-icon-click="handlerIconClick"
                        @enter="handlerIconClick">
                    </bk-input>
                    <ul>
                        <li v-for="(item) in intentionList" :key="item.id" class="data-list">
                            <div class="name">{{ item.name }}</div>
                            <div class="add-btn">
                                <bk-button theme="primary" size="normal" @click="handleAdd">添加</bk-button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- <div id="mountNode"></div> -->
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { bkBreadcrumb, bkBreadcrumbItem } from 'bk-magic-vue'
    import G6 from '@antv/g6'

@Component({
    components: {
        bkBreadcrumb,
        bkBreadcrumbItem
    }
})

export default class Intention extends Vue {
    name: string = '这是一个故事'
    isEdit: boolean = false
    searchName: string = ''
    intentionList = [
        {id: '001', name: 'Hello', count: 8, selected: false},
        {id: '002', name: 'Hello2', count: 8, selected: false},
        {id: '003', name: 'Hel', count: 18, selected: false},
        {id: '004', name: 'Hello3', count: 18, selected: false}
    ]
    data = {
        // 点集
        nodes: [
            {
                id: 'node1', // String，该节点存在则必须，节点的唯一标识
                x: 100, // Number，可选，节点位置的 x 值
                y: 200 // Number，可选，节点位置的 y 值
            },
            {
                id: 'node2', // String，该节点存在则必须，节点的唯一标识
                x: 300, // Number，可选，节点位置的 x 值
                y: 200 // Number，可选，节点位置的 y 值
            }
        ],
        // 边集
        edges: [
            {
                source: 'node1', // String，必须，起始点 id
                target: 'node2' // String，必须，目标点 id
            }
        ]
    }
    selectedItem = null
    graph: any = null
    // 右键菜单是否显示
    showContext: boolean = false
    menuPosition = {
        x: 0,
        y: 0
    }
    get aa() {
        console.log('aaaa', this.selectedItem)
        return this.selectedItem
    }
    mounted() {
        this.createG6()
        document.addEventListener('mousedown', (e) => {
            // 如果点击的不是菜单，则隐藏菜单
            if (!e.target.classList.contains('context-menu')) {
                this.hideContextMenu()
            }
        })
    }
    handleEdit() {
        this.isEdit = true
    }
    // handleBlur() {
    //     this.isEdit = false
    // }
    createG6() {
        const grid = new G6.Grid()
        this.graph = new G6.Graph({
            plugins: [grid],
            container: this.$refs['topoRef'], // 指定图画布的容器 id
            // 画布宽高
            width: 800,
            height: 500,
            modes: {
                default: ['drag-canvas', 'zoom-canvas', 'drag-node'] // 允许拖拽画布、放缩画布、拖拽节点、设置高亮
            }
        })
        // this.graph.data(this.data)
        this.graph.read(this.data)
        // 渲染图
        this.graph.render()

        // 监听节点点击事件
        this.graph.on('node:click', (evt) => {
            console.log('evt', evt)
            const { item } = evt
            this.selectedItem = item // 将选中的节点存储到组件的数据属性中
        })

        // 监听节点的右键点击事件
        this.graph.on('node:contextmenu', (evt) => {
            evt.preventDefault() // 阻止默认的浏览器右键菜单
            const { item } = evt
            console.log(item, evt)
            // 显示自定义的右键菜单
            // 这里可以调用一个方法来显示菜单，并传递必要的参数，比如节点实例和位置信息
            this.showContextMenu(evt, item)
        })
    }
    handlerIconClick() {
        console.log('搜索', this.searchName)
    }
    handleAdd() {
        console.log('添加')
    }
    deleteNode() {
        if (this.selectedItem) {
            this.graph.removeItem(this.selectedItem)
            this.selectedItem = null // 清除选中状态
            this.hideContextMenu()
        }
    }
    // 显示右键删除按钮的方法
    showContextMenu(evt, item) {
        // 获取画布DOM元素的bounding box
        const { left, top } = this.$refs.topoRef.getBoundingClientRect()
        console.log(left, top)
        // 计算菜单的准确位置
        this.menuPosition = {
            x: evt.clientX - left + window.scrollX,
            y: evt.clientY - top + window.scrollY
        }
        // this.menuPosition = { x: evt.clientX, y: evt.clientY }
        this.selectedItem = item
        this.showContext = true
    }
    // 右键删除按钮隐藏方法
    hideContextMenu() {
        this.showContext = false
    }
}
</script>

<style  lang="scss" scoped>
.story-edit {
    .breadcrumb {
        position: relative;
        height: 40px;
        background-color: #fff;
        padding-left: 20px;
        margin-bottom: 10px;

        .bk-breadcrumb {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);

            /deep/.ing {
                .bk-breadcrumb-item-inner {
                    color: #699df4;
                }
            }
        }
    }

    .container {
        background-color: #fff;
        .border-style {
            border: 1px solid #ddd;
            border-radius: 2px;
        }
        .container-head {
            position: relative;
            height: 80px;
            padding-left: 20px;
            .message {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                .cw-icon {
                    font-size: x-large;
                }
                .weops-edit {
                    cursor: pointer;
                }
                .name {
                    margin: 0 10px;
                    font-size: x-large;
                    font-weight: 800;
                    color: #000;
                }
                .edit-box {
                    display: flex;
                }
            }
        }
        .container-main {
            display: flex;
            .container-left {
                border-top: none;
                width: 200px;
                height: 500px;
                .cw-icon {
                    font-size: xx-large;
                    color: #699df4;
                }
                .li-item {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100px;
                    .story-item {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        width: 60px;
                        height: 80px;
                        border: 1px solid #ddd;
                        border-radius: 10px;
                    }
                }
            }
            .container-middle {
                border-bottom: 1px solid #ddd;
                width: 100%;
            }
            .is-open {
                width: 500px;
                display: block;
            }
            .container-right {
                display: none;
                border-top: none;
                width: 0;
                height: 500px;
                padding: 10px;
                .select-title {
                    margin-bottom: 10px;
                    &::before {
                        content: " ";
                        margin-right: 6px;
                        width: 3px;
                        height: 12px;
                        display: inline-block;
                        background: #1272FF;
                    }
                }
                .data-list {
                    display: flex;
                    // justify-content: space-around;
                    align-items: center;
                    margin: 10px 20px 0 20px;
                    .name {
                        flex: 1;
                    }
                }
            }
        }
    }
}</style>
