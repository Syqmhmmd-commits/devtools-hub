#!/usr/bin/env bash
set -e
cd ~/devtools-hub

# ============================================
# TOOL: JWT
# ============================================
mkdir -p packages/tool-jwt/src
cat > packages/tool-jwt/package.json << 'EOF'
{
  "name": "@devtools/tool-jwt",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-jwt/src/index.ts << 'EOF'
export interface DecodedJWT {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

function base64UrlDecode(str: string): string {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4))
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/')
  if (typeof atob !== 'undefined') {
    return decodeURIComponent(escape(atob(b64)))
  }
  return Buffer.from(b64, 'base64').toString('utf-8')
}

export function decode(token: string): DecodedJWT {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('JWT harus punya 3 bagian (header.payload.signature)')
  }
  const [h, p, s] = parts
  return {
    header: JSON.parse(base64UrlDecode(h)),
    payload: JSON.parse(base64UrlDecode(p)),
    signature: s,
  }
}

export function isExpired(token: string): boolean {
  try {
    const { payload } = decode(token)
    if (typeof payload.exp !== 'number') return false
    return payload.exp * 1000 < Date.now()
  } catch {
    return false
  }
}

export function expiresIn(token: string): number | null {
  try {
    const { payload } = decode(token)
    if (typeof payload.exp !== 'number') return null
    return payload.exp * 1000 - Date.now()
  } catch {
    return null
  }
}

export function formatDuration(ms: number): string {
  const abs = Math.abs(ms)
  const sec = Math.floor(abs / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  let out = ''
  if (day > 0) out = `${day} hari`
  else if (hr > 0) out = `${hr} jam`
  else if (min > 0) out = `${min} menit`
  else out = `${sec} detik`
  return ms >= 0 ? `expired dalam ${out}` : `sudah expired ${out} lalu`
}
EOF

# ============================================
# TOOL: COLOR
# ============================================
mkdir -p packages/tool-color/src
cat > packages/tool-color/package.json << 'EOF'
{
  "name": "@devtools/tool-color",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-color/src/index.ts << 'EOF'
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
EOF

# ============================================
# TOOL: REGEX
# ============================================
mkdir -p packages/tool-regex/src
cat > packages/tool-regex/package.json << 'EOF'
{
  "name": "@devtools/tool-regex",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-regex/src/index.ts << 'EOF'
export interface MatchResult {
  match: string
  index: number
  groups: (string | undefined)[]
}

export interface TestResult {
  ok: boolean
  matches: MatchResult[]
  error?: string
}

export function testRegex(pattern: string, flags: string, text: string): TestResult {
  try {
    const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
    const matches: MatchResult[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      matches.push({
        match: m[0],
        index: m.index,
        groups: m.slice(1),
      })
      if (m.index === re.lastIndex) re.lastIndex++
      if (!flags.includes('g')) break
    }
    return { ok: true, matches }
  } catch (e) {
    return { ok: false, matches: [], error: (e as Error).message }
  }
}

export interface Token {
  raw: string
  type: string
  desc: string
}

export function explain(pattern: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < pattern.length) {
    const c = pattern[i]
    if (c === '\\' && i + 1 < pattern.length) {
      const next = pattern[i + 1]
      const map: Record<string, string> = {
        d: 'digit (0-9)',
        D: 'bukan digit',
        w: 'word char (a-z, A-Z, 0-9, _)',
        W: 'bukan word char',
        s: 'whitespace',
        S: 'bukan whitespace',
        b: 'word boundary',
        B: 'bukan word boundary',
        n: 'newline',
        t: 'tab',
        r: 'carriage return',
      }
      tokens.push({
        raw: c + next,
        type: 'escape',
        desc: map[next] || `literal "${next}"`,
      })
      i += 2
      continue
    }
    if (c === '^') { tokens.push({ raw: c, type: 'anchor', desc: 'awal string/baris' }); i++; continue }
    if (c === '$') { tokens.push({ raw: c, type: 'anchor', desc: 'akhir string/baris' }); i++; continue }
    if (c === '.') { tokens.push({ raw: c, type: 'wildcard', desc: 'karakter apa saja (kecuali newline)' }); i++; continue }
    if (c === '*') { tokens.push({ raw: c, type: 'quantifier', desc: '0 atau lebih dari token sebelumnya' }); i++; continue }
    if (c === '+') { tokens.push({ raw: c, type: 'quantifier', desc: '1 atau lebih' }); i++; continue }
    if (c === '?') { tokens.push({ raw: c, type: 'quantifier', desc: '0 atau 1 (opsional)' }); i++; continue }
    if (c === '|') { tokens.push({ raw: c, type: 'alternation', desc: 'atau' }); i++; continue }
    if (c === '(') {
      const named = pattern.slice(i).match(/^\(\?<([^>]+)>/)
      if (named) {
        tokens.push({ raw: named[0], type: 'group', desc: `capture group "${named[1]}"` })
        i += named[0].length
      } else {
        tokens.push({ raw: c, type: 'group', desc: 'buka capture group' })
        i++
      }
      continue
    }
    if (c === ')') { tokens.push({ raw: c, type: 'group', desc: 'tutup capture group' }); i++; continue }
    if (c === '[') {
      const end = pattern.indexOf(']', i)
      if (end !== -1) {
        tokens.push({ raw: pattern.slice(i, end + 1), type: 'class', desc: 'character class' })
        i = end + 1
        continue
      }
    }
    if (c === '{') {
      const end = pattern.indexOf('}', i)
      if (end !== -1) {
        tokens.push({ raw: pattern.slice(i, end + 1), type: 'quantifier', desc: 'range kuantitas' })
        i = end + 1
        continue
      }
    }
    tokens.push({ raw: c, type: 'literal', desc: `literal "${c}"` })
    i++
  }
  return tokens
}

export const COMMON_PATTERNS = [
  { name: 'Email', pattern: '^[\\w.-]+@[\\w.-]+\\.\\w+$' },
  { name: 'URL', pattern: '^https?:\\/\\/[^\\s]+$' },
  { name: 'Nomor HP (ID)', pattern: '^(\\+62|62|0)8[1-9][0-9]{6,10}$' },
  { name: 'Tanggal (YYYY-MM-DD)', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
  { name: 'IP Address', pattern: '^(\\d{1,3}\\.){3}\\d{1,3}$' },
  { name: 'Hex Color', pattern: '^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$' },
]
EOF

# ============================================
# TOOL: CRON
# ============================================
mkdir -p packages/tool-cron/src
cat > packages/tool-cron/package.json << 'EOF'
{
  "name": "@devtools/tool-cron",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-cron/src/index.ts << 'EOF'
export interface CronField {
  raw: string
  values: number[]
  desc: string
}

const FIELDS = [
  { name: 'menit', min: 0, max: 59 },
  { name: 'jam', min: 0, max: 23 },
  { name: 'tanggal', min: 1, max: 31 },
  { name: 'bulan', min: 1, max: 12 },
  { name: 'hari', min: 0, max: 6 },
]

export function parseCron(expr: string): { ok: true; fields: CronField[]; next: Date[] } | { ok: false; error: string } {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) {
    return { ok: false, error: 'Cron harus punya 5 field: menit jam tanggal bulan hari' }
  }
  const fields: CronField[] = []
  for (let i = 0; i < 5; i++) {
    const f = FIELDS[i]
    const parsed = parseField(parts[i], f.min, f.max)
    if ('error' in parsed) return { ok: false, error: `${f.name}: ${parsed.error}` }
    fields.push({ raw: parts[i], values: parsed.values, desc: describe(parts[i], f.name) })
  }
  const next = getNextRuns(fields, 5)
  return { ok: true, fields, next }
}

function parseField(raw: string, min: number, max: number): { values: number[] } | { error: string } {
  if (raw === '*') {
    return { values: Array.from({ length: max - min + 1 }, (_, i) => min + i) }
  }
  const values = new Set<number>()
  for (const part of raw.split(',')) {
    const stepMatch = part.match(/^(\*|\d+(?:-\d+)?)\/(\d+)$/)
    if (stepMatch) {
      const step = parseInt(stepMatch[2])
      let start = min, end = max
      if (stepMatch[1] !== '*') {
        const range = stepMatch[1].split('-').map(Number)
        start = range[0]
        end = range[1] ?? max
      }
      for (let v = start; v <= end; v += step) values.add(v)
      continue
    }
    const rangeMatch = part.match(/^(\d+)-(\d+)$/)
    if (rangeMatch) {
      const a = parseInt(rangeMatch[1]), b = parseInt(rangeMatch[2])
      if (a < min || b > max || a > b) return { error: `range ${part} di luar ${min}-${max}` }
      for (let v = a; v <= b; v++) values.add(v)
      continue
    }
    if (/^\d+$/.test(part)) {
      const v = parseInt(part)
      if (v < min || v > max) return { error: `nilai ${v} di luar ${min}-${max}` }
      values.add(v)
      continue
    }
    return { error: `format tidak dikenal: ${part}` }
  }
  return { values: Array.from(values).sort((a, b) => a - b) }
}

function describe(raw: string, fieldName: string): string {
  if (raw === '*') return `setiap ${fieldName}`
  const stepMatch = raw.match(/^\*\/(\d+)$/)
  if (stepMatch) return `setiap ${stepMatch[1]} ${fieldName}`
  if (/^\d+$/.test(raw)) return `${fieldName} ke-${raw}`
  if (raw.includes(',')) return `${fieldName}: ${raw.split(',').join(', ')}`
  if (raw.includes('-')) return `${fieldName} ${raw}`
  return raw
}

function getNextRuns(fields: CronField[], count: number): Date[] {
  const results: Date[] = []
  const d = new Date()
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() + 1)
  const limit = 366 * 24 * 60
  let iter = 0
  while (results.length < count && iter < limit) {
    if (
      fields[0].values.includes(d.getMinutes()) &&
      fields[1].values.includes(d.getHours()) &&
      fields[2].values.includes(d.getDate()) &&
      fields[3].values.includes(d.getMonth() + 1) &&
      fields[4].values.includes(d.getDay())
    ) {
      results.push(new Date(d))
    }
    d.setMinutes(d.getMinutes() + 1)
    iter++
  }
  return results
}

export function formatNext(d: Date): string {
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}
EOF

# ============================================
# TOOL: CASE CONVERTER
# ============================================
mkdir -p packages/tool-case/src
cat > packages/tool-case/package.json << 'EOF'
{
  "name": "@devtools/tool-case",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-case/src/index.ts << 'EOF'
function words(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
}

export function camelCase(input: string): string {
  const w = words(input)
  return w.map((x, i) => (i === 0 ? x : x[0].toUpperCase() + x.slice(1))).join('')
}

export function pascalCase(input: string): string {
  return words(input).map((x) => x[0].toUpperCase() + x.slice(1)).join('')
}

export function snakeCase(input: string): string {
  return words(input).join('_')
}

export function kebabCase(input: string): string {
  return words(input).join('-')
}

export function constantCase(input: string): string {
  return words(input).join('_').toUpperCase()
}

export function dotCase(input: string): string {
  return words(input).join('.')
}

export function titleCase(input: string): string {
  return words(input).map((x) => x[0].toUpperCase() + x.slice(1)).join(' ')
}

export function sentenceCase(input: string): string {
  const w = words(input)
  if (w.length === 0) return ''
  return [w[0][0].toUpperCase() + w[0].slice(1), ...w.slice(1)].join(' ')
}

export function slug(input: string): string {
  return words(input).join('-')
}

export function allCases(input: string) {
  return {
    camelCase: camelCase(input),
    PascalCase: pascalCase(input),
    snake_case: snakeCase(input),
    'kebab-case': kebabCase(input),
    CONSTANT_CASE: constantCase(input),
    'dot.case': dotCase(input),
    'Title Case': titleCase(input),
    'Sentence case': sentenceCase(input),
    slug: slug(input),
  }
}
EOF

echo "✅ 5 tool packages berhasil dibuat!"
