<template>
    <div class="select-container">
        <bk-form-item
            class="custom-select-widget"
            :label="option.name"
            :required="option.required"
            :property="option.key">
            <bk-select :clearable="false" @change="handleChangeValue" v-model="value">
                <bk-option
                    v-for="option in list"
                    :key="option.id"
                    :id="option.id"
                    :name="option.name">
                </bk-option>
            </bk-select>
        </bk-form-item>
        <span class="desc">{{ option.desc }}</span>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Inject, Prop } from 'vue-property-decorator'

    @Component({
        name: 'custom-select'
    })
    export default class CustomSelect extends Vue {
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
        value: string = ''
        list: Array<{
            id: string,
            name: string
        }> = [
            {
                id: 'true',
                name: '是'
            },
            {
                id: 'false',
                name: '否'
            }
        ]
        mounted() {
            this.value = this.option.default === false ? 'false' : 'true'
        }
        handleChangeValue(value) {
            this.formModel[this.option.key] = value === 'true'
        }
    }
</script>

<style scoped lang="scss">
.select-container {
    display: flex;
    margin-bottom: 15px;
    .custom-select-widget {
        width: 500px;
        /deep/.bk-label {
            width: 150px !important;
        }
        /deep/.bk-form-content {
            margin-left: 150px !important;
        }
    }
    .desc {
        font-size: 12px;
        color: #9d9d9d;
        margin-left: 10px;
        flex: 1;
        height: 32px;
        display: flex;
        align-items: center;
    }
}

</style>
