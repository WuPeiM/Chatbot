<template>
    <div class="mt20">
        <!-- 折线图仅有的配置警戒线 -->
        <bk-form-item
            label="警戒线">
            <div style="display: flex;">
                <bk-select
                    :clearable="false"
                    v-model="formData.threshold_compare"
                    style="flex: 1;">
                    <bk-option
                        v-for="option in compareList"
                        :key="option.id"
                        :id="option.id"
                        :name="option.name">
                    </bk-option>
                </bk-select>
                <bk-input
                    :min="0"
                    type="number"
                    v-model="formData.threshold_value"
                    style="width: 70%;"
                    :clearable="true">
                </bk-input>
                <span class="unit-span">{{ unit }}</span>
            </div>
        </bk-form-item>
        <!--  折线图的配置添加表格列展示、填充面积 -->
        <bk-form-item
            label="填充面积"
            :property="'column'">
            <bk-switcher
                show-text
                on-text="开启"
                off-text="关闭"
                v-model="formData.open_area">
            </bk-switcher>
        </bk-form-item>
        <bk-form-item
            label="表格展示"
            :property="'column'">
            <bk-select
                multiple
                display-tag
                v-model="formData.column"
                style="width: 100%;">
                <bk-option
                    v-for="option in columnOptions"
                    :key="option.id"
                    :id="option.id"
                    :name="option.name">
                </bk-option>
            </bk-select>
        </bk-form-item>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator'
    import { COMPARE_LIST, COLUMN_OPTIONS } from '../../views'
    interface Option {
        name: string,
        id: string | number
    }
    @Component({
        components: {}
    })
    export default class LineOption extends Vue {
        @Prop({ type: String }) unit: string
        @Prop({ type: Object }) formData: any
        compareList: Array<Option> = COMPARE_LIST
        columnOptions: Array<Option> = COLUMN_OPTIONS
    }
</script>
