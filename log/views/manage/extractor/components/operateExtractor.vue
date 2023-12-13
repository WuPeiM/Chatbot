<template>
    <div class="operate-extractor" v-bkloading="{ isLoading: pageLoading, zIndex: 10 }">
        <page-explanation
            :title="`${isAdd ? '新建' : '编辑'}输入 ${clusterDetail.title || '--'} ${isAdd ? '消息提取器' : `中的提取器 ${extractorDetail.title}`}`"
            content="日志提取器将会应用在接收器中的每条信息.使用日志提取器后,将会有助于分析时进行过滤及字段搜索." />
        <div class="main-content">
            <div class="title">示例日志消息</div>
            <div
                class="example-msg"
                v-bkloading="{ isLoading: loadMessageLoading, zIndex: 10 }">
                <span>{{ isAdd ? $route.query.message : (sampleLogMsg || '--')}}</span>
            </div>
            <div class="title mt20">提取器配置</div>
            <div class="form-content">
                <bk-form
                    :label-width="labelWidth"
                    :model="formData"
                    :rules="rules"
                    ref="validateForm">
                    <bk-form-item
                        label="提取器标题"
                        :required="true"
                        :property="'title'"
                        :error-display-type="'normal'">
                        <bk-input :style="{ width: `${inputWidth}px` }" v-model="formData.title" placeholder="请输入提取器标题"></bk-input>
                        <div class="tip-text">提取器的描述.</div>
                    </bk-form-item>
                    <bk-form-item label="提取器类型">
                        <div>{{extractorNameMap[extractorType]}}</div>
                    </bk-form-item>
                    <bk-form-item label="来源字段">
                        <span>{{$route.query.sourceField}}</span>
                    </bk-form-item>
                    <extractor-configuration
                        ref="extractorConfiguration"
                        class="mt20"
                        :label-width="labelWidth"
                        :input-width="inputWidth"
                        :extractor-type="extractorType"
                        :test-value="testValue"
                        @validate-result="getValidateResult">
                    </extractor-configuration>
                    <bk-form-item label="条件" class="mt20">
                        <bk-radio-group v-model="formData.condition" @change="changeCondition">
                            <bk-radio class="mr20" value="none">总是尝试提取</bk-radio>
                            <bk-radio class="mr20" value="string">只有字段包含字符串才尝试提取</bk-radio>
                            <bk-radio value="regex">只有当字段匹配正则表达式时提取</bk-radio>
                        </bk-radio-group>
                        <div class="tip-text">只从符合特定条件的消息中提取字段,这可以避免错误或者不必要的提取,还可以节省CPU资源.</div>
                    </bk-form-item>
                    <bk-form-item
                        v-if="['string', 'regex'].includes(formData.condition)"
                        :required="true"
                        :property="'fieldContain'"
                        :error-display-type="'normal'"
                        :label="formData.condition === 'string' ? '字段包含字符串' : '字段匹配正则表达式'">
                        <div style="display: flex;">
                            <bk-input
                                v-if="formData.condition === 'string'"
                                placeholder="输入包含字段的字符串以便尝试提取"
                                :style="{ width: `${inputWidth}px` }"
                                :clearable="true"
                                v-model="formData.fieldContainString">
                            </bk-input>
                            <bk-input
                                v-if="formData.condition === 'regex'"
                                placeholder="输入正则表达式以提取字段信息"
                                :style="{ width: `${inputWidth}px` }"
                                :clearable="true"
                                v-model="formData.fieldMatchRegEx">
                            </bk-input>
                            <bk-button
                                :theme="'primary'"
                                :title="'测试'"
                                class="ml20"
                                :loading="conditionTestLoading"
                                @click="testCondition">
                                测试
                            </bk-button>
                        </div>
                        <div
                            :style="{ color: conditionTestResult.matched ? '#2DCB56' : ' #ea3636' }"
                            v-if="formData.condition !== 'none' && Object.keys(conditionTestResult).length">
                            {{ conditionTestResult.matched ? '匹配!提取器将针对这个示例运行' : '不匹配!提取器将不会运行' }}
                        </div>
                    </bk-form-item>
                    <bk-form-item
                        v-if="!['grok', 'json'].includes(extractorType)"
                        label="存储为字段"
                        :required="true"
                        :property="'storeAsField'"
                        :error-display-type="'normal'">
                        <bk-input :style="{ width: `${inputWidth}px` }" v-model="formData.storeAsField"></bk-input>
                        <div class="tip-text">创建一个新字段来存储提取出来的值.只允许包含字母,数字以及下划线.例如:http_response_code.</div>
                    </bk-form-item>
                    <bk-form-item label="提取策略" class="mt20">
                        <bk-radio-group v-model="formData.extractStrategy">
                            <bk-radio class="mr20" value="copy">复制</bk-radio>
                            <bk-radio class="mr20" value="cut">剪切</bk-radio>
                        </bk-radio-group>
                        <div class="tip-text">不能对message以及source这类型的标准字段进行剪切.</div>
                    </bk-form-item>
                    <bk-form-item
                        v-if="['grok', 'json'].includes(extractorType)">
                        <div class="source-field-tip">{{`无法为 ${extractorNameMap[extractorType]} 提取器添加转换器.`}}</div>
                    </bk-form-item>
                    <bk-form-item
                        v-else
                        label="添加转换器">
                        <bk-select
                            :style="{ width: `${inputWidth}px` }"
                            v-model="formData.convertor"
                            display-tag
                            searchable
                            multiple>
                            <bk-option
                                v-for="option in convertorList"
                                :key="option.id"
                                :id="option.id"
                                :name="option.name">
                            </bk-option>
                        </bk-select>
                        <div class="tip-text">为提取的字段添加转换器.</div>
                    </bk-form-item>
                    <convertor
                        v-if="formData.convertor.length"
                        ref="convertor"
                        :convertor-value="formData.convertor">
                    </convertor>
                </bk-form>
                <bk-button
                    :theme="'success'"
                    style="margin-left: 140px;margin-top: 20px;"
                    @click="operateExtractor">
                    {{`${isAdd ? '创建' : '更新'}提取器`}}
                </bk-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Vue, Component} from 'vue-property-decorator'
    import PageExplanation from '@/components/pageExplanation.vue'
    import ExtractorConfiguration from './baseForm/extractorConfiguration.vue'
    import Convertor from './convertor/index.vue'
    import { extractorNameMap, convertorType } from '../ts/extractorMap'
    @Component({
        components: {
            PageExplanation,
            ExtractorConfiguration,
            Convertor
        }
    })
    export default class operateExtractor extends Vue {
        labelWidth: number = 140
        clusterDetail: any = {}
        pageLoading: boolean = false
        formData: any = {
            condition: 'none', // 条件
            fieldContainString: '', // 字段包含字符串
            fieldMatchRegEx: '', // 字段匹配正则
            storeAsField: '', // 存储为字段
            extractStrategy: 'copy', // 提取策略
            title: '', // 提取器标题
            convertor: [] // 转换器
        }
        rules: any = {
            fieldContain: [
                {
                    validator: () => {
                        if (this.formData.condition === 'none') {
                            return true
                        }

                        return this.formData.condition === 'string'
                            ? this.formData.fieldContainString
                            : this.formData.fieldMatchRegEx
                    },
                    message: '必填项',
                    trigger: 'blur'
                }
            ],
            storeAsField: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ],
            title: [
                {
                    required: true,
                    message: '必填项',
                    trigger: 'blur'
                }
            ]
        }
        extractorNameMap = extractorNameMap
        conditionTestResult: any = {} // 条件测试结果
        conditionTestLoading: boolean = false
        convertorList: any[] = convertorType // 转换器列表
        inputWidth: number = 480
        loadMessageLoading: boolean = false
        sampleLogMsg: string = ''
        extractorDetail: any = {}
        get extractorType(): any {
            return this.$route.query.extractorType
        }
        get isAdd() {
            return this.$route.name === 'AddExtractor'
        }
        get testValue(): any {
            return this.isAdd ? this.$route.query.message : (this.sampleLogMsg || '--')
        }
        mounted() {
            this.getClusterDetail()
            if (!this.isAdd) {
                this.getExtractorDetail()
                this.getUniversalRelative()
            }
        }
        initData() {
            const {
                condition_type: condition,
                condition_value: conditionValue,
                target_field: targetField,
                cursor_strategy: cursorStrategy,
                title,
                converters,
                extractor_config: extractorConfig
            } = this.extractorDetail
            this.formData.condition = condition
            this.formData.fieldContainString = condition === 'string' ? conditionValue : ''
            this.formData.fieldMatchRegEx = condition === 'regex' ? conditionValue : ''
            this.formData.storeAsField = targetField
            this.formData.extractStrategy = cursorStrategy
            this.formData.title = title
            this.formData.convertor = converters.map(item => item.type)
            if (converters.length) {
                this.$nextTick(() => {
                    const convertor: any = this.$refs.convertor
                    convertor.initData(converters)
                })
            }
            if (JSON.stringify(extractorConfig) !== '{}') {
                this.$nextTick(() => {
                    const extractorConfiguration: any = this.$refs.extractorConfiguration
                    extractorConfiguration.initData(extractorConfig)
                })
            }
        }
        getUniversalRelative() {
            this.loadMessageLoading = true
            this.$api.extractor.getUniversalRelative({
                query: `gl2_source_input:${this.$route.query.receiverId} OR gl2_source_radio_input:${this.$route.query.receiverId}`,
                range: 3600,
                limit: 1,
                decorate: false
            }).then(res => {
                const { result, data } = res
                if (!result) {
                    return false
                }
                const message: any = data?.messages[0]?.message
                this.sampleLogMsg = message[this.$route.query.sourceField]
            }).finally(() => {
                this.loadMessageLoading = false
            })
        }
        getExtractorDetail() {
            this.pageLoading = true
            this.$api.extractor.getExtractorDetail({
                receiverId: this.$route.query.receiverId,
                extractorId: this.$route.query.extractorId
            }).then(res => {
                const { result, data, message } = res
                if (!result) {
                    this.$error(message)
                    return false
                }
                this.extractorDetail = data
                this.initData()
            }).finally(() => {
                this.pageLoading = false
            })
        }
        getValidateResult(result, validateRes) {
            if (result) {
                // 校验成功，继续后续操作
                try {
                    const validateForm: any = this.$refs.validateForm
                    validateForm.validate().then(async validator => {
                        if (!validateRes.result) {
                            return false
                        }
                        const convertor: any = this.$refs.convertor
                        let convertorRes: any = {}
                        if (convertor) {
                            convertorRes = await convertor.validate()
                            if (!convertorRes.result) {
                                return false
                            }
                        }
                        const url = this.isAdd ? 'createExtractor' : 'editExtractor'
                        const params = {
                            receiverId: this.$route.query.receiverId,
                            extractorId: this.$route.query.extractorId,
                            body: {
                                title: this.formData.title,
                                cut_or_copy: this.formData.extractStrategy,
                                source_field: this.$route.query.sourceField,
                                target_field: this.formData.storeAsField,
                                extractor_type: this.extractorType,
                                extractor_config: {
                                    ...(validateRes.data || {})
                                },
                                converters: convertorRes.data || {},
                                condition_type: this.formData.condition,
                                condition_value: this.formData.condition === 'none'
                                    ? ''
                                    : (this.formData.condition === 'string' ? this.formData.fieldContainString : this.formData.fieldMatchRegEx)
                            }
                        }
                        this.pageLoading = true
                        this.$api.extractor[url](params).then(res => {
                            const { result, message } = res
                            if (!result) {
                                this.$error(message)
                                return false
                            }
                            this.$success(`提取器 ${this.formData.title} ${this.isAdd ? '创建' : '编辑'}成功`)
                            this.$router.push({
                                name: 'Extractor',
                                query: {
                                    receiverId: this.$route.query.receiverId
                                }
                            })
                        }).finally(() => {
                            this.pageLoading = false
                        })
                    })
                } catch (error) {
                    // 处理错误
                    console.error(error)
                }
            } else {
                // 校验失败
                console.warn('Configuration validation failed')
            }
        }
        async operateExtractor() {
            const extractorConfiguration: any = this.$refs.extractorConfiguration
            try {
                await extractorConfiguration.validate()
            } catch (error) {
                // 处理错误
                console.error(error)
            }
        }
        // 测试条件
        testCondition() {
            const url = this.formData.condition === 'string' ? 'testContainString' : 'testRegex'
            let params = {}
            if (this.formData.condition === 'string') {
                params = {
                    search_string: this.formData.fieldContainString,
                    string: this.testValue
                }
            } else {
                params = {
                    regex: this.formData.fieldMatchRegEx,
                    string: this.testValue
                }
            }
            this.conditionTestLoading = true
            this.$api.extractor[url](params).then(res => {
                const { result, data, message } = res
                if (!result) {
                    this.$error(message)
                    return false
                }
                this.conditionTestResult = data
            }).finally(() => {
                this.conditionTestLoading = false
            })
        }
        changeCondition() {
            this.conditionTestResult = {}
        }
        // 获取接收器详情
        getClusterDetail() {
            this.$api.logManage.getClusterDetail({
                id: this.$route.query.receiverId
            }).then(res => {
                const { result, data } = res
                if (!result) {
                    return false
                }
                this.clusterDetail = data
            })
        }
    }
</script>

<style lang="scss" scoped>
    .operate-extractor {
        .main-content {
            padding: 15px;
            background-color: #fff;
            .title {
                font-size: 22px;
                margin-bottom: 5px;
            }
            .example-msg {
                background-color: #f3f3f3;
                border: 1px solid #a6a6a6;
                color: #575757;
                padding: 10px;
                border-radius: 4px;
            }
            .form-content {
                padding-bottom: 10px;
                .source-field-tip {
                    width: 480px;
                    padding: 15px;
                    border-radius: 4px;
                    border: 1px solid #7894ce;
                    background-color: #fafafa;
                }
            }
        }
    }
</style>
