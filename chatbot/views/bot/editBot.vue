<template>
    <div class="introduction">
        <div class="container" v-if="!bot.editIntroStatus">
            <h3 v-if="type === 'name'">{{ bot.name }}</h3>
            <span v-else>{{ bot.introduction }}</span>
            <bk-icon class="edit-icon" type="edit2" @click="handleEdit(bot)" />
        </div>
        <div class="input-box" v-else>
            <bk-input
                :clearable="true"
                :show-word-limit="true"
                :right-icon="'bk-icon'"
                style="width: 200px;"
                v-model="bot.editIntro"
            >
            </bk-input>
            <div class="icon-right">
                <bk-icon class="check-icon" type="check-1" @click="confirmIntroEdit(bot)" />
                <bk-icon class="close-icon" type="close" @click="cancelIntroEdit(bot)" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator'
    @Component({})
    export default class EditBot extends Vue {
        @Prop({
            type: Object,
            default: () => ({})
        })
        bot: any
        @Prop({
            type: String,
            default: 'name'
        })
        type: string
    }
</script>

<style lang="scss">
    .introduction {
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
</style>
