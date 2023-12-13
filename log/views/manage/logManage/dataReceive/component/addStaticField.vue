<template>
    <bk-dialog
        v-model="isShow"
        theme="primary"
        :width="600"
        :mask-close="false"
        header-position="left"
        title="添加静态字段"
        @after-leave="closeDialog"
    >
        <div v-bkloading="{ isLoading: loading, zIndex: 10 }">
            <div class="mb20">
                定义一个静态字段,该字段会加入到每个接收到的日志中,如果日志中包含该字段,将会被覆盖,字段只允许出现小写字母,下划线.
            </div>
            <bk-form
                :label-width="70"
                :model="formData"
                :rules="rules"
                ref="validatePsdForm">
                <bk-form-item
                    label="字段名"
                    :required="true"
                    :property="'key'"
                    error-display-type="normal">
                    <bk-input
                        :clearable="true"
                        v-model="formData.key"
                        placeholder="请输入字段名">
                    </bk-input>
                </bk-form-item>
                <bk-form-item
                    label="字段值"
                    :required="true"
                    :property="'value'"
                    error-display-type="normal">
                    <bk-input
                        :clearable="true"
                        v-model="formData.value"
                        placeholder="请输入字段值">
                    </bk-input>
                </bk-form-item>
            </bk-form>
        </div>
        <template slot="footer">
            <bk-button :disabled="loading" :theme="'primary'" :title="'确认'" class="mr10" @click="confirmReset">
                确认
            </bk-button>
            <bk-button :theme="'default'" type="submit" :title="'取消'" @click="close">
                取消
            </bk-button>
        </template>
    </bk-dialog>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    @Component({
        name: 'add-static-field'
    })
    export default class AddStaticField extends Vue {
        isShow: boolean = false
        loading: boolean = false
        formData = {
            key: '',
            value: ''
        }
        rules = {
            key: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                },
                {
                    regex: /^[a-z_]+$/,
                    message: '字段名只允许出现小写字母,下划线',
                    trigger: 'blur'
                }
            ],
            value: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ]
        }
        receiverDetail: any = {}
        show(data) {
            this.isShow = true
            this.receiverDetail = data
        }
        confirmReset() {
            const validatePsdForm: any = this.$refs.validatePsdForm
            validatePsdForm.validate().then(validator => {
                this.loading = true
                this.$api.logManage.addStaticFields(
                    {
                        id: this.receiverDetail.id,
                        body: {
                            key: this.formData.key,
                            value: this.formData.value
                        }
                    }
                ).then(res => {
                    if (!res.result) {
                        this.$error(res.message)
                        return false
                    }
                    this.$success(`添加静态字段 ${this.formData.key} 到 ${this.receiverDetail.title} 成功`)
                    this.$emit('update-list')
                    this.close()
                }).finally(() => {
                    this.loading = false
                    this.close()
                })
            })
        }
        close() {
            this.isShow = false
        }
        closeDialog() {
            Object.assign(this.$data, this.$options.data.call(this))
        }
    }
</script>
