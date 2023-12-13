import { Vue } from 'vue-property-decorator'

export class RuleDisplay extends Vue {
    typeList: Array<any> = []
    valueList: Array<any> = []

    getRuleDisplay(item, others) {
        let displayStr = '--'
        const { type, inverted, value, field } = item
        const target = others.typeList.find(item => item.id === type)
        if (!target) {
            return displayStr
        }
        let valueStr = value ? `<i>${value}</i>` : '&lt;empty&gt;'
        if (target.name === 'PRESENCE') {
            valueStr = ''
        }
        if (target.name === 'MATCH_INPUT') {
            const targetVaule = others.valueList.find(item => item.id === value)?.name || '--'
            const addTextToString = (str, suffix) => {
                const lastIndex = str.lastIndexOf('）')
                if (lastIndex !== -1) {
                    const leftPart = str.slice(0, lastIndex)
                    const rightPart = str.slice(lastIndex)
                    return leftPart + ':' + suffix + rightPart
                }
                return str
            }
            valueStr = `<i>${addTextToString(targetVaule, value)}</i>`
        }
        switch (target.name) {
            case 'ALWAYS_MATCH':
                displayStr = '规则总是匹配'
                break
            case 'MATCH_INPUT':
                displayStr = '字段<i>gl_source_input</i>必须' + `${inverted ? '不 ' : ''}` + `${target.long_desc} ${valueStr}`
                break
            default:
                displayStr = `字段<i>${field || '&lt;empty&gt;'}</i>必须` + `${inverted ? '不 ' : ''}` + `${target.long_desc} ${valueStr}`
                break
        }
        return displayStr
    }
}
