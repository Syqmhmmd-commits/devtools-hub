#!/usr/bin/env bash
set -e
cd ~/devtools-hub

# ============================================
# TOOL: PASSWORD
# ============================================
mkdir -p packages/tool-password/src
cat > packages/tool-password/package.json << 'EOF'
{
  "name": "@devtools/tool-password",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-password/src/index.ts << 'EOF'
export interface PasswordOptions {
  length?: number
  uppercase?: boolean
  lowercase?: boolean
  numbers?: boolean
  symbols?: boolean
  excludeAmbiguous?: boolean
}

const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

const AMBIGUOUS = 'Il1O0o'

function randomIndex(max: number): number {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return arr[0] % max
}

export function generate(opts: PasswordOptions = {}): string {
  const {
    length = 16, uppercase = true, lowercase = true,
    numbers = true, symbols = true, excludeAmbiguous = false,
  } = opts
  let pool = ''
  if (uppercase) pool += CHARS.uppercase
  if (lowercase) pool += CHARS.lowercase
  if (numbers) pool += CHARS.numbers
  if (symbols) pool += CHARS.symbols
  if (excludeAmbiguous) pool = pool.split('').filter((c) => !AMBIGUOUS.includes(c)).join('')
  if (!pool) throw new Error('Pilih minimal satu tipe karakter')
  let result = ''
  for (let i = 0; i < length; i++) result += pool[randomIndex(pool.length)]
  return result
}

export interface StrengthResult {
  score: number
  label: string
  entropy: number
  crackTime: string
  checks: { label: string; ok: boolean }[]
}

export function strength(password: string): StrengthResult {
  const checks = [
    { label: 'Panjang ≥ 12', ok: password.length >= 12 },
    { label: 'Huruf kecil', ok: /[a-z]/.test(password) },
    { label: 'Huruf besar', ok: /[A-Z]/.test(password) },
    { label: 'Angka', ok: /[0-9]/.test(password) },
    { label: 'Simbol', ok: /[^a-zA-Z0-9]/.test(password) },
    { label: 'Tidak ada pola umum', ok: !/(123|abc|qwerty|password)/i.test(password) },
  ]
  let poolSize = 0
  if (/[a-z]/.test(password)) poolSize += 26
  if (/[A-Z]/.test(password)) poolSize += 26
  if (/[0-9]/.test(password)) poolSize += 10
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32
  const entropy = password.length > 0 ? password.length * Math.log2(poolSize || 1) : 0
  let score = 0
  if (entropy >= 30) score++
  if (entropy >= 50) score++
  if (entropy >= 70) score++
  if (entropy >= 90) score++
  if (checks.filter((c) => c.ok).length >= 5) score++
  const labels = ['Sangat lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat kuat', 'Super kuat']
  const label = labels[Math.min(score, 5)]
  const guesses = Math.pow(2, entropy)
  const seconds = guesses / 1e10
  return { score, label, entropy: Math.round(entropy), crackTime: formatTime(seconds), checks }
}

function formatTime(seconds: number): string {
  if (seconds < 1) return 'instan'
  if (seconds < 60) return `${Math.round(seconds)} detik`
  if (seconds < 3600) return `${Math.round(seconds / 60)} menit`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} jam`
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} hari`
  const years = seconds / 31536000
  if (years < 1e6) return `${Math.round(years)} tahun`
  if (years < 1e9) return `${Math.round(years / 1e6)} juta tahun`
  return `${(years / 1e9).toExponential(2)} miliar tahun`
}
EOF

# ============================================
# TOOL: QR
# ============================================
mkdir -p packages/tool-qr/src
cat > packages/tool-qr/package.json << 'EOF'
{
  "name": "@devtools/tool-qr",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": { "qrcode": "*" }
}
EOF

cat > packages/tool-qr/src/index.ts << 'EOF'
export interface QROptions {
  size?: number
  margin?: number
  color?: { dark?: string; light?: string }
}

export async function toDataURL(text: string, opts: QROptions = {}): Promise<string> {
  const QRCode = (await import('qrcode')).default
  return QRCode.toDataURL(text, {
    width: opts.size ?? 300,
    margin: opts.margin ?? 2,
    color: {
      dark: opts.color?.dark ?? '#000000',
      light: opts.color?.light ?? '#ffffff',
    },
  })
}

export async function toSVG(text: string, opts: QROptions = {}): Promise<string> {
  const QRCode = (await import('qrcode')).default
  return QRCode.toString(text, {
    type: 'svg',
    width: opts.size ?? 300,
    margin: opts.margin ?? 2,
    color: {
      dark: opts.color?.dark ?? '#000000',
      light: opts.color?.light ?? '#ffffff',
    },
  })
}
EOF

# ============================================
# TOOL: DIFF
# ============================================
mkdir -p packages/tool-diff/src
cat > packages/tool-diff/package.json << 'EOF'
{
  "name": "@devtools/tool-diff",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-diff/src/index.ts << 'EOF'
export interface DiffLine {
  type: 'add' | 'remove' | 'context'
  value: string
  lineA?: number
  lineB?: number
}

export function diffLines(a: string, b: string): DiffLine[] {
  const linesA = a.split('\n')
  const linesB = b.split('\n')
  return diffArrays(linesA, linesB)
}

function diffArrays(a: string[], b: string[]): DiffLine[] {
  const result: DiffLine[] = []
  const n = a.length, m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  let i = 0, j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ type: 'context', value: a[i], lineA: i + 1, lineB: j + 1 })
      i++; j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: 'remove', value: a[i], lineA: i + 1 })
      i++
    } else {
      result.push({ type: 'add', value: b[j], lineB: j + 1 })
      j++
    }
  }
  while (i < n) { result.push({ type: 'remove', value: a[i], lineA: i + 1 }); i++ }
  while (j < m) { result.push({ type: 'add', value: b[j], lineB: j + 1 }); j++ }
  return result
}

export function diffStats(lines: DiffLine[]) {
  return {
    added: lines.filter((l) => l.type === 'add').length,
    removed: lines.filter((l) => l.type === 'remove').length,
    unchanged: lines.filter((l) => l.type === 'context').length,
  }
}
EOF

# ============================================
# TOOL: LOREM
# ============================================
mkdir -p packages/tool-lorem/src
cat > packages/tool-lorem/package.json << 'EOF'
{
  "name": "@devtools/tool-lorem",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-lorem/src/index.ts << 'EOF'
const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ')

function pick(): string { return WORDS[Math.floor(Math.random() * WORDS.length)] }
function capitalize(s: string): string { return s[0].toUpperCase() + s.slice(1) }

export function words(count: number): string {
  return Array.from({ length: count }, pick).join(' ')
}

export function sentences(count: number): string {
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    const wordCount = 8 + Math.floor(Math.random() * 8)
    result.push(capitalize(words(wordCount)) + '.')
  }
  return result.join(' ')
}

export function paragraphs(count: number): string {
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    const sentenceCount = 3 + Math.floor(Math.random() * 3)
    result.push(sentences(sentenceCount))
  }
  return result.join('\n\n')
}
EOF

# ============================================
# TOOL: URL
# ============================================
mkdir -p packages/tool-url/src
cat > packages/tool-url/package.json << 'EOF'
{
  "name": "@devtools/tool-url",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-url/src/index.ts << 'EOF'
export interface ParsedURL {
  protocol: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  params: Record<string, string>
}

export function parse(input: string): ParsedURL {
  const url = new URL(input.includes('://') ? input : `https://${input}`)
  const params: Record<string, string> = {}
  url.searchParams.forEach((v, k) => { params[k] = v })
  return {
    protocol: url.protocol.replace(':', ''),
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? '443' : '80'),
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    origin: url.origin,
    params,
  }
}

export function buildQuery(params: Record<string, string>): string {
  return new URLSearchParams(params).toString()
}

export function parseQuery(query: string): Record<string, string> {
  const clean = query.startsWith('?') ? query.slice(1) : query
  const result: Record<string, string> = {}
  new URLSearchParams(clean).forEach((v, k) => { result[k] = v })
  return result
}
EOF

# ============================================
# TOOL: YAML
# ============================================
mkdir -p packages/tool-yaml/src
cat > packages/tool-yaml/package.json << 'EOF'
{
  "name": "@devtools/tool-yaml",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-yaml/src/index.ts << 'EOF'
export type Result =
  | { ok: true; output: string }
  | { ok: false; error: string }

export async function yamlToJson(yaml: string, indent = 2): Promise<Result> {
  try {
    const jsYaml = await import('js-yaml')
    const parsed = jsYaml.load(yaml)
    return { ok: true, output: JSON.stringify(parsed, null, indent) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function jsonToYaml(json: string): Promise<Result> {
  try {
    const jsYaml = await import('js-yaml')
    const parsed = JSON.parse(json)
    return { ok: true, output: jsYaml.dump(parsed, { indent: 2 }) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
EOF

# ============================================
# TOOL: MARKDOWN
# ============================================
mkdir -p packages/tool-markdown/src
cat > packages/tool-markdown/package.json << 'EOF'
{
  "name": "@devtools/tool-markdown",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-markdown/src/index.ts << 'EOF'
export async function render(md: string): Promise<string> {
  const { marked } = await import('marked')
  return await marked.parse(md)
}

export function stats(md: string) {
  const words = md.trim().split(/\s+/).filter(Boolean).length
  const chars = md.length
  const lines = md.split('\n').length
  const readingTime = Math.max(1, Math.round(words / 200))
  return { words, chars, lines, readingTime }
}
EOF

# ============================================
# TOOL: SLUG
# ============================================
mkdir -p packages/tool-slug/src
cat > packages/tool-slug/package.json << 'EOF'
{
  "name": "@devtools/tool-slug",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-slug/src/index.ts << 'EOF'
export interface SlugOptions {
  separator?: string
  lowercase?: boolean
  maxLength?: number
}

export function slugify(input: string, opts: SlugOptions = {}): string {
  const { separator = '-', lowercase = true, maxLength } = opts
  let slug = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, separator)
    .replace(new RegExp(`${escape(separator)}+`, 'g'), separator)
  if (lowercase) slug = slug.toLowerCase()
  if (maxLength && slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(new RegExp(`${escape(separator)}$`), '')
  }
  return slug
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function variants(input: string) {
  return {
    dash: slugify(input, { separator: '-' }),
    underscore: slugify(input, { separator: '_' }),
    dot: slugify(input, { separator: '.' }),
    'dash-lower': slugify(input, { separator: '-', lowercase: true }),
    'dash-upper': slugify(input, { separator: '-', lowercase: false }),
  }
}
EOF

# ============================================
# TOOL: SEMVER
# ============================================
mkdir -p packages/tool-semver/src
cat > packages/tool-semver/package.json << 'EOF'
{
  "name": "@devtools/tool-semver",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-semver/src/index.ts << 'EOF'
export interface ParsedVersion {
  major: number
  minor: number
  patch: number
  prerelease: string
  build: string
  raw: string
}

export function parse(version: string): ParsedVersion {
  const m = version.trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([^+]+))?(?:\+(.+))?$/)
  if (!m) throw new Error(`Format version tidak valid: ${version}`)
  return {
    major: +m[1], minor: +m[2], patch: +m[3],
    prerelease: m[4] || '', build: m[5] || '', raw: version,
  }
}

export function compare(a: string, b: string): number {
  const va = parse(a), vb = parse(b)
  if (va.major !== vb.major) return va.major - vb.major
  if (va.minor !== vb.minor) return va.minor - vb.minor
  if (va.patch !== vb.patch) return va.patch - vb.patch
  if (!va.prerelease && vb.prerelease) return 1
  if (va.prerelease && !vb.prerelease) return -1
  if (va.prerelease < vb.prerelease) return -1
  if (va.prerelease > vb.prerelease) return 1
  return 0
}

export function satisfies(version: string, range: string): boolean {
  const r = range.trim()
  if (r === '*') return true
  const v = parse(version)
  if (r.startsWith('^')) {
    const min = parse(r.slice(1))
    return compare(version, r.slice(1)) >= 0 && v.major === min.major
  }
  if (r.startsWith('~')) {
    const min = parse(r.slice(1))
    return compare(version, r.slice(1)) >= 0 && v.major === min.major && v.minor === min.minor
  }
  if (r.startsWith('>=')) return compare(version, r.slice(2).trim()) >= 0
  if (r.startsWith('>')) return compare(version, r.slice(1).trim()) > 0
  if (r.startsWith('<=')) return compare(version, r.slice(2).trim()) <= 0
  if (r.startsWith('<')) return compare(version, r.slice(1).trim()) < 0
  return compare(version, r) === 0
}

export function bump(version: string, type: 'major' | 'minor' | 'patch'): string {
  const v = parse(version)
  if (type === 'major') return `${v.major + 1}.0.0`
  if (type === 'minor') return `${v.major}.${v.minor + 1}.0`
  return `${v.major}.${v.minor}.${v.patch + 1}`
}
EOF

# ============================================
# TOOL: MIME
# ============================================
mkdir -p packages/tool-mime/src
cat > packages/tool-mime/package.json << 'EOF'
{
  "name": "@devtools/tool-mime",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-mime/src/index.ts << 'EOF'
export const MIME_MAP: Record<string, string> = {
  html: 'text/html', htm: 'text/html', css: 'text/css',
  js: 'application/javascript', mjs: 'application/javascript',
  json: 'application/json', xml: 'application/xml',
  yaml: 'application/yaml', yml: 'application/yaml',
  csv: 'text/csv', txt: 'text/plain', md: 'text/markdown',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
  ico: 'image/x-icon', avif: 'image/avif',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  pdf: 'application/pdf', zip: 'application/zip',
  gz: 'application/gzip', tar: 'application/x-tar',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf',
  wasm: 'application/wasm', exe: 'application/octet-stream',
  env: 'text/plain', gitignore: 'text/plain', lock: 'text/plain',
}

export function lookup(extOrFile: string): string | null {
  const ext = extOrFile.includes('.')
    ? extOrFile.split('.').pop()!.toLowerCase()
    : extOrFile.toLowerCase()
  return MIME_MAP[ext] ?? null
}

export function search(query: string): { ext: string; mime: string }[] {
  const q = query.toLowerCase()
  return Object.entries(MIME_MAP)
    .filter(([ext, mime]) => ext.includes(q) || mime.toLowerCase().includes(q))
    .map(([ext, mime]) => ({ ext, mime }))
}
EOF

echo "✅ 10 tool packages Batch 3 berhasil dibuat!"
