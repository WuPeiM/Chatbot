<template>
    <div>
        <component
            v-for="config in configurationComponents"
            :key="config.name"
            :is="config.component"
            :ref="config.ref"
            :label-width="labelWidth"
            :input-width="inputWidth"
            :test-value="testValue"
            @validate-result="handleConfigurationValidationResult" />
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from 'vue-property-decorator'
    import CopyInputConfiguration from './copyInputConfiguration.vue'
    import GrokConfiguration from './grokConfiguration.vue'
    import JsonConfiguration from './jsonConfiguration.vue'
    import RegexConfiguration from './regexConfiguration.vue'
    import RegexReplaceConfiguration from './regexReplaceConfiguration.vue'
    import SplitConfiguration from './splitConfiguration.vue'
    import SubStringConfiguration from './subStringConfiguration.vue'
    import { extractorValidateForm } from '../../ts/extractorMap'

@Component({
    components: {
        CopyInputConfiguration,
        GrokConfiguration,
        JsonConfiguration,
        RegexConfiguration,
        RegexReplaceConfiguration,
        SplitConfiguration,
        SubStringConfiguration
    }
})
export default class ExtractorConfiguration extends Vue {
    @Prop({ type: String, default: () => '' }) extractorType: string;
    @Prop({ type: Number, default: () => 140 }) labelWidth: number;
    @Prop({ type: Number, default: () => 480 }) inputWidth: number;
    @Prop({ type: String, default: () => '' }) testValue: string
    // 根据不同类型的配置，决定需要渲染的组件
    get configurationComponents() {
        const components = [
            { name: 'copy_input', component: 'CopyInputConfiguration', ref: 'copyInput' },
            { name: 'grok', component: 'GrokConfiguration', ref: 'grok' },
            { name: 'json', component: 'JsonConfiguration', ref: 'json' },
            { name: 'regex', component: 'RegexConfiguration', ref: 'regex' },
            { name: 'regex_replace', component: 'RegexReplaceConfiguration', ref: 'regex_replace' },
            { name: 'split_and_index', component: 'SplitConfiguration', ref: 'split_and_index' },
            { name: 'substring', component: 'SubStringConfiguration', ref: 'substring' }
        ]

        return components.filter(config => config.name === this.extractorType)
    }
    initData(extractorConfig) {
        const customRef: any = this.$refs[extractorValidateForm[this.extractorType].ref][0]
        customRef.initData(extractorConfig)
    }
     async validate() {
        const extractorObj = extractorValidateForm[this.extractorType]
        if (extractorObj.validate) {
            const customRef: any = this.$refs[extractorObj.ref][0]
            try {
                const validationData = await customRef.validate()
                this.handleConfigurationValidationResult(true, validationData)
            } catch (error) {
                this.handleConfigurationValidationResult(false)
                throw error
            }
        } else {
            this.handleConfigurationValidationResult(true, { result: true })
        }
    }

    handleConfigurationValidationResult(result, data?) {
        this.$emit('validate-result', result, data)
    }
}
</script>
