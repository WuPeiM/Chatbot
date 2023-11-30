<template>
    <div class="container-box">
        <div class="search-add">
            <bk-input
                class="search"
                :clearable="false"
                :placeholder="'请输入关键词进行搜索'"
                :right-icon="'bk-icon icon-search'"
                v-model="searchName"
                @right-icon-click="handlerIconClick"
                @enter="handlerIconClick">
            </bk-input>
            <bk-popconfirm trigger="click" ext-popover-cls="popover-operate" width="288" @confirm="addIntention" @cancel="cancelAdd" ref="addPopconfirm">
                <div slot="content">
                    <div>
                        <div class="title">新增响应</div>
                        <div class="input-intention">
                            <bk-form :label-width="0" :model="addFormData" :rules="addRules" ref="addForm">
                                <bk-form-item
                                    :required="true"
                                    :property="'name'"
                                    :error-display-type="'normal'">
                                    <bk-input v-model="addFormData.name" placeholder=""></bk-input>
                                    <p class="mt5 mb0 f12" slot="tip" style="color: rgb(95, 187, 253);">意图以英文命名，以"utter_"字符开头</p>
                                </bk-form-item>
                                <div style="display: flex; flex-direction: row-reverse;">
                                    <bk-button size="small" theme="primary" @click.stop.prevent="addIntention">确定</bk-button>
                                    <bk-button size="small" ext-cls="mr5" theme="default" @click.stop.prevent="cancelAdd">取消</bk-button>
                                </div>
                            </bk-form>
                            <!-- <bk-input :clearable="true" v-model="newIntention" :show-clear-only-hover="true" :placeholder="''"></bk-input>
                                    <div class="tip" style="color: rgb(95, 187, 253);">意图以英文命名，以"_"字符连接</div> -->
                        </div>
                    </div>
                </div>
                <bk-button :theme="'primary'" class="btn">+</bk-button>
            </bk-popconfirm>
        </div>
        <div class="list">
            <div class="list-item" v-for="(item) in intentionData" :key="item.id" :class="{ 'selected': item.selected }" @click="selectItem(item)">
                <div class="name">{{ item.name }}</div>
                <div class="count">{{ item.count }}</div>
                <div class="delete">
                    <bk-popconfirm trigger="click" width="288" @confirm="deleteIntention(item.id)">
                        <div slot="content">
                            <div style="display: flex; align-items: center;">
                                <div>
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
                                        <title>shi-bai-tian-chong</title>
                                        <path fill="#f43b2c" d="M16 2.667c7.363 0 13.333 5.97 13.333 13.333s-5.97 13.333-13.333 13.333c-7.365 0-13.333-5.97-13.333-13.333s5.968-13.333 13.333-13.333zM19.771 10.343l-3.771 3.772-3.772-3.772-1.886 1.886 3.772 3.772-3.772 3.771 1.886 1.886 3.772-3.771 3.771 3.771 1.886-1.886-3.771-3.771 3.771-3.772-1.886-1.886z"></path>
                                    </svg>
                                </div>
                                <div class="content-text" style="margin-left: 5px;">你确定要删除这个意图吗？</div>
                            </div>
                        </div>
                        <bk-icon type="delete" />
                    </bk-popconfirm>
                </div>

            </div>
            <bk-pagination
                :current.sync="defaultPaging.current"
                :count.sync="defaultPaging.count"
                :limit="defaultPaging.limit"
                :show-limit="false"
                :align="'right'"
                class="bk-pagination">
            </bk-pagination>
        </div>
    </div>
</template>

<script lang="ts">
    import {Vue, Component} from 'vue-property-decorator'
    @Component({
        components: {}
    })

    export default class IntentionList extends Vue {
        searchName: string = ''
        // 意图数据
        intentionData: {id: string, name: string, count: number, selected: boolean}[] = [
            {id: '001', name: 'utter_Hello', count: 8, selected: false},
            {id: '002', name: 'utter_Hello2', count: 8, selected: false},
            {id: '003', name: 'utter_Hello3', count: 18, selected: false},
            {id: '004', name: 'utter_Hello3', count: 18, selected: false}
        ]
        addFormData = {
            name: ''
        }
        addRules = {
            name: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                },
                {
                    regex: /^utter+_[a-zA-Z]+$/,
                    message: '命名不规范',
                    trigger: 'blur'
                }
            ]
        }

        // 新增意图
        newIntention: string = ''

        // 意图数据分页
        defaultPaging = {
            current: 1,
            limit: 10,
            count: 30
        }

        // 删除意图数据
        deleteIntention(id: string) {
            this.intentionData = this.intentionData.filter(item => item.id !== id)
        }
        // 新增意图
        addIntention() {
            // @ts-ignore
            this.$refs.addForm.validate().then(validator => {
                // alert('验证成功！')
                console.log('-----------', validator)
                this.intentionData.push({id: new Date() + '', name: this.addFormData.name, count: 0})
                this.addFormData.name = ''
                console.log('222222222', this.$refs)
                // this.$refs.addPopconfirm.hideHandler() // 这里是undefined
                // @ts-ignore
                this.$refs.addPopconfirm.$refs.popover.hideHandler()
            }, validator => {
                console.log('校验错误', validator)
            })
        }
        cancelAdd() {
            console.log('quxiao')
            this.addFormData.name = ''
            // @ts-ignore
            this.$refs.addForm.clearError()
            // @ts-ignore
            this.$refs.addPopconfirm.$refs.popover.hideHandler()
        }

        // 搜索方法
        handlerIconClick() {
            console.log('搜索', this.searchName)
        }

        selectItem(selectedItem) {
            // 取消之前选中的项
            this.intentionData.forEach(item => {
                item.selected = false
            })

            // 设置当前选中的项
            selectedItem.selected = true
        }
    }
</script>

<style lang="scss">
    .container-box {
        margin-right: 20px;
        width: 33%;
        .search-add {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            .search {
                width: 80%;
                margin-right: 10px;
            }
            .bk-button {
                border-radius: 10px;
                // min-width: 50px;
                font-size: 20px;
                font-weight: 800;
                .span {
                    margin: auto;
                }
            }
        }
        .list {
            position: relative;
            padding-top: 10px;
            background-color: $cw-color-bg-0;
            height: 400px;
            .list-item {
                display: flex;
                font-size: 14px;
                font-weight: 800;
                height: 40px;
                line-height: 40px;
                // .selected {
                //     background-color: rgb(95, 187, 253); /* 鼠标移入时设置背景色为蓝色 */
                //     color: $cw-color-bg-0;
                //     .delete {
                //         opacity: 1; /* 鼠标移入时显示删除图标 */
                //         &:hover {
                //             cursor: pointer !important;
                //         }
                //     }
                // }
                .name {
                    flex: 3;
                    margin-left: 30px;
                }
                .count {
                    flex: 1;
                    text-align: center;
                }
                .delete {
                    opacity: 0; /* 初始时隐藏删除图标 */
                    flex: 1;
                    text-align: center;
                }
            }
            .selected {
                background-color: rgb(95, 187, 253); /* 鼠标移入时设置背景色为蓝色 */
                color: $cw-color-bg-0;
                .delete {
                    opacity: 1;
                    &:hover {
                        cursor: pointer !important;
                    }
                }
            }
            .bk-pagination {
                position: absolute;
                bottom: 30px;
                right: 16px;
            }
        }
    }
</style>
