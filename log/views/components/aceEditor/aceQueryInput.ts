// 给组件添加类名
// eslint-disable
import ace from 'ace-builds/src-noconflict/ace.js'
ace.define('ace/theme/ace-queryinput', ['require', 'exports', 'module', 'ace/lib/dom'], (acequire, exports) => {
    exports.isDark = false
    exports.cssClass = 'ace-queryinput'
    const dom = acequire('../lib/dom')
    dom.importCssString(exports.cssText, exports.cssClass)
})
