<template>
    <!-- 富文本编辑器 -->
    <Editor
        id="tinymceId"
        v-model="tinymceHtml"
        :init="setting"
        ref="intentionEditor"
    ></Editor>
</template>

<script>
    import Editor from '@tinymce/tinymce-vue'
    import tinymce from 'tinymce/tinymce'
    import 'tinymce/icons/default/icons.min.js'
    import 'tinymce/themes/silver/theme'
    import 'tinymce/plugins/advlist'
    import 'tinymce/plugins/lists'
    import 'tinymce/plugins/link'
    import 'tinymce/plugins/image'
    import 'tinymce/plugins/charmap'
    import 'tinymce/plugins/hr'
    import 'tinymce/plugins/anchor'
    import 'tinymce/plugins/pagebreak'
    import 'tinymce/plugins/imagetools'
    import 'tinymce/plugins/searchreplace'
    import 'tinymce/plugins/visualblocks'
    import 'tinymce/plugins/visualchars'
    import 'tinymce/plugins/code'
    import 'tinymce/plugins/fullpage'
    import 'tinymce/plugins/insertdatetime'
    import 'tinymce/plugins/nonbreaking'
    import 'tinymce/plugins/save'
    import 'tinymce/plugins/table'
    import 'tinymce/plugins/directionality'
    import 'tinymce/plugins/paste'
    import 'tinymce/plugins/textpattern'
    import 'tinymce/plugins/codesample'
    import 'tinymce/skins/ui/oxide/skin.min.css'
    import 'tinymce/skins/ui/oxide/content.min.css'
    import 'tinymce/skins/ui/oxide/content.css'
    import 'tinymce/skins/ui/oxide/skin.css'
    import '../formatpainter.ts'
    export default {
        name: 'rich-text',
        components: {
            Editor
        },
        props: {
            // tinyvalue首先在父组件中定义，用于向本子组件mytinymce发送数据
            // 然后在这里声明，用于本子组件接收父组件数据
            tinyValue: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: 'intention'
            }
        },
        data() {
            const self = this
            return {
                // 鼠标离开富文本前的位置
                cursorBookmark: {},
                buttonStyle: 'color: #fff; background-color: rgb(58,132,255); border-radius: 5px; border: 0px; padding: 2px 10px;',
                tinymceHtml: '',
                tinymceId: 'vue-tinymce-' + +new Date() + ((Math.random() * 1000).toFixed(0) + ''),
                editor: {},
                accept: 'image/jpeg, image/png,image/jpg',
                maxSize: 2097152,
                setting: {
                    // 禁用产品属性状态栏中显示的“ Powered by Tiny ”
                    branding: false,
                    // 禁用调整大小
                    resize: false,
                    // 禁用element path编辑器底部的状态栏。
                    height: 200,
                    // language_url: window.STATIC_URL + 'tinymce/static/langs/zh_CN.js',
                    // language: 'zh_CN',
                    menubar: false,
                    statusbar: false,
                    contextmenu: false,
                    // inline: true,
                    external_plugins: {
                        'codesample': window.STATIC_URL + 'tinymce/static/codesample/plugin.min.js',
                        'powerpaste': window.STATIC_URL + 'tinymce/static/powerpaste/plugin.min.js'
                    },
                    skin_url: window.STATIC_URL + 'tinymce/skins/ui/oxide',
                    //   skin_url: '../../../tinymce/skins/ui/oxide/',
                    content_css: window.STATIC_URL + 'tinymce/skins/content/default/content.min.css',
                    // 插件
                    plugins: [ // colorpicker textcolor contextmenu autoresize
                        'advlist lists link image charmap hr anchor pagebreak imagetools',
                        'searchreplace visualblocks visualchars code fullpage',
                        'insertdatetime nonbreaking save table directionality',
                        'powerpaste textpattern formatpainter codesample  nonbreaking'
                    ],
                    // 工具栏控件
                    toolbar: false,
                    // 自动保存的时间
                    // autosave_interval: '20s',
                    // 确保任何非块元素或文本节点都包含在p块元素中
                    forced_root_block: 'p',
                    // 导入的样式附加到Format菜单的末尾，并将替换默认格式。
                    importcss_append: true,
                    // 使TinyMCE的可编辑区域具有与周围内容相同的样式， `table`和`img`的问题基本就靠这个来填坑了
                    content_style: `
                        html, body                { height:100%; }
                        html                      { overflow-y: auto; }
                        html::-webkit-scrollbar   { display: none; }
                        iframe                    { width: 100%; }
                        p                         { margin: 0px; padding: 0px; }
                    `,
                    insert_button_items: 'image link | inserttable',
                    // CONFIG: Paste
                    paste_retain_style_properties: 'all',
                    paste_word_valid_elements: '*[*]', // word需要它
                    paste_data_images: true, // 粘贴的同时能把内容里的图片自动上传，非常强力的功能
                    paste_convert_word_fake_lists: false, // 插入word文档需要该属性
                    paste_webkit_styles: 'all',
                    paste_merge_formats: true,
                    paste_auto_cleanup_on_paste: false,
                    // CONFIG: StyleSelect
                    style_formats: [
                        {
                            title: '首行缩进',
                            block: 'p',
                            styles: { 'text-indent': '2em' }
                        },
                        {
                            title: '行高',
                            items: [
                                { title: '1', styles: { 'line-height': '1' }, inline: 'span' },
                                {
                                    title: '1.5',
                                    styles: { 'line-height': '1.5' },
                                    inline: 'span'
                                },
                                { title: '2', styles: { 'line-height': '2' }, inline: 'span' },
                                {
                                    title: '2.5',
                                    styles: { 'line-height': '2.5' },
                                    inline: 'span'
                                },
                                { title: '3', styles: { 'line-height': '3' }, inline: 'span' }
                            ]
                        },
                        {
                            title: '段落间距',
                            items: [
                                { title: '0', styles: { 'margin': '0' }, block: 'p' },
                                {
                                    title: '10px',
                                    styles: { 'margin': '10px' },
                                    block: 'p'
                                }
                            ]
                        }
                    ],
                    fontsize_formats: '12px 14px 16px 18px 24px 36px 48px 56px 72px',
                    // FontSelect
                    font_formats: `
                        微软雅黑=微软雅黑;
                        宋体=宋体;
                        黑体=黑体;
                        仿宋=仿宋;
                        楷体=楷体;
                        隶书=隶书;
                        幼圆=幼圆;
                        Andale Mono=andale mono,times;
                        Arial=arial, helvetica,
                        sans-serif;
                        Arial Black=arial black, avant garde;
                        Book Antiqua=book antiqua,palatino;
                        Comic Sans MS=comic sans ms,sans-serif;
                        Courier New=courier new,courier;
                        Georgia=georgia,palatino;
                        Helvetica=helvetica;
                        Impact=impact,chicago;
                        Symbol=symbol;
                        Tahoma=tahoma,arial,helvetica,sans-serif;
                        Terminal=terminal,monaco;
                        Times New Roman=times new roman,times;
                        Trebuchet MS=trebuchet ms,geneva;
                        Verdana=verdana,geneva;
                        Webdings=webdings;
                        Wingdings=wingdings,zapf dingbats`,
                    // Tab
                    tabfocus_elements: ':prev,:next',
                    // 允许您调整表格和图像的大小
                    object_resizing: true,
                    // markdown的规则
                    textpattern_patterns: [
                        { start: '*', end: '*', format: 'italic' },
                        { start: '**', end: '**', format: 'bold' },
                        { start: '#', format: 'h1' },
                        { start: '##', format: 'h2' },
                        { start: '###', format: 'h3' },
                        { start: '####', format: 'h4' },
                        { start: '#####', format: 'h5' },
                        { start: '######', format: 'h6' },
                        { start: '1.', cmd: 'InsertOrderedList' },
                        { start: '* ', cmd: 'InsertUnorderedList' },
                        { start: '- ', cmd: 'InsertUnorderedList' }
                    ],
                    nonbreaking_force_tab: true,
                    // Image
                    // imagetools_toolbar: 'rotateleft rotateright | flipv fliph | editimage imageoptions',
                    images_upload_handler(blobInfo, success, failure) {
                        async function uploadPic() {
                            const url = window.siteUrl + '/itsm/v2/import_picture/'
                            const formData = new FormData()
                            const xhr = new XMLHttpRequest()
                            formData.append('file', blobInfo.blob())
                            xhr.onreadystatechange = () => {
                                if (xhr.readyState === 4) {
                                    try {
                                        const res = JSON.parse(xhr.responseText)
                                        if (res.message === 'success') {
                                            success('itsm/v2/download_rich_file/?file_path=' + res.data.succeed_files.path + '&file_name=' + res.data.succeed_files.name)
                                        } else {
                                            console.log(res.message)
                                        }
                                    } catch (e) {
                                        console.log(e)
                                    }
                                }
                            }
                            const getToken = () => {
                                const DEFAULT_X_CSRFTOKEN = 'NOTPROVIDED'
                                const { cookie } = document
                                if (cookie && typeof cookie === 'string') {
                                    const key = window.CSRF_COOKIE_NAME || 'csrftoken'
                                    const patten = new RegExp(`^${key}=[\S]*`, 'g')
                                    const values = cookie.split(';')
                                    const value = values.find((item) => patten.test(item.trim()))
                                    if (!value) return DEFAULT_X_CSRFTOKEN
                                    return decodeURIComponent(value.split('=')[1] || DEFAULT_X_CSRFTOKEN)
                                }
                                return DEFAULT_X_CSRFTOKEN
                            }
                            xhr.withCredentials = true
                            xhr.open('post', url, true)
                            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
                            // this.$cookie.parse(document.cookie)[window.CSRF_COOKIE_NAME]
                            xhr.setRequestHeader('X-csrfToken', getToken())
                            xhr.send(formData)
                        }
                        if (blobInfo.blob().size > self.maxSize) {
                            failure('文件体积过大')
                        }
                        if (self.accept.indexOf(blobInfo.blob().type) >= 0) {
                            uploadPic()
                        } else {
                            failure('图片格式错误')
                        }
                    },
                    setup: function(editor) {
                        self.editor = editor
                        if (self.type === 'intention') {
                            let timeoutId = null
                            editor.on('selectionchange', function(e) {
                                if (timeoutId) {
                                    clearTimeout(timeoutId)
                                }
                                timeoutId = setTimeout(() => {
                                    const selectedText = editor.selection.getContent({ format: 'text' }) // 获取选中的文本
                                    if (selectedText) {
                                        self.$emit('updateShow', true)
                                    }
                                }, 600)
                            })
                        } else {
                            editor.on('blur', () => {
                                // 获取当前光标位置的书签对象
                                self.cursorBookmark = editor.selection.getBookmark(2, true)
                            })
                        }
                    }
                }
            }
        },
        watch: {
            // 监听内容变化，用于辅助父子组件之间的通讯
            tinyValue(newValue) {
                // tinyvalue是父组件代理人，父组件值一旦变化，推送给子组件
                this.tinymceHtml = newValue
            },
            tinymceHtml(newValue) {
                // tinymceHtml是子组件的值，如果改变，直接反馈给父组件
                //   tinymceinput是父组件中的用于接收子组件的事件（名称写死，用于后面调用）
                this.$emit('tinymceinput', newValue)
            }
        },
        mounted() {
            this.tinymceHtml = this.tinyValue
            tinymce.init({})
        },
        beforeDestroy() {
            // 销毁tinymce
            if (window.tinymce.get(this.tinymceId)) {
                window.tinymce.get(this.tinymceId).destroy()
            }
        },
        methods: {
            addEntity(value) {
                const select = this.editor.selection.getContent({ format: 'text' })
                const temp = `<span style="color: rgb(24,144,255)">[${select}]</span><span style="color: rgb(248,170,4)">(${value})</span>`
                this.editor.selection.setContent(temp)
                this.tinymceHtml = this.editor.getContent()
            },
            addLink(value, href) {
                // const editor = tinymce.activeEditor
                const temp = `<a href="${href}">${value}</a>`
                // 使用保存的光标位置添加内容
                this.editor.selection.moveToBookmark(this.cursorBookmark)
                this.editor.execCommand('mceInsertContent', false, temp)
            },
            addButton(name, value) {
                const temp = `<button style="${this.buttonStyle}">${name}</button> `
                this.editor.selection.moveToBookmark(this.cursorBookmark)
                this.editor.execCommand('mceInsertContent', false, temp)
            }
        }
    }
</script>

<style lang='scss' scoped>
.custom-disable-class {
    position: relative;
    .custom-mask {
        width: calc(100% - 15px);
        position: absolute;
        background-color: rgba(0, 0, 0, 0.02);
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        cursor: not-allowed;
    }
    /deep/ .tox-tiered-menu {
        position: relative !important;
        z-index: 9999 !important;
    }
    /deep/  .tox-listboxfield {
        background-color: #ffff00;
    }
    /deep/  .tox-form .tox-label {
        color: #ffff00;
    }
}
/deep/ .mce-container-body {
    background-color: #ffff00 !important;
    z-index: 9999;
}
</style>

<style lang="scss">
    .tox-tinymce-aux {
        z-index: 9999 !important;
    }
</style>
