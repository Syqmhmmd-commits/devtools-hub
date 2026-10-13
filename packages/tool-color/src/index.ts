export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '').trim()
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error('Hex tidak valid')
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }: RGB): string {
  const to = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break
      case gn: h = (bn - rn) / d + 2; break
      case bn: h = (rn - gn) / d + 4; break
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = h / 360, sn = s / 100, ln = l / 100
  let r: number, g: number, b: number
  if (sn === 0) {
    r = g = b = ln
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
    const p = 2 * ln - q
    r = hue2rgb(p, q, hn + 1 / 3)
    g = hue2rgb(p, q, hn)
    b = hue2rgb(p, q, hn - 1 / 3)
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

export function luminance({ r, g, b }: RGB): number {
  const a = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

export function contrastRatio(c1: RGB, c2: RGB): number {
  const l1 = luminance(c1), l2 = luminance(c2)
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}

export function wcagLevel(ratio: number): { normal: string; large: string } {
  return {
    normal: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'A' : 'Fail',
    large: ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA' : 'Fail',
  }
}

export function generatePalette(baseHex: string) {
  const rgb = hexToRgb(baseHex)
  const hsl = rgbToHsl(rgb)
  const shades = [95, 85, 70, 55, 45, 35, 25, 15]
  return shades.map((l) => rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l })))
}
