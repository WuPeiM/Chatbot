<template>
    <div class="mt20">
        <bk-form-item
            required
            label="运维工具"
            property="tool_value"
            :error-display-type="'normal'">
            <div style="display: flex;">
                <bk-select
                    multiple
                    display-tag
                    searchable
                    :loading="loading"
                    :clearable="false"
                    v-model="toolVal"
                    style="flex: 1; width: 100%;"
                    @selected="handleChangeTool">
                    <bk-option
                        v-for="option in toolList"
                        :key="option.id"
                        :id="option.id"
                        :name="option.tool_name">
                    </bk-option>
                </bk-select>
            </div>
        </bk-form-item>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop, Inject } from 'vue-property-decorator'
    import { ViewForm, ToolInfo } from '../../types/index'

    @Component({
        components: {}
    })
    export default class ToolOption extends Vue {
        @Inject() getToolList: Function
        @Prop() formData: ViewForm
        @Prop({ type: Object }) rules: any
        toolVal: Array<string | Number> = []
        toolList: Array<ToolInfo> = []
        loading: boolean = false

        created() {
            this.initCompFormItem()
            this.initCompFormRule()
        }
        mounted() {
            this.initToolList()
        }
        async initToolList() {
            if (!(this.getToolList instanceof Function)) return
            this.loading = true
            this.toolList = await this.getToolList()
            const idsList: any = this.formData.tool_value.map(el => el.id)
            // 过滤当前用户的工具列表中不存在的工具，如无权限的工具
            this.toolVal = idsList.filter(id => this.toolList.find(item => item.id === id))
            this.loading = false
        }
        initCompFormItem() {
            const INIT_FORM = {
                tool_value: []
            }
            Object.entries(INIT_FORM).forEach(({ 0: key, 1: value }) => {
                if (!this.formData.hasOwnProperty(key)) {
                    this.$set(this.formData, key, value)
                }
            })
        }
        initCompFormRule() {
            const that = this
            const formOptions: Array<{
                key: string,
                tip: string
            }> = [{ key: 'tool_value', tip: '请选择运维工具' }]
            formOptions.forEach(option => {
                this.rules[option.key] = [
                    {
                        required: true,
                        message: option.tip,
                        trigger: 'blur',
                        validator: function() {
                            return that.toolVal?.length
                        }
                    }
                ]
            })
        }
        handleChangeTool(tool: Array<string | Number>) {
            this.formData.tool_value = this.toolList.filter(el => tool.includes(el.id))
        }
    }
</script>
