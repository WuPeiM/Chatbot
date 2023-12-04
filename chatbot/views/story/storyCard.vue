<template>
    <div class="card-box">
        <bk-card :show-foot="true" :show-head="false">
            <div style="display: flex;">
                <div class="icon">
                    <span class="cw-icon weops-data-screen"></span>
                </div>
                <div class="dec">
                    <div class="title-box" style="height: 30px;">
                        <div class="title" v-if="!isEdit">
                            <span style="font-size: 16px; font-weight: 800;">{{ name }}</span>
                            <bk-icon class="edit-icon" type="edit2" @click="handleNameEdit" />
                        </div>
                        <div class="input-box" v-else>
                            <bk-input
                                :clearable="true"
                                :show-word-limit="true"
                                :right-icon="'bk-icon'"
                                style="width: 200px;"
                                v-model="title"
                            >
                            </bk-input>
                            <div class="icon-right">
                                <bk-icon class="check-icon" type="check-1" @click="confirmNameEdit(id)" />
                                <bk-icon class="close-icon" type="close" @click="cancelNameEdit()" />
                            </div>
                        </div>
                    </div>
                    <div class="type">{{ type === 0 ? '规则类' : '故事类' }}</div>
                    <div class="detail">
                        <div class="container">
                            <div class="name">意图</div>
                            <div class="count">{{ intention }}个</div>
                        </div>
                        <div class="container">
                            <div class="name">响应</div>
                            <div class="count">{{ response }}个</div>
                        </div>
                    </div>
                    <!-- <p>意图： {{ intention }}</p>
                    <p>回应： {{ response }}</p> -->
                </div>
            </div>
            <div slot="footer" class="foot-main">
                <span @click="handleDelete()">删除</span>
                <span>编辑</span>
            </div>
        </bk-card>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
    components: {}
})

export default class Intention extends Vue {
    @Prop({
        type: String,
        default: ''
    })
    id: string
    @Prop({
        type: String,
        default: ''
    })
    name: string
    @Prop({
        type: Number,
        default: 0
    })
    type: number
    @Prop({
        type: Number,
        default: 0
    })
    intention: number
    @Prop({
        type: Number,
        default: 0
    })
    response: number

    isEdit: boolean = false
    title: string = ''

    created() {
        this.title = this.name
    }

    handleNameEdit() {
        // this.$emit('updateName', this.title)
        this.isEdit = true
    }
    confirmNameEdit(id) {
        this.$emit('updateName', this.title, id)
        this.isEdit = false
    }
    cancelNameEdit() {
        this.isEdit = false
    }
    handleDelete() {
        this.$bkInfo({
            subTitle: '你确定要删除这个故事吗？',
            theme: 'primary',
            confirmFn: async() => {
                this.$emit('maskLoad', true)
                this.$emit('deleteStory', this.id)
                // await this.$api.bot.deleteBot(id + '')
                // this.getBotCards()
            }
        })
    }
}
</script>

<style  lang="scss" scoped>
    .card-box {
        width: 350px;
        height: 200px;
        display: inline-block;
        float: left;
        margin: 0 20px 24px 0;
        .icon {
            margin-right: 20px;
        }

        .title {
            .edit-icon {
                visibility: hidden;
                font-size: 20px !important;
                color: #5fbbfd;
            }
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
        .dec {
            .type {
                color: rgb(95, 187, 253);
                margin-bottom: 20px;
            }
            .detail {
                .container {
                    display: inline-block;
                    margin-right: 100px;
                    .name {
                        color: #979ba5;
                        margin-bottom: 10px;
                    }
                    .count {
                        font-weight: 800;
                        font-size: larger;
                    }
                }
            }
        }
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
            font-size: 16px;
        }
        span:hover {
            background-color: #EDEFF3;
            cursor: pointer;
        }
    }
</style>
