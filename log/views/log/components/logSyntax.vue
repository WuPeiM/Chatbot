<template>
    <bk-sideslider
        title="日志语法说明"
        :is-show.sync="visible"
        :quick-close="true"
        :width="600"
        ext-cls="common-dialog-wrapper">
        <div slot="content" class="syntax-wrapper-main">
            <div class="syntax-content-wrapper">
                <div class="content">
                    <h3>模糊搜索</h3>
                    <div class="shell">ssh</div>
                    <div class="shell">type:ssh</div>
                    <div class="shell">type:(ssh OR login)</div>
                </div>
                <div class="content">
                    <h3>精确搜索</h3>
                    <div class="shell">"ssh login"</div>
                    <div class="shell">type:"ssh login"</div>
                </div>
                <div class="content">
                    <h3>字段搜索<span>（搜索是否存在字段）</span></h3>
                    <div class="shell">_exists_:type</div>
                    <div class="shell">NOT _exists_:type</div>
                </div>
                <div class="content">
                    <h3>通配符搜索<span>（？替换单个字符，*替换零个或多个字符）</span></h3>
                    <div class="shell">source:*.org</div>
                    <div class="shell">source:exam?le.org</div>
                    <div class="shell">source:exam?le.*</div>
                </div>
                <div class="content">
                    <h3>范围搜索</h3>
                    <div class="shell">http_response_code:>400</div>
                    <div class="shell">http_response_code:[500 TO 504]</div>
                    <div class="shell">{{'http_response_code:(>=400 AND &lt;500)'}}</div>
                </div>
                <div class="content">
                    <h3>请注意，运算符AND、OR 和 NOT 区分大小写，必须全部大写</h3>
                </div>
                <!-- <div class="content">
                    <h3>精确搜索</h3>
                    <p><b>运算：</b>查询符合正则表达式 ethernet[0-9]+ 的消息</p>
                    <div class="shell">/ethernet[0-9]+/</div>
                    <p>默认情况下，所有术语或短语都是or连接的，因此所有至少有一个命中的消息都会被返回。可以使用布尔运算符和组对此进行控制</p>
                    <div class="shell">
                        <p>"ssh login" AND source:example.org</p>
                        <p>("ssh login" AND (source:example.org OR source:another.example.org)) OR _exists_:always_find_me</p>
                    </div>
                    <p>您还可以使用 NOT 运算符：</p>
                    <div class="shell">
                        <p>"ssh login" AND NOT source:example.org</p>
                        <p>NOT example.org</p>
                    </div>
                    <p><b>请注意，AND、OR 和 NOT 区分大小写，必须全部大写。</b></p>
                    <p><b>通配符：</b>适用于模糊搜索的情况，当对某些词记忆不完整时，可采用？和*代替不确定的字符，进行模糊搜索，使用 ？替换单个字符，*替换零个或多个字符</p>
                    <div class="shell">
                        <p>source:*.org</p>
                        <p>source:exam?le.org</p>
                        <p>source:exam?le.*</p>
                    </div>
                    <p>还要注意，message、full_message和source是默认情况下唯一要分析的字段。虽然通配符搜索（使用*和？）适用于所有索引字段，但分析的字段的行为会有所不同。</p>
                    <p><b>模糊：</b>可以搜索类似的字词，此示例使用默认距离为 2 的 Damerau-Levenshtein 距离，并将匹配“ssh login”和“example.org”（在查询中故意拼写错误）。</p>
                    <div class="shell">
                        <p>ssh logni~</p>
                        <p>source:exmaple.org~</p>
                    </div>
                    <p>还可以像这样更改距离：</p>
                    <div class="shell">source:exmaple.org~1</div>
                    <p>可以使用模糊运算符执行邻近搜索，其中短语中的术语可以彼此具有不同/模糊的距离，并且不必按定义的顺序排列：</p>
                    <div class="shell">"foo bar"~5</div>
                    <p><b>范围查询：</b>数值字段支持范围查询。方括号中的范围是包含的，大括号是排除的，甚至可以组合：</p>
                    <div class="shell">
                        <p>http_response_code:[500 TO 504]</p>
                        <p>http_response_code:{400 TO 404}</p>
                        <p>bytes:{0 TO 64]</p>
                        <p>http_response_code:[0 TO 64}</p>
                    </div>
                    <p>还可以在一侧进行搜索，比如大于和小于等</p>
                    <div class="shell">
                        <p>http_response_code:&gt;400</p>
                        <p>http_response_code:&lt;400</p>
                        <p>http_response_code:&gt;=400</p>
                        <p>http_response_code:&lt;=400</p>
                    </div>
                    <p>也可以组合无界范围运算符</p>
                    <div class="shell">http_response_code:(&gt;=400 AND&lt;500)</div>
                    <p>可以在日期字段上进行范围查询，时间选取器中的选定时间段必须符合要搜索的范围。比如时间范围是最近 5 分钟，但搜索时间是过去一周，则查询将不会返回任何内容</p>
                    <div class="shell">timestamp:["2019-07-23 09:53:08.175" TO "2019-07-23 09:53:08.575"]</div>
                </div> -->
            </div>
            <!-- <div class="syntax-content-wrapper">
                <div class="title">
                    2、特殊情况
                </div>
                <div class="content">
                    <p>以下字符必须使用反斜杠进行转义：</p>
                    <div class="shell">& | : \ / + - ! ( ) { } [ ] ^ " ~ * ?</div>
                    <p>例如：</p>
                    <div class="shell">resource:\/posts\/45326</div>
                </div>
            </div> -->
            <!-- <div class="syntax-content-wrapper">
                <div class="title">
                    3、错误类型
                </div>
                <div class="content">
                    <p>在进行查询时，请注意异常警告，如果输入WeOps无法识别的查询条件时，会显示对应的警告，产生警告的情况如下：</p>
                    <ul>
                        <li>
                            <b>语法错误：</b>
                            在搜索过程中，查询语法出错，会出现对应的提示。
                        </li>
                        <li>
                            <b>运算符无效：</b>
                            当运算符拼写错误时会发生这种情况。例如，运算符AND正确时的是，但是写成and就是错误情况。
                        </li>
                        <li>
                            <b>未知字段：</b>
                            在搜索过程中，查询语法出错，会出现对应的提示。
                        </li>
                        <li>
                            <b>参数错误：</b>
                            在搜索查询中使用未声明的参数时，会发生此错误。
                        </li>
                    </ul>
                </div>
            </div> -->
        </div>
        <div slot="footer">
            <bk-button theme="default" @click="visible = false">取消</bk-button>
        </div>
    </bk-sideslider>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    @Component({})
    export default class logSyntax extends Vue {
        visible: boolean = false

        show() {
            this.visible = true
        }
    }
</script>

<style lang="scss">
.syntax-wrapper-main {
    height: calc(100vh - 127px);
    padding: 0 !important;
}
.syntax-content-wrapper {
    margin-bottom: 20px;
    .title {
        padding-left: 10px;
        font-weight: 700;
        color: #313238;
        height: 42px;
        line-height: 42px;
        border-bottom: 1px solid #dcdee5;
        background-color: #f0f1f5;
    }
    .content {
        padding: 0 20px 4px 20px;
        h3 {
            font-weight: 700;
            font-size: 13px;
            span {
                font-weight: 400;
                font-size: 12px;
                color: #96A1B2;
            }
        }
        .shell {
            padding: 10px;
            margin-bottom: 4px;
            background: #fafbfd;
        }
        ul {
            li {
                list-style: disc;
                line-height: 32px;
                margin-left: 15px;
            }
        }
    }
}
</style>
