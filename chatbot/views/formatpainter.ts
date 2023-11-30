// eslint-disable-next-line no-undef
// @ts-ignore
tinymce.PluginManager.add('formatpainter', function(editor, url) {
    const pluginName = '格式刷(Beta)'
    let currentBlockStyle = ''
    let currentNodeStyle = ''
    let currentStrong = false
    let currentEm = false
    let currentH1 = false
    let currentH2 = false
    let currentH3 = false
    let currentH4 = false
    let currentH5 = false
    let currentH6 = false

    let toggleState = false
    // eslint-disable-next-line camelcase
    const strip_tags = function(string) {
        return string.replace(/(<([^>]+)>)/gi, '')
    }
    editor.ui.registry.addIcon('brushes', '<svg t="1614665382680" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1129" width="19" height="19"><path d="M960 448H512v192h32v320a64 64 0 1 1-128 0V640h32v-192a64 64 0 0 1 64-64h448V192h-64V128h64a64 64 0 0 1 64 64v192a64 64 0 0 1-64 64zM64 192H32a32 32 0 1 1 0-64h32V0h832v320H64V192z m64 64h704V64H128v192z" p-id="1130"></path></svg>')
    function _onAction() {
        const dom = editor.dom
        // 这里主要为了获取样式
        if (toggleState === false) {
            let currentContainer = editor.selection.getRng().startContainer
            currentBlockStyle = ''
            currentNodeStyle = ''
            currentStrong = false
            currentEm = false
            currentH1 = false
            while (true) {
                currentContainer = currentContainer.parentNode
                if (currentContainer.nodeName === 'P') {
                    currentBlockStyle = dom.getAttrib(currentContainer, 'style')
                    break
                }

                if (currentContainer.nodeName === 'SPAN') {
                    currentNodeStyle = dom.getAttrib(currentContainer, 'style')
                }
                if (currentContainer.nodeName === 'EM') {
                    currentEm = true
                }
                if (currentContainer.nodeName === 'STRONG') {
                    currentStrong = true
                }
                if (currentContainer.nodeName === 'H1') {
                    currentH1 = true
                    break
                }
                if (currentContainer.nodeName === 'H2') {
                    currentH2 = true
                    break
                }
                if (currentContainer.nodeName === 'H3') {
                    currentH3 = true
                    break
                }
                if (currentContainer.nodeName === 'H4') {
                    currentH4 = true
                    break
                }
                if (currentContainer.nodeName === 'H5') {
                    currentH5 = true
                    break
                }
                if (currentContainer.nodeName === 'H6') {
                    currentH6 = true
                    break
                }
            }
        }
        toggleState = !toggleState
    }
    // Define the Toolbar button
    editor.ui.registry.addButton('formatpainter', {
        icon: 'brushes',
        onAction: _onAction
    })
    editor.ui.registry.addToggleButton('formatpainter', {
        icon: 'brushes',
        tooltip: pluginName,
        onAction: _onAction,
        onSetup: function(api) {
            const selectionchange = function() {
                let currentRange
                // console.log(currentBlockStyle,currentNodeStyle,currentEm,currentStrong)
                let text
                // console.log(editor.selection.getRng());
                const range = editor.selection.getRng()
                const setStyle = function(text) {
                    console.log(currentH1)
                    // 粗体
                    if (currentStrong) {
                        text = '<strong>' + text + '</stong>'
                    }
                    // 斜体
                    if (currentEm) {
                        text = '<em>' + text + '</em>'
                    }
                    if (currentNodeStyle) {
                        text = '<span style=\'' + currentNodeStyle + '\'>' + text + '</span>'
                    }
                    if (currentH1) {
                        text = '<h1>' + text + '</h1>'
                    }
                    if (currentH2) {
                        text = '<h2>' + text + '</h2>'
                    }
                    if (currentH3) {
                        text = '<h3>' + text + '</h3>'
                    }
                    if (currentH4) {
                        text = '<h4>' + text + '</h4>'
                    }
                    if (currentH5) {
                        text = '<h5>' + text + '</h5>'
                    }
                    if (currentH6) {
                        text = '<h6>' + text + '</h6>'
                    }
                    console.log(text)
                    return text
                }
                if (toggleState === true) {
                    // 应用样式到选中的range中
                    const blocks = editor.selection.getSelectedBlocks()
                    for (let i = 0; i < blocks.length; i++) {
                        // 先应用段落的样式
                        editor.dom.setAttrib(blocks[i], 'style', currentBlockStyle)
                        // 如果是第一个
                        if (i === 0) {
                            // 如果同一个container
                            if (range.startContainer === range.endContainer) {
                                text = editor.selection.getContent({ format: 'text' })
                                editor.selection.setContent(setStyle(text))
                            } else {
                                // 否则构造一个select让其选中当前block的最后一个
                                currentRange = range.cloneRange()
                                let lastNode = range.startContainer
                                while (true) {
                                    const nextNode = editor.dom.getNext(lastNode, function(node) {
                                        return true
                                    })
                                    // console.log(nextNode)
                                    if (editor.dom.isChildOf(nextNode, blocks[i])) {
                                        lastNode = nextNode
                                    } else {
                                        break
                                    }
                                }
                                currentRange.setEnd(lastNode, lastNode.length)
                                // console.log(currentRange)
                                editor.selection.setRng(currentRange)
                                text = editor.selection.getContent({format: 'text'})
                                editor.selection.setContent(setStyle(text))
                                // 把范围设置回去
                                editor.selection.setRng(range)
                            }
                        } else if (blocks.length - 1 === i && blocks.length > 1) {
                            // 否则构造一个select让其选中当前block的最开始那个
                            currentRange = range.cloneRange()
                            let startNode = range.endContainer
                            while (true) {
                                const prevNode = editor.dom.getPrev(startNode, function(node) {
                                    return true
                                })
                                if (editor.dom.isChildOf(prevNode, blocks[i])) {
                                    startNode = prevNode
                                } else {
                                    break
                                }
                            }
                            currentRange.setStart(startNode, 0)
                            editor.selection.setRng(currentRange)
                            text = editor.selection.getContent({ format: 'text' })
                            editor.selection.setContent(setStyle(text))
                            // 把范围设置回去
                            editor.selection.setRng(range)
                        } else {
                            // 如果是夹在中间的则所有文字应用样式
                            text = strip_tags(blocks[i].innerHTML)
                            blocks[i].innerHTML = setStyle(text)
                            // 如果已经有span标签了
                            // 如果是最后一个,且不是只选中了一个
                        }
                    }
                    toggleState = false
                    currentBlockStyle = ''
                    currentNodeStyle = ''
                    currentStrong = false
                    currentEm = false
                }
            }
            api.setActive(toggleState)
            editor.on('mouseup', selectionchange)
            return function() {
                editor.off('mouseup', selectionchange)
            }
        }
    })
    // Return details to be displayed in TinyMCE's "Help" plugin, if you use it
    // This is optional.
    return {
        getMetadata: function() {
            return {
                name: 'formatpainter'
            }
        }
    }
})
