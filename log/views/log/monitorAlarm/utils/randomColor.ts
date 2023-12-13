function getRandomColor() {
    let rgb
    do {
        const [hue, saturation, lightness] = [
            Math.floor(Math.random() * 360), // 0-359
            Math.floor(Math.random() * 81) + 10, // 10-90
            Math.floor(Math.random() * 51) + 50, // 50-100
        ]
        const [r, g, b] = hslToRgb(hue, saturation, lightness)
        rgb = { r, g, b }
    } while (
        (rgb.r === 255 && rgb.g === 255 && rgb.b === 255) || // 纯白色
      (rgb.r === rgb.g && rgb.g === rgb.b) || // 灰色
      saturation < 20 || // 饱和度不够
      lightness > 90
    )
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`
}

function hslToRgb(hue, saturation, lightness) {
    const s = saturation / 100
    const l = lightness / 100
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
    const m = l - c / 2
    const p = Math.floor(hue / 60)
    const rgb =
        p === 0
            ? [c, x, 0]
            : p === 1
                ? [x, c, 0]
                : p === 2
                    ? [0, c, x]
                    : p === 3
                        ? [0, x, c]
                        : p === 4
                            ? [x, 0, c]
                            : [c, 0, x]
    return [
        Math.round((rgb[0] + m) * 255),
        Math.round((rgb[1] + m) * 255),
        Math.round((rgb[2] + m) * 255)
    ]
}

export default getRandomColor
