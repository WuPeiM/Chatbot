<template>
    <bk-form
        :label-width="labelWidth"
        :model="formData"
        :rules="rules"
        ref="convertorValidateForm">
        <template v-for="option in convertorOptions">
            <div :key="option.value" v-if="convertorValue.includes(option.value)" class="mb20">
                <bk-form-item>
                    <bk-checkbox
                        :true-value="true"
                        :false-value="false"
                        v-model="formData[option.value]">
                        {{ option.label }}
                    </bk-checkbox>
                </bk-form-item>
                <template v-if="option.hasSubOptions">
                    <bk-form-item
                        v-for="subOption in option.subOptions"
                        :label-width="subOption.labelWidth"
                        :label="subOption.label"
                        :key="subOption.property"
                        :required="subOption.required"
                        :property="subOption.property"
                        :error-display-type="'normal'">
                        <bk-input
                            v-if="subOption.inputType === 'text'"
                            style="width: 425px;"
                            v-model="customForm[option.value][subOption.property]"
                            :placeholder="subOption.placeholder" />
                        <bk-select
                            v-else-if="subOption.inputType === 'select'"
                            style="width: 425px;"
                            v-model="customForm[option.value][subOption.property]"
                            searchable>
                            <bk-option
                                v-for="subOptionItem in subOption.options"
                                :key="subOptionItem.value"
                                :id="subOptionItem.value"
                                :name="subOptionItem.label" />
                        </bk-select>
                        <bk-checkbox
                            v-else-if="subOption.inputType === 'checkbox'"
                            :true-value="true"
                            :false-value="false"
                            v-model="customForm[option.value][subOption.property]">
                            {{subOption.checkboxLabel}}
                        </bk-checkbox>
                        <div class="tip-text">{{subOption.tip}}</div>
                    </bk-form-item>
                </template>
            </div>
        </template>
    </bk-form>
</template>

<script lang="ts">
    import {Vue, Component, Prop} from 'vue-property-decorator'
    import moment from 'moment-timezone'
    import uniq from 'lodash/uniq'
    interface SubOption {
        property: string;
        inputType: 'text' | 'select' | 'checkbox';
        placeholder?: string;
        options?: Array<{ value: string; label: string }>;
        labelWidth?: number,
        label?: string,
        required?: boolean,
        tip?: string,
        checkboxLabel?: string
    }
    interface ConvertorOption {
        label: string;
        value: string;
        hasSubOptions?: boolean;
        subOptions?: SubOption[];
    }
    @Component({})
    export default class index extends Vue {
        @Prop({
            type: Number,
            default: () => 140
        })
        labelWidth: number
        @Prop({
            type: Array,
            default: () => []
        })
        convertorValue: any[]
        formData = {
            numeric: true,
            date: true,
            hash: true,
            split_and_count: true,
            ip_anonymizer: true,
            syslog_pri_level: true,
            syslog_pri_facility: true,
            tokenizer: true,
            csv: true,
            lowercase: true,
            uppercase: true,
            flexdate: true
        }
        customForm = {
           date: {
               date_format: '',
               time_zone: '', // 时区
               locale: '' // 地区
           },
            split_and_count: {
                split_by: ''
            },
            csv: {
                column_header: '', // 字段名称
                escape_char: '\\', // 转义符
                quote_char: '"', // 双引号字符
                separator: ',', // 分割字符
                strict_quotes: false, // 严格模式
                trim_leading_whitespace: false // 删除前导空格
            },
            flexdate: {
                time_zone: ''
            }
        }
        rules = {
            date_format: [
                {
                    validator: () => {
                        return this.customForm.date.date_format
                    },
                    message: '必填项',
                    trigger: 'blur'
                }
            ],
            split_by: [
                {
                    validator: () => {
                        return this.customForm.split_and_count.split_by
                    },
                    message: '必填项',
                    trigger: 'blur'
                }
            ],
            column_header: [
                {
                    validator: () => {
                        return this.customForm.csv.column_header
                    },
                    message: '必填项',
                    trigger: 'blur'
                }
            ]
        }
        timeZoneList = []
        _UNCLASSIFIED_AREA: string = 'Unclassified';
        areaList = []
        localesLoading: boolean = false
        get convertorOptions(): ConvertorOption[] {
            return [
                {
                    label: '转换为数值',
                    value: 'numeric'
                },
                {
                    label: '转换为date类型',
                    value: 'date',
                    hasSubOptions: true,
                    subOptions: [
                        {
                            property: 'date_format',
                            inputType: 'text',
                            placeholder: 'yyyy-MM-dd HH:mm:ss.SSS',
                            labelWidth: 300,
                            label: '格式化字符串',
                            required: true,
                            tip: '将字符串格式化成日期,请参考Java8的简单日期格式化字符串. 在文档查看更多信息.'
                        },
                        {
                            property: 'time_zone',
                            inputType: 'select',
                            options: this.timeZoneList,
                            labelWidth: 300,
                            label: '时区',
                            tip: '当前日期所在的时区.'
                        },
                        {
                            property: 'locale',
                            inputType: 'select',
                            options: this.areaList,
                            labelWidth: 300,
                            label: '地区',
                            tip: '解析日期的地区.'
                        }
                    ]
                },
                {
                    label: '转换为数值',
                    value: 'hash'
                },
                {
                    label: '拆分&计数',
                    value: 'split_and_count',
                    hasSubOptions: true,
                    subOptions: [
                        {
                            property: 'split_by',
                            inputType: 'text',
                            labelWidth: 300,
                            label: '分割',
                            required: true,
                            tip: '定义的特性正在分割拆分与计数转换器的提取部分，并将其标记为字段进行存储。例如： ?fields=first_name,last_name,zip 按照 , 分割结果为 3")} 您只是计数了GET用户的REST请求的请求领域.'
                        }
                    ]
                },
                {
                    label: '通过替换最后一个字节使得IPv4地址脱敏',
                    value: 'ip_anonymizer'
                },
                {
                    label: '转换PRI为Syslog的级别',
                    value: 'syslog_pri_level'
                },
                {
                    label: '转换为Syslog模式',
                    value: 'syslog_pri_facility'
                },
                {
                    label: '将键=值对添加为字段',
                    value: 'tokenizer'
                },
                {
                    label: '添加CSV列作为字段',
                    value: 'csv',
                    hasSubOptions: true,
                    subOptions: [
                        {
                            property: 'column_header',
                            inputType: 'text',
                            labelWidth: 300,
                            label: '字段名称',
                            required: true
                        },
                        {
                            property: 'separator',
                            inputType: 'text',
                            labelWidth: 300,
                            label: '分割字符',
                            tip: '例如，\\n和\\t将被转换为单个字符.'
                        },
                        {
                            property: 'quote_char',
                            inputType: 'text',
                            labelWidth: 300,
                            label: '双引号字符'
                        },
                        {
                            property: 'escape_char',
                            inputType: 'text',
                            labelWidth: 300,
                            label: '转义符',
                            tip: '转义符会被用于跳过分割字符和双引号字符.'
                        },
                        {
                            property: 'strict_quotes',
                            inputType: 'checkbox',
                            labelWidth: 300,
                            checkboxLabel: '严格模式',
                            tip: '忽略字符串外部的转义字符.'
                        },
                        {
                            property: 'trim_leading_whitespace',
                            inputType: 'checkbox',
                            labelWidth: 300,
                            checkboxLabel: '删除前导空格'
                        }
                    ]
                },
                {
                    label: '将值转换为小写',
                    value: 'lowercase'
                },
                {
                    label: '转换值为大写',
                    value: 'uppercase'
                },
                {
                    label: '复杂日期转换',
                    value: 'flexdate',
                    hasSubOptions: true,
                    subOptions: [
                        {
                            property: 'time_zone',
                            inputType: 'select',
                            options: this.timeZoneList,
                            labelWidth: 300,
                            label: '时区',
                            tip: '不适用于日期的时区.'
                        }
                    ]
                }
            ]
        }
        mounted() {
            this.timeZoneList = this.getTimezoneList()
            this.getLocales()
        }
        initData(converters) {
            converters.forEach(item => {
                this.formData[item.type] = true
                if (JSON.stringify(item.config) !== '{}') {
                    for (const k in item.config) {
                        this.customForm[item.type][k] = item.config[k]
                    }
                }
            })
        }
        handConvertorData() {
            const data = {}
            for (const k in this.formData) {
                if (this.formData[k] && this.convertorValue.includes(k)) {
                    data[k] = this.customForm[k] || {}
                }
            }
            return data
        }
        validate() {
            const convertorValidateForm: any = this.$refs.convertorValidateForm
            return new Promise((resolve, reject) => {
                convertorValidateForm
                    .validate()
                    .then(() => {
                        // 校验成功时 resolve，传递校验结果和数据
                        resolve({ result: true, data: this.handConvertorData() })
                    })
                    .catch(() => {
                        // 校验失败时 resolve，传递校验结果
                        resolve({ result: false })
                    })
            })
        }
        getLocales() {
            this.localesLoading = true
            this.$api.extractor.getLocales().then(res => {
                const { result, data } = res
                if (!result) {
                    return false
                }
                this.areaList = this.handleLocales(data.locales)
            }).finally(() => {
                this.localesLoading = false
            })
        }
        handleLocales(locales) {
            const sortedLocales = Object.values(locales)
                .filter((locale: any) => locale.language_tag !== 'und')
                .map((locale: any) => ({ value: locale.language_tag, label: locale.display_name }))
                .sort((a, b) => {
                    const nameA = a.label.toUpperCase()
                    const nameB = b.label.toUpperCase()
                    if (nameA < nameB) {
                        return -1
                    }
                    if (nameA > nameB) {
                        return 1
                    }
                    return 0
                })
            return [{ value: 'und', label: 'Default locale' }].concat(sortedLocales)
        }
        getTimezoneList() {
            const timezones = {}
            // 按地区对时区进行分组
            moment.tz.names().forEach((timezone) => {
                const splitted = timezone.split('/')
                const area = (splitted.length > 1 ? splitted[0] : this._UNCLASSIFIED_AREA)
                const location = (splitted.length > 1 ? splitted[1] : splitted[0])

                if (!timezones[area]) {
                    timezones[area] = []
                }

                timezones[area].push(location)
            })

            const labels = []

            Object.keys(timezones)
                .sort()
                .forEach((area) => {
                    // Add disabled area option to use as TZ separator
                    labels.push({ label: area, disabled: true, value: area })
                    // Now add a label per timezone in the area
                    const effectiveTimezones = uniq(timezones[area]).sort()
                    const timezoneLabels = effectiveTimezones.map((location) => {
                        const timezone = (area === this._UNCLASSIFIED_AREA ? location : `${area}/${location}`)
                        return { value: timezone, label: location.replace('_', ' ') }
                    })
                    labels.push(...timezoneLabels)
                })
            return labels
        }
    }
</script>
