<template>
    <div class="intention-detail">
        <bk-card title="in_goodbye" :is-edit="true" :show-foot="true" class="card-outer">
            <bk-card :show-head="true">
                <div slot="header" class="header-main">
                    <div class="title">意图样例</div>
                    <bk-button :theme="'primary'" @click="onSave">保存</bk-button>
                </div>
                <div class="elements">
                    <rich-text
                        :tiny-value="intentionValue"
                        @tinymceinput="getTinymceInput"
                        ref="intentionText"
                        @updateShow="updateShow"
                        type="intention">
                    </rich-text>
                    <bk-dialog v-model="isShow" title="添加实体"
                        :header-position="'left'"
                        :width="300"
                        :close-icon="false"
                        :show-mask="true"
                        @confirm="confirmAddEntity"
                        @cancel="cancelAddEntity">
                        <bk-input :placeholder="'请输入'" v-model="entityValue"></bk-input>
                    </bk-dialog>
                </div>
            </bk-card>
            <div class="operate-btns">
                <bk-button class="btn" :theme="'primary'" @click="editMany">批量编辑</bk-button>
                <bk-popconfirm trigger="click" width="288" @confirm="deleteMany">
                    <div slot="content">
                        <div style="display: flex; align-items: center;">
                            <div>
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
                                    <title>shi-bai-tian-chong</title>
                                    <path fill="#f43b2c" d="M16 2.667c7.363 0 13.333 5.97 13.333 13.333s-5.97 13.333-13.333 13.333c-7.365 0-13.333-5.97-13.333-13.333s5.968-13.333 13.333-13.333zM19.771 10.343l-3.771 3.772-3.772-3.772-1.886 1.886 3.772 3.772-3.772 3.771 1.886 1.886 3.772-3.771 3.771 3.771 1.886-1.886-3.771-3.771 3.771-3.772-1.886-1.886z"></path>
                                </svg>
                            </div>
                            <div class="content-text" style="margin-left: 5px;">你确定要删除这个样例吗？</div>
                        </div>
                    </div>
                    <bk-button class="btn">批量删除</bk-button>
                </bk-popconfirm>
            </div>
            <div class="sentences-list">
                <ul>
                    <li v-for="(item) in sentences" :key="item.id">
                        <div class="sentence-left">
                            <label>
                                <input type="checkbox" v-model="item.selected" />
                                <!-- <span>{{ item.content }}</span> -->
                                <div style="display: inline-block;" v-html="item.content"></div>
                                <!-- <div v-html="'<p>22222222</p>'"></div> -->
                                <!-- <input
                                    type="text"
                                    v-show="item.isEdit"
                                    :value="item.content"
                                    @blur="handleBlur(item,$event)"
                                    ref="input"
                                > -->
                            </label>
                        </div>
                        <div class="sentence-right">
                            <bk-popconfirm trigger="click" width="288" @confirm="deleteSentence(item.id)">
                                <div slot="content">
                                    <div style="display: flex; align-items: center;">
                                        <div class="delete-icon">
                                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
                                                <title>shi-bai-tian-chong</title>
                                                <path fill="#f43b2c" d="M16 2.667c7.363 0 13.333 5.97 13.333 13.333s-5.97 13.333-13.333 13.333c-7.365 0-13.333-5.97-13.333-13.333s5.968-13.333 13.333-13.333zM19.771 10.343l-3.771 3.772-3.772-3.772-1.886 1.886 3.772 3.772-3.772 3.771 1.886 1.886 3.772-3.771 3.771 3.771 1.886-1.886-3.771-3.771 3.771-3.772-1.886-1.886z"></path>
                                            </svg>
                                        </div>
                                        <div class="content-text" style="margin-left: 5px;">你确定要删除这个样例吗？</div>
                                    </div>
                                </div>
                                <span class="cw-icon weops-delete btn btn-delete"></span>
                            </bk-popconfirm>
                            <span class="cw-icon weops-edit  btn btn-edit" @click="handleEdit(item)"></span>
                        </div>
                    </li>
                </ul>
            </div>
            <div slot="footer">
                <bk-pagination
                    v-if="sentences.length"
                    :current.sync="defaultPaging.current"
                    :count.sync="defaultPaging.count"
                    :limit="defaultPaging.limit"
                    :show-limit="false"
                    :align="'right'">
                </bk-pagination>
            </div>
        </bk-card>
    </div>
</template>

<script lang="ts">
    import {Vue, Component} from 'vue-property-decorator'
    import RichText from '../components/richText.vue'
    import {v4 as uuidv4} from 'uuid'
    @Component({
        components: {RichText}
    })

    export default class IntentionDetail extends Vue {
        data: 1
        // 多行文本输入
        intentionValue = ''
        // 编辑的样例
        editingId: string[] = []
        // 意图数据分页
        defaultPaging = {
            current: 1,
            limit: 10,
            count: 30
        }
        // sentences: any = [
        //     {id: '001', content: '1111111111', selected: false, isEdit: false},
        //     {id: '002', content: '<button>11111</button>', selected: false, isEdit: false}
        // ]
        sentences: any = []
        isShow: boolean = false // 实体弹窗是否显示
        entityValue: string = ''

        updateShow(value) {
            this.isShow = value
        }
        confirmAddEntity() {
            this.$refs.intentionText.addEntity(this.entityValue)
            this.entityValue = ''
        }
        cancelAddEntity() {
            this.entityValue = ''
        }

        onSave() {
            console.log('dddd`````', this.intentionValue)

            // 去除掉<p>&nbsp;</p>
            this.intentionValue = this.intentionValue.replace(/<p>&nbsp;<\/p>/g, '')

            // 创建 DOMParser 对象
            const parser = new DOMParser()

            // 使用 DOMParser 解析 HTML 字符串
            const doc = parser.parseFromString(this.intentionValue, 'text/html')

            // 选择所有的 <p> 标签
            const paragraphs = doc.querySelectorAll('p')
            // 编辑器中的内容组成的数组
            const arr = Array.from(paragraphs, p => ({content: p.outerHTML, id: p.id}))
            console.log('arr', arr)
            arr.forEach((item) => {
                const sentence = {
                    id: item.id || uuidv4(),
                    content: item.content
                }
                const index = this.sentences.findIndex(i => {
                    return i.id === sentence.id
                })
                if (index !== -1) {
                    this.$set(this.sentences, index, sentence)
                } else {
                    this.sentences.push(sentence)
                }
            })
            console.log('onsave', this.sentences)

            this.sentences = this.sentences.map(item => ({
                selected: false,
                isEdit: false,
                ...item
            }))
            // 清空输入框
            this.intentionValue = ''
        }
        getTinymceInput(val) {
            this.intentionValue = val
        }
        // 编辑sentence对象
        handleEdit(sentence) {
            // 加入编辑列表
            this.editingId.push(sentence.id)
            this.intentionValue = sentence.content.replace(/<p>/, `<p id="${sentence.id}">`)

            if (Object.prototype.hasOwnProperty.call(sentence, 'isEdit')) {
                sentence.isEdit = true
            } else {
                this.$set(sentence, 'isEdit', true)
            }
        }
        // 删除句子
        deleteSentence(id: string) {
            this.sentences = this.sentences.filter(item => item.id !== id)
        }
        // 批量删除
        deleteMany() {
            this.sentences = this.sentences.filter(item => !item.selected)
        }
        // 批量编辑
        editMany() {
            const arr = this.sentences.filter(item => item.selected)
            for (let i = 0; i < arr.length; i++) {
                this.intentionValue += arr[i].content.replace(/<p>/, `<p id="${arr[i].id}">`)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .intention-detail {
        width: 67%;
        .card-outer {
            position: relative;
            /deep/.bk-card-foot {
                border-top: 0;
            }
            .bk-pagination {
                position: absolute;
                bottom: 30px;
                right: 16px;
            }
            /deep/span.title {
                font-size: 18px;
                font-weight: 800;
                color: rgb(95, 187, 253);
            }
            /deep/.card-edit i {
                color: rgb(95, 187, 253);
                /* margin-left: 2px; */
            }
        }
        .header-main {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .title {
                font-size: 16px;
                font-weight: 600;
            }
        }
        .operate-btns {
            margin-top: 10px;
            display: flex;
            flex-direction: row-reverse;
            .btn {
                margin-left: 10px;
            }
        }
        .sentences-list {
            li {
                height: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                &:hover {
                    background-color: #ddd;
                    .btn {
                        display: block !important;
                    }
                }
                .sentence-left {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    text-align: center;
                }
                .sentence-right {
                    flex: 1;
                    display: flex;
                    flex-direction: row-reverse;
                    align-items: center;
                    .btn {
                        display: none;
                        color: rgb(95, 187, 253);
                        margin-right: 10px;
                    }
                    .btn-delete {
                        position: relative;
                        bottom: 2px;
                    }
                }
            }
        }
    }
</style>
