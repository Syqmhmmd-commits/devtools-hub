#!/usr/bin/env node
import { Command } from 'commander'
import * as b64 from '@devtools/tool-base64'
import * as json from '@devtools/tool-json'
import * as uuid from '@devtools/tool-uuid'
import * as hash from '@devtools/tool-hash'
import * as ts from '@devtools/tool-timestamp'
import * as jwt from '@devtools/tool-jwt'
import * as color from '@devtools/tool-color'
import * as regex from '@devtools/tool-regex'
import * as cron from '@devtools/tool-cron'
import * as ccase from '@devtools/tool-case'
import { registerBatch3 } from './commands/batch3.js'

const program = new Command()
program.name('dt').description('DevTools Hub CLI').version('0.0.1')

// ---------- Batch 1 ----------
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
    let list: string[] = []
    if (opts.type === 'uuid') list = uuid.generate(n)
    else if (opts.type === 'nanoid') list = Array.from({ length: n }, () => uuid.nanoid())
    else if (opts.type === 'ulid') list = Array.from({ length: n }, () => uuid.ulid())
    list.forEach((x) => console.log(x))
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

// ---------- Batch 2 ----------
program
  .command('jwt <token>')
  .description('Decode JWT')
  .action((token) => {
    try {
      const d = jwt.decode(token)
      console.log(JSON.stringify(d, null, 2))
      const exp = jwt.expiresIn(token)
      if (exp !== null) console.log('\n' + jwt.formatDuration(exp))
    } catch (e) {
      console.error('❌', (e as Error).message)
    }
  })

program
  .command('color <hex>')
  .description('Konversi warna + palette')
  .action((hex) => {
    try {
      const rgb = color.hexToRgb(hex)
      const hsl = color.rgbToHsl(rgb)
      console.log(`HEX: ${color.rgbToHex(rgb)}`)
      console.log(`RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)
      console.log(`HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)
      console.log('\nPalette:')
      color.generatePalette(hex).forEach((c) => console.log('  ' + c))
    } catch (e) {
      console.error('❌', (e as Error).message)
    }
  })

program
  .command('regex <pattern> <text>')
  .description('Test regex')
  .option('-f, --flags <flags>', 'flags', 'g')
  .action((pattern, text, opts) => {
    const r = regex.testRegex(pattern, opts.flags, text)
    if (!r.ok) return console.error('❌', r.error)
    if (r.matches.length === 0) return console.log('Tidak ada match')
    r.matches.forEach((m) => {
      console.log(`Match: "${m.match}" di index ${m.index}`)
      if (m.groups.length) console.log('  Groups:', m.groups)
    })
  })

program
  .command('cron <expr>')
  .description('Explain cron expression')
  .action((expr) => {
    const r = cron.parseCron(expr)
    if (!r.ok) return console.error('❌', r.error)
    r.fields.forEach((f) => console.log(`  ${f.raw.padEnd(15)} → ${f.desc}`))
    console.log('\nNext 5 runs:')
    r.next.forEach((d) => console.log('  ' + cron.formatNext(d)))
  })

program
  .command('case <input>')
  .description('Convert text case')
  .action((input) => {
    const r = ccase.allCases(input)
    Object.entries(r).forEach(([k, v]) => console.log(`${k.padEnd(15)} ${v}`))
  })

// ---------- helpers ----------
async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf-8')
}

registerBatch3(program)

program.parse()
