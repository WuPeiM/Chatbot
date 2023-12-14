<template>
    <div class="list-container">
        <bk-form-item
            class="custom-list-widget"
            :label="option.name"
            :required="option.required"
            :property="option.key">
            <div
                :key="isRefresh"
                class="list-contains"
                v-if="formModel[option.key] && formModel[option.key].length">
                <div class="row" v-for="(item, index) in formModel[option.key]" :key="index">
                    <bk-input v-if="typeIsNumber" type="number" v-model.number="formModel[option.key][index]" />
                    <bk-input v-else v-model="formModel[option.key][index]" />
                    <bk-icon type="plus-circle" @click="handleAdd" />
                    <bk-icon
                        :class="{ 'disabled': formModel[option.key].length === 1 && index === 0 }"
                        @click="handleReduce(index)"
                        type="minus-circle" />
                </div>
            </div>
        </bk-form-item>
        <span class="desc">{{ option.desc }}</span>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Inject, Prop } from 'vue-property-decorator'

    @Component({
        name: 'custom-list'
    })
    export default class CustomList extends Vue {
        @Inject() formModel: any
        @Prop({
            type: Object,
            default: () => ({
                name: '',
                required: false,
                property: ''
            })
        })
        option: any
        isRefresh: boolean = false

        get typeIsNumber() {
            return this.option.type === 'list.int'
        }
        created() {
            this.formModel[this.option.key] = JSON.parse(JSON.stringify(this.option.default || ['']))
        }

        handleAdd() {
            this.formModel[this.option.key].push('')
            this.isRefresh = !this.isRefresh
        }

        handleReduce(index) {
            if (this.formModel[this.option.key].length === 1 && index === 0) {
                return false
            }
            this.formModel[this.option.key].splice(index, 1)
            this.isRefresh = !this.isRefresh
        }
    }
</script>

<style scoped lang="scss">
.list-container {
    display: flex;
    align-items: top;
    margin-bottom: 15px;
    .custom-list-widget {
        width: 550px;
        /deep/.bk-label {
            width: 150px !important;
        }
        /deep/.bk-form-content {
            margin-left: 150px !important;
        }
        .list-contains {
            .row {
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                .input {
                    width: 350px;
                }
                .bk-icon {
                    font-size: 16px !important;
                    margin-left: 10px;
                    color: #abadb2;
                    cursor: pointer;
                    &.disabled {
                        color: #dddde0;
                        cursor: not-allowed;
                    }
                }
            }
        }
    }
    .desc {
        font-size: 12px;
        color: #9d9d9d;
        margin-left: 10px;
        margin-top: 7px;
        flex: 1;
    }
}
</style>
