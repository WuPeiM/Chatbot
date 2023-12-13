export const ExtractorMixin = {
    methods: {
        initData(extractorConfig) {
            for (const k in extractorConfig) {
                this.formData[k] = extractorConfig[k]
            }
        },
        validate() {
            const customValidateForm: any = this.$refs.customValidateForm
            return new Promise((resolve, reject) => {
                customValidateForm
                    .validate()
                    .then(() => {
                        const numberKeys = ['index', 'begin_index', 'end_index']
                        for (const k in this.formData) {
                            if (numberKeys.includes(k)) {
                                this.formData[k] = Number(this.formData[k])
                            }
                        }
                        // 校验成功时 resolve，传递校验结果和数据
                        resolve({ result: true, data: this.formData })
                    })
                    .catch(() => {
                        // 校验失败时 resolve，传递校验结果
                        resolve({ result: false })
                    })
            })
        }
    }
}
