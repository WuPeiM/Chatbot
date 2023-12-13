// 日志搜索着色器处理
export const replaceLabel = (str: any) => {
    const regex = /(<span\s+class="log-message-shader">[\s\S]*?<\/span>)|(<(\/?[a-zA-Z]+)[^>]*>)/g
    return String(str).replace(regex, (match, p1, p2, p3) => {
        return p1 || `&lt;${p3}&gt;`
    })
}

// 把含有类名为log-message-shader的span标签的内容替换为原始内容
export const replaceShader = (str: any) => {
    const regex = /<span\s+class="log-message-shader">([\s\S]*?)<\/span>/g
    return String(str).replace(regex, (match, p1) => {
        return p1
    }).replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}
