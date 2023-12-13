import getRandomColor from '../../utils/randomColor'

// 生成图表颜色
const COLOR_LIST = ['84,112,198', '145,204,117', '250,200,88', '238,102,102', '115,192,222', '59,162,114', '252,132,82', '154,96,180', '234,124,204', '50,197,233', '204,117,117', '204,117,181', '163,117,204', '117,154,204', '117,166,204', '117,198,204', '117,204,169', '142,204,117', '193,204,117', '204,147,117']

export const randomColorForLegend = () => {
    const MAX_COLORS_TOTAL = 1000
    const MAX_COLORS_COUNT = 80
    const CUSTOM_COLORS_ROW = 4
    let colors = []
    const opacity = [1, 0.8, 0.6, 0.4]
    for (let i = 0; i < CUSTOM_COLORS_ROW; i++) {
        colors = colors.concat(COLOR_LIST.map(r => `rgba(${r}, ${opacity[i]})`))
    }
    if (MAX_COLORS_TOTAL > MAX_COLORS_COUNT) {
        for (let i = 0; i < MAX_COLORS_TOTAL - MAX_COLORS_COUNT; i++) {
            colors.push(getRandomColor())
        }
    }
    return colors
}
