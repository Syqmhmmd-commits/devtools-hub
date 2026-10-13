#!/usr/bin/env bash
set -e

# ---------- ROOT ----------
cat > package.json << 'EOF'
{
  "name": "devtools-hub",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter web dev",
    "cli": "pnpm --filter @devtools/cli dev",
    "build": "pnpm -r build"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tsx": "^4.7.0"
  }
}
EOF

cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "packages/*"
  - "apps/*"
EOF

cat > tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "resolveJsonModule": true
  }
}
EOF

cat > .gitignore << 'EOF'
node_modules
.next
dist
*.log
.DS_Store
.env
EOF

# ---------- CORE ----------
mkdir -p packages/core/src
cat > packages/core/package.json << 'EOF'
{
  "name": "@devtools/core",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/core/src/index.ts << 'EOF'
export const VERSION = '0.0.1'
EOF

# ---------- TOOL: BASE64 ----------
mkdir -p packages/tool-base64/src
cat > packages/tool-base64/package.json << 'EOF'
{
  "name": "@devtools/tool-base64",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-base64/src/index.ts << 'EOF'
export function encode(input: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(unescape(encodeURIComponent(input)))
  }
  return Buffer.from(input, 'utf-8').toString('base64')
}

export function decode(input: string): string {
  if (typeof atob !== 'undefined') {
    return decodeURIComponent(escape(atob(input)))
  }
  return Buffer.from(input, 'base64').toString('utf-8')
}
EOF

# ---------- TOOL: JSON ----------
mkdir -p packages/tool-json/src
cat > packages/tool-json/package.json << 'EOF'
{
  "name": "@devtools/tool-json",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-json/src/index.ts << 'EOF'
export type FormatResult =
  | { ok: true; output: string; size: number }
  | { ok: false; error: string }

export function format(input: string, indent = 2): FormatResult {
  try {
    const parsed = JSON.parse(input)
    const output = JSON.stringify(parsed, null, indent)
    return { ok: true, output, size: output.length }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export function minify(input: string): FormatResult {
  try {
    const parsed = JSON.parse(input)
    const output = JSON.stringify(parsed)
    return { ok: true, output, size: output.length }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export function validate(input: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(input)
    return { valid: true }
  } catch (e) {
    return { valid: false, error: (e as Error).message }
  }
}
EOF

# ---------- TOOL: UUID ----------
mkdir -p packages/tool-uuid/src
cat > packages/tool-uuid/package.json << 'EOF'
{
  "name": "@devtools/tool-uuid",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-uuid/src/index.ts << 'EOF'
export function uuidv4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function generate(count = 1): string[] {
  return Array.from({ length: count }, uuidv4)
}

const NANO_CHARS =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

export function nanoid(size = 21): string {
  let id = ''
  const bytes =
    typeof crypto !== 'undefined'
      ? crypto.getRandomValues(new Uint8Array(size))
      : Array.from({ length: size }, () => Math.floor(Math.random() * 256))
  for (let i = 0; i < size; i++) id += NANO_CHARS[bytes[i] & 63]
  return id
}

const ULID_CHARS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export function ulid(): string {
  let timeStr = ''
  let t = Date.now()
  for (let i = 0; i < 10; i++) {
    timeStr = ULID_CHARS[t % 32] + timeStr
    t = Math.floor(t / 32)
  }
  const rand =
    typeof crypto !== 'undefined'
      ? crypto.getRandomValues(new Uint8Array(16))
      : Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))
  let randStr = ''
  for (let i = 0; i < 16; i++) randStr += ULID_CHARS[rand[i] % 32]
  return timeStr + randStr
}
EOF

# ---------- TOOL: HASH ----------
mkdir -p packages/tool-hash/src
cat > packages/tool-hash/package.json << 'EOF'
{
  "name": "@devtools/tool-hash",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-hash/src/index.ts << 'EOF'
export type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export async function hash(
  input: string,
  algorithm: Algorithm = 'SHA-256'
): Promise<string> {
  const data = new TextEncoder().encode(input)
  const buffer = await crypto.subtle.digest(algorithm, data)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashAll(input: string) {
  const algs: Algorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']
  const results = await Promise.all(
    algs.map(async (a) => [a, await hash(input, a)] as const)
  )
  return Object.fromEntries(results) as Record<Algorithm, string>
}
EOF

# ---------- TOOL: TIMESTAMP ----------
mkdir -p packages/tool-timestamp/src
cat > packages/tool-timestamp/package.json << 'EOF'
{
  "name": "@devtools/tool-timestamp",
  "version": "0.0.1",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/tool-timestamp/src/index.ts << 'EOF'
export function now(): number {
  return Math.floor(Date.now() / 1000)
}

export function fromDate(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date
  return Math.floor(d.getTime() / 1000)
}

export function toDate(ts: number): Date {
  return new Date(ts > 1e12 ? ts : ts * 1000)
}

export function format(ts: number, locale = 'id-ID'): string {
  return toDate(ts).toLocaleString(locale, {
    dateStyle: 'full',
    timeStyle: 'long',
  })
}

export function fromNow(ts: number): string {
  const diff = now() - ts
  const abs = Math.abs(diff)
  const units: [number, string][] = [
    [60, 'detik'],
    [60, 'menit'],
    [24, 'jam'],
    [30, 'hari'],
    [12, 'bulan'],
    [Infinity, 'tahun'],
  ]
  let value = abs
  let unit = 'detik'
  for (let i = 0; i < units.length; i++) {
    if (value < units[i][0]) {
      unit = units[i][1]
      break
    }
    value = value / units[i][0]
    unit = units[i][1]
  }
  const rounded = Math.floor(value)
  return diff >= 0
    ? `${rounded} ${unit} yang lalu`
    : `dalam ${rounded} ${unit}`
}
EOF

# ---------- CLI ----------
mkdir -p apps/cli/src
cat > apps/cli/package.json << 'EOF'
{
  "name": "@devtools/cli",
  "version": "0.0.1",
  "type": "module",
  "bin": { "dt": "./dist/index.js" },
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsup src/index.ts --format esm --clean"
  },
  "dependencies": {
    "@devtools/tool-base64": "workspace:*",
    "@devtools/tool-json": "workspace:*",
    "@devtools/tool-uuid": "workspace:*",
    "@devtools/tool-hash": "workspace:*",
    "@devtools/tool-timestamp": "workspace:*",
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "tsx": "^4.7.0"
  }
}
EOF

cat > apps/cli/src/index.ts << 'EOF'
#!/usr/bin/env node
import { Command } from 'commander'
import * as b64 from '@devtools/tool-base64'
import * as json from '@devtools/tool-json'
import * as uuid from '@devtools/tool-uuid'
import * as hash from '@devtools/tool-hash'
import * as ts from '@devtools/tool-timestamp'

const program = new Command()
program.name('dt').description('DevTools Hub CLI').version('0.0.1')

program
  .command('b64 <mode> <input>')
  .description('mode: encode | decode')
  .action((mode, input) => {
    if (mode === 'encode') console.log(b64.encode(input))
    else if (mode === 'decode') console.log(b64.decode(input))
    else console.error('mode harus encode/decode')
  })

program
  .command('json <mode> [file]')
  .description('mode: format | minify | validate')
  .action(async (mode, file) => {
    const fs = await import('node:fs/promises')
    const input = file ? await fs.readFile(file, 'utf-8') : await readStdin()
    if (mode === 'format') {
      const r = json.format(input)
      console.log(r.ok ? r.output : `❌ ${r.error}`)
    } else if (mode === 'minify') {
      const r = json.minify(input)
      console.log(r.ok ? r.output : `❌ ${r.error}`)
    } else if (mode === 'validate') {
      const r = json.validate(input)
      console.log(r.valid ? '✅ Valid JSON' : `❌ ${r.error}`)
    }
  })

program
  .command('uuid')
  .option('-c, --count <n>', 'jumlah', '1')
  .option('-t, --type <type>', 'uuid | nanoid | ulid', 'uuid')
  .action((opts) => {
    const n = parseInt(opts.count)
    if (opts.type === 'uuid') uuid.generate(n).forEach(console.log)
    else if (opts.type === 'nanoid')
      Array.from({ length: n }, () => uuid.nanoid()).forEach(console.log)
    else if (opts.type === 'ulid')
      Array.from({ length: n }, () => uuid.ulid()).forEach(console.log)
  })

program
  .command('hash <input>')
  .option('-a, --algo <algo>', 'SHA-1 | SHA-256 | SHA-384 | SHA-512', 'SHA-256')
  .action(async (input, opts) => {
    console.log(await hash.hash(input, opts.algo))
  })

program
  .command('ts [value]')
  .description('tanpa arg = sekarang')
  .action((value) => {
    if (!value) {
      const n = ts.now()
      console.log(`${n}\n${ts.format(n)}\n${ts.fromNow(n)}`)
    } else if (/^\d+$/.test(value)) {
      const n = parseInt(value)
      console.log(ts.format(n))
      console.log(ts.fromNow(n))
    } else {
      console.log(ts.fromDate(value))
    }
  })

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf-8')
}

program.parse()
EOF

echo "✅ File Batch 1 (CLI + packages) berhasil dibuat!"
