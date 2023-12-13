const extractorNameMap = {
    copy_input: '复制输入',
    grok: 'Grok模式',
    json: 'JSON',
    regex: '正则表达式',
    regex_replace: '正则表达式替换',
    split_and_index: '分割',
    substring: '子串捕获',
    lookup_table: '数据映射'
}

const extractorValidateForm = {
    copy_input: {
        validate: false
    },
    grok: {
        validate: true,
        ref: 'grok'
    },
    json: {
        validate: true,
        ref: 'json'
    },
    regex: {
        validate: true,
        ref: 'regex'
    },
    regex_replace: {
        validate: true,
        ref: 'regex_replace'
    },
    split_and_index: {
        validate: true,
        ref: 'split_and_index'
    },
    substring: {
        validate: true,
        ref: 'substring'
    }
}

const extractorType = [
    {
        id: 'copy_input',
        name: '复制输入'
    },
    {
        id: 'grok',
        name: 'Grok模式'
    },
    {
        id: 'json',
        name: 'JSON'
    },
    {
        id: 'regex',
        name: '正则表达式'
    },
    {
        id: 'regex_replace',
        name: '正则表达式替换'
    },
    {
        id: 'split_and_index',
        name: '分割'
    },
    {
        id: 'substring',
        name: '子串捕获'
    }
]

const convertorType = [
    {
        id: 'numeric',
        name: '数值'
    },
    {
        id: 'date',
        name: '日期'
    },
    {
        id: 'hash',
        name: 'Hash'
    },
    {
        id: 'split_and_count',
        name: '分割统计'
    },
    {
        id: 'ip_anonymizer',
        name: 'IPv4地址隐藏'
    },
    {
        id: 'syslog_pri_level',
        name: 'Syslog等级'
    },
    {
        id: 'syslog_pri_facility',
        name: 'Syslog级别'
    },
    {
        id: 'tokenizer',
        name: 'Key = Value键值对'
    },
    {
        id: 'csv',
        name: 'CSV'
    },
    {
        id: 'lowercase',
        name: '小写'
    },
    {
        id: 'uppercase',
        name: '大写'
    },
    {
        id: 'flexdate',
        name: '复杂日期'
    }
    // {
    //     id: 'lookup_table',
    //     name: '数据映射'
    // }
]

export {
    extractorNameMap,
    extractorType,
    convertorType,
    extractorValidateForm
}
