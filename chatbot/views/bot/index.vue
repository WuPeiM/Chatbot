<template>
    <div>
        <div class="head">
            <bk-input
                class="search"
                :clearable="true"
                :placeholder="'请输入机器人的名称进行搜索'"
                :right-icon="'bk-icon icon-search'"
                v-model="searchName"
                @right-icon-click="searchBot"
                @enter="searchBot">
            </bk-input>
            <bk-button class="btn" theme="primary" title="创建" icon="icon-bk" @click="handleAdd">创建机器人</bk-button>
        </div>
        <div class="add-card" @click="handleAdd">
            <div class="add">+新增机器人</div>
        </div>
        <div class="cards">
            <div class="card-demo" v-for="item in displayCards" :key="item.id">
                <bk-card :show-foot="true" :show-head="false">
                    <div class="card-content">
                        <div class="left"><img class="avatar" src="item.avatar"></div>
                        <div class="right">
                            <!-- <div style="display: flex; align-items: center;">
                                <h3>{{ item.name }}<bk-icon class="edit-icon" type="edit2" @click="handleNameEdit(item)" /></h3>
                                <edit-bot :bot="item" :type="'name'"></edit-bot>
                            </div> -->

                            <div class="name-box" style="height: 30%;">
                                <div class="container" v-if="!item.editNameStatus">
                                    <!-- <h3>{{ item.name }}<bk-icon class="edit-icon" type="edit2" @click="handleNameEdit(item)" /></h3> -->
                                    <span style="font-size: 16px; font-weight: 800;">{{ item.name }}</span>
                                    <bk-icon class="edit-icon" type="edit2" @click="handleNameEdit(item)" />
                                </div>
                                <div class="input-box" v-else>
                                    <bk-input
                                        :clearable="true"
                                        :show-word-limit="true"
                                        :right-icon="'bk-icon'"
                                        style="width: 200px;"
                                        v-model="item.editName"
                                    >
                                    </bk-input>
                                    <div class="icon-right">
                                        <bk-icon class="check-icon" type="check-1" @click="confirmNameEdit(item)" />
                                        <bk-icon class="close-icon" type="close" @click="cancelNameEdit(item)" />
                                    </div>
                                </div>
                            </div>

                            <div class="introduction" style="height: 70%;">
                                <div class="container" v-if="!item.editIntroStatus">
                                    <span>{{ item.introduction }}</span>
                                    <bk-icon class="edit-icon" type="edit2" @click="handleIntroEdit(item)" />
                                </div>
                                <div class="input-box" v-else>
                                    <bk-input
                                        :clearable="true"
                                        :show-word-limit="true"
                                        :right-icon="'bk-icon'"
                                        style="width: 200px;"
                                        v-model="item.editIntro"
                                    >
                                    </bk-input>
                                    <div class="icon-right">
                                        <bk-icon class="check-icon" type="check-1" @click="confirmIntroEdit(item)" />
                                        <bk-icon class="close-icon" type="close" @click="cancelIntroEdit(item)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div slot="footer" class="foot-main">
                        <span @click="deleteCard(item.id)">删除</span>
                        <span @click="gotoIntention(item.id)">设置</span>
                    </div>
                </bk-card>
            </div>
        </div>
        <!-- 分页 -->
        <div v-if="displayCards.length">
            <bk-pagination
                size="small"
                :current.sync="compactPaging.current"
                :count.sync="compactPaging.count"
                :limit.sync="compactPaging.limit"
                :type="compactPaging.type"
                :align="'right'"
                :limit-list="[5,6,7,8,9,10]"
                @limit-change="changePage"
                @change="changePage">
            </bk-pagination>
        </div>
        <!-- 弹窗 -->
        <div>
            <bk-dialog v-model="createBotForm.visible"
                theme="primary"
                :mask-close="false"
                :header-position="createBotForm.headerPosition"
                title="创建机器人"
                :close-icon="false"
                :show-footer="false">
                <bk-form :label-width="60" :model="formData" :rules="rules" ref="validateForm">
                    <bk-form-item
                        label="名称"
                        :required="true"
                        :property="'name'"
                        :error-display-type="'normal'">
                        <bk-input v-model="formData.name" placeholder="请输入机器人名称"></bk-input>
                    </bk-form-item>
                    <bk-form-item
                        label="简介"
                        :error-display-type="'normal'">
                        <bk-input type="textarea" v-model="formData.introduction" placeholder="请输入机器人介绍"></bk-input>
                    </bk-form-item>
                    <bk-form-item style="float: right;">
                        <bk-button style="margin-right: 3px;" title="取消" @click.stop.prevent="cancel">取消</bk-button>
                        <bk-button theme="primary" title="提交" @click.stop.prevent="confirmAdd">提交</bk-button>
                    </bk-form-item>
                </bk-form>
            </bk-dialog>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { mapState, mapActions } from 'vuex'
    import EditBot from './editBot.vue'
@Component({
    components: {
        EditBot
    },
    computed: {
        ...mapState('example', { list: 'list' })
    },
    methods: {
        ...mapActions('example', { updateList: 'updateList' })
    }
})

export default class Bot extends Vue {
    // type UserInfo {
    //     id: string;
    //     avatar: string;
    //     name: string;
    //     introduction: string;
    // }
    // 搜索
    searchName: string = ''
    searchCards: [] = []
    displayCards: any = [
        {
            'id': '001',
            'avatar': '',
            'name': '机器人',
            'introduction': '机器人机器人机器人机器人机器人机器人机器人机器人机器人机器人机器人机器人'
        },
        {
            'id': '002',
            'avatar': '',
            'name': '机器人',
            'introduction': '机器人机器人机器人'
        }
    ]
    // 卡片
    cards: {id: string; avatar: string; name: string; introduction: string;}[] = []
    // 分页
    compactPaging: {current: number, limit: number, count: number, type: 'default' | 'compact'} = {
        current: 1,
        limit: 5,
        // count: this.cards.length,
        count: 100,
        type: 'compact'
    }
    // 对话框相关
    createBotForm = {
        visible: false,
        headerPosition: 'left'
    }
    // 表单
    formData: {name: string, introduction: string} = {
        name: '',
        introduction: ''
    }
    // 规则
    rules = {
        name: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ]
    }
    editParams = {
        id: '',
        introduction: ''
    }
    // 获取机器
    async getBotCards() {
        try {
            const res = await this.$api.bot.getBot()
            console.log('res', res)
            this.cards = res.data
            this.compactPaging.count = res.data.length
            this.searchBot()
            if (this.displayCards.length === 0 && this.compactPaging.current > 1) {
                this.compactPaging.current--
                this.getBotCards()
            }
            // this.displayCards = this.cards.slice(0, this.compactPaging.limit)
        } catch (error) {
            console.log(error)
        }
    }

    created() {
        this.getBotCards()
    }

    // 点击查询
    searchBot() {
        console.log('搜索', this.searchName)
        if (this.searchName.trim()) {
            this.displayCards = this.cards.filter(item => item.name === this.searchName)
            this.compactPaging.count = this.displayCards.length
        } else {
            this.compactPaging.count = this.cards.length
            this.changePage()
        }
    }
    // 点击新增
    handleAdd() {
        this.createBotForm.visible = true
    }
    // 确认提交
    confirmAdd() {
        // @ts-ignore
        this.$refs.validateForm.validate().then(validator => {
                    console.log('验证成功！', validator)
                    console.log('this.formData.name', this.formData.name, 'this.formData.introduction', this.formData.introduction)
                    const addData = {
                        ...this.formData,
                        icon: 'FirstIcon',
                        created_User: 'enen'
                    }
                    this.$api.bot.addBot(addData).then(res => {
                        console.log('新增', res)
                        if (res.result) {
                            // @ts-ignore
                            this.$bkMessage({
                                theme: 'success',
                                message: '新增成功'
                            })
                            this.getBotCards()
                        } else {
                            // @ts-ignore
                            this.$bkMessage({
                                theme: 'error',
                                message: res.message
                            })
                        }
                    }).catch(err => {
                        // @ts-ignore
                        this.$bkMessage({
                            theme: 'error',
                            message: err
                        })
                    })
                    this.formData.name = ''
                    this.formData.introduction = ''
                    this.createBotForm.visible = false
                }, validator => {
                    // 显示第一个出错位置
                    // alert(`${validator.field}：${validator.content}`)
                    this.createBotForm.visible = true
                })
    }
    // 取消
    cancel() {
        console.log('取消')
        // 清除错误提示
        // @ts-ignore
        this.$refs.validateForm.clearError()
        this.formData.name = ''
        this.formData.introduction = ''
        this.createBotForm.visible = false
    }
    // 删除卡片
    deleteCard(id: string) {
        this.$bkInfo({
            // title: '提示',
            subTitle: '你确定要删除这个机器人吗？',
            theme: 'primary',
            confirmFn: async() => {
                this.$emit('maskLoad', true)
                await this.$api.bot.deleteBot(id + '')
                this.getBotCards()
            }
        })
    }

    // 跳转到意图页面
    gotoIntention(id: string) {
        this.$router.push({name: 'Intention', query: {id: id}})
    }
    // 分页
    changePage() {
        const {current, limit} = this.compactPaging
        if (!this.searchName.trim()) {
            this.displayCards = this.cards.slice((current - 1) * limit, current * limit)
        } else {
            this.displayCards = this.displayCards.slice((current - 1) * limit, current * limit)
        }
    }

    handleIntroEdit(item) {
        this.$set(item, 'editIntroStatus', true)
        this.$set(item, 'editIntro', item.introduction)
    }
    async confirmIntroEdit(item) {
        this.$set(item, 'editIntroStatus', false)
        console.log('确认修改，调接口')
        const params = {
            name: item.name,
            introduction: item.editIntro,
            icon: 'FirstIcon',
            created_User: 'enen'
        }
        const res = await this.$api.bot.editBot(item.id, params)
        console.log('编辑res', res)
        this.getBotCards()
        // this.displayCards.forEach(bot => {
        //     if (bot.id === item.id) {
        //         bot.introduction = item.editIntro
        //     }
        // })
    }
    cancelIntroEdit(item) {
        item.editIntroStatus = false
        console.log('关闭')
    }

    handleNameEdit(item) {
        this.$set(item, 'editNameStatus', true)
        this.$set(item, 'editName', item.name)
    }
    async confirmNameEdit(item) {
        this.$set(item, 'editNameStatus', false)
        const params = {
            name: item.editName,
            introduction: item.introduction,
            icon: 'FirstIcon',
            created_User: 'enen'
        }
        const res = await this.$api.bot.editBot(item.id, params)
        console.log('编辑res', res)
        this.getBotCards()
        // this.displayCards.forEach(bot => {
        //     if (bot.id === item.id) {
        //         bot.name = item.editName
        //     }
        // })
    }
    cancelNameEdit(item) {
        item.editNameStatus = false
        console.log('关闭')
    }
}
</script>

<style  lang="scss" scoped>
.head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    .search {
        width: 400px;
    }
    .btn {
        border-radius: 20px;
    }
}
.add-card {
    width: 30%;
    height: 191px;
    border: dashed 1px #979ba5;
    position: relative;
    display: inline-block;
    float: left;
    margin-right: 20px;
    margin-bottom: 20px;
    cursor: pointer;

    .add {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
}
.cards {

    .card-demo {
        width: 30%;
        display: inline-block;
        /* float: left; */
        margin-right: 20px;
        margin-bottom: 20px;
    }
    .foot-main {
        width: 100%;
        height: 100%;
        background: #fafbfd;
        color: #979ba5;
        span {
            display: inline-block;
            width: 50%;
            line-height: 50px;
            float: left;
            text-align: center;
            font-size: 14px;
        }
        span:hover {
            background: #f0f1f5;
            color: #63656e;
            cursor: pointer;
        }
        .bk-tooltip {
            float: left;
            width: 50%;
            .bk-tooltip-ref {
                width: 50% !important;
                text-align: center;
            }
        }
        .demo-custom {
            font-size: 14px;
            line-height: 24px;
            color: #63656e;
            padding-bottom: 10px;
            .content-icon {
                color: #ea3636;
                position: absolute;
                top: 20px;
            }
            .content-text {
                display: inline-block;
                margin-left: 20px;
            }
        }
    }
    .bk-card-body {
        p {
            margin-top: 0;
            margin-bottom: 10px;
            &:last-child {
                margin-bottom: 0;
            }
        }
    }
    .card-content {
        display: flex;
        height: 100px;
        .right {
            margin-left: 10px;

            .name-box, .introduction {
                // font-size: 16px;
                .edit-icon {
                    visibility: hidden;
                    font-size: 20px !important;
                    color: #5fbbfd;
                }
                .container {
                    &:hover {
                        .edit-icon {
                            visibility: visible;
                        }
                    }
                }
                .input-box {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    .icon-right {
                        font-size: 20px;
                        color: #5fbbfd;
                    }
                }
            }
        }
    }
    .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
    }
}

</style>
