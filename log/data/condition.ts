// 生成搜索id的参数
export const saveConditionParams = {
    'id': '64379b65e5d84180749668e2',
    'queries': [
        {
            'id': 'e49b4ca1-d987-458d-9a16-bcc9f15d487b',
            'query': {
                'type': 'elasticsearch',
                'query_string': ''
            },
            'timerange': {
                'type': 'absolute',
                'from': '2023-04-13T05:59:03.356Z',
                'to': '2023-04-13T06:04:03.356Z'
            },
            'filter': null,
            'search_types': [
                {
                    'timerange': null,
                    'query': null,
                    'streams': [],
                    'id': '036c631c-dd6d-49b4-a52f-1b687bab8138',
                    'name': 'chart',
                    'series': [
                        {
                            'type': 'count',
                            'id': 'count()',
                            'field': null
                        }
                    ],
                    'sort': [],
                    'rollup': true,
                    'type': 'pivot',
                    'row_groups': [
                        {
                            'type': 'time',
                            'field': 'timestamp',
                            'interval': {
                                'type': 'auto',
                                'scaling': 1
                            }
                        }
                    ],
                    'column_groups': [],
                    'filter': null
                },
                {
                    'timerange': null,
                    'query': null,
                    'streams': [],
                    'id': '054fcc0e-348a-4d97-80ee-509a5fb61460',
                    'name': null,
                    'limit': 150,
                    'offset': 0,
                    'sort': [
                        {
                            'field': 'timestamp',
                            'order': 'DESC'
                        }
                    ],
                    'fields': [],
                    'decorators': [],
                    'type': 'messages',
                    'filter': null
                }
            ]
        }
    ],
    'parameters': []
}
