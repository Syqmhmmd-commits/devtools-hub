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
import { registerList } from './commands/list.js'
import { banner, c } from './lib/output.js'

const program = new Command()
program.name('dt').description('DevTools Hub CLI').version('0.0.1')

// ========== Batch 1 ==========

program
  .command('b64 <mode> <input>')
  .description('mode: encode | decode')
  .action((mode, input) => {
    if (mode === 'encode') {
      console.log()
      console.log(`  ${c.gray('input:')}  ${input}`)
      console.log(`  ${c.gray('base64:')} ${c.cyan(b64.encode(input))}`)
      console.log()
    } else if (mode === 'decode') {
      console.log()
      console.log(`  ${c.gray('base64:')} ${input}`)
      console.log(`  ${c.gray('output:')} ${c.cyan(b64.decode(input))}`)
      console.log()
    } else {
      console.error(`  ${c.red('✗')} mode harus ${c.bold('encode')} atau ${c.bold('decode')}`)
    }
  })

program
  .command('json <mode> [file]')
  .description('mode: format | minify | validate')
  .action(async (mode, file) => {
    const fs = await import('node:fs/promises')
    const input = file ? await fs.readFile(file, 'utf-8') : await readStdin()
    if (mode === 'format') {
      const r = json.format(input)
      if (r.ok) {
        console.log(r.output)
        console.log(c.gray(`\n  ${r.size} bytes`))
      } else console.error(`  ${c.red('✗')} ${r.error}`)
    } else if (mode === 'minify') {
      const r = json.minify(input)
      if (r.ok) {
        console.log(r.output)
        console.log(c.gray(`\n  ${r.size} bytes`))
      } else console.error(`  ${c.red('✗')} ${r.error}`)
    } else if (mode === 'validate') {
      const r = json.validate(input)
      console.log(r.valid ? `  ${c.green('✓')} Valid JSON` : `  ${c.red('✗')} ${r.error}`)
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
    console.log()
    list.forEach((id) => console.log(`  ${c.cyan(id)}`))
    console.log()
  })

program
  .command('hash <input>')
  .option('-a, --algo <algo>', 'SHA-1 | SHA-256 | SHA-384 | SHA-512')
  .action(async (input, opts) => {
    if (opts.algo) {
      const h = await hash.hash(input, opts.algo)
      console.log()
      console.log(`  ${c.gray(opts.algo.padEnd(10))} ${c.cyan(h)}`)
      console.log()
    } else {
      const results = await hash.hashAll(input)
      console.log()
      console.log(`  ${c.gray('input:')} ${input}`)
      console.log()
      Object.entries(results).forEach(([algo, h]) => {
        console.log(`  ${c.blue('▸')} ${c.bold(algo.padEnd(8))} ${c.cyan(h)}`)
      })
      console.log()
    }
  })

program
  .command('ts [value]')
  .description('tanpa arg = sekarang')
  .action((value) => {
    console.log()
    if (!value) {
      const n = ts.now()
      console.log(`  ${c.gray('Unix:')}   ${c.cyan(String(n))}`)
      console.log(`  ${c.gray('Date:')}   ${ts.format(n)}`)
      console.log(`  ${c.gray('Human:')}  ${ts.fromNow(n)}`)
    } else if (/^\d+$/.test(value)) {
      const n = parseInt(value)
      console.log(`  ${c.gray('Unix:')}   ${value}`)
      console.log(`  ${c.gray('Date:')}   ${ts.format(n)}`)
      console.log(`  ${c.gray('Human:')}  ${ts.fromNow(n)}`)
    } else {
      const n = ts.fromDate(value)
      console.log(`  ${c.gray('Input:')}  ${value}`)
      console.log(`  ${c.gray('Unix:')}   ${c.cyan(String(n))}`)
    }
    console.log()
  })

// ========== Batch 2 ==========

program
  .command('jwt <token>')
  .description('Decode JWT')
  .action((token) => {
    try {
      const d = jwt.decode(token)
      console.log()
      console.log(`  ${c.blue('▸')} ${c.bold('Header')}`)
      console.log(JSON.stringify(d.header, null, 2).split('\n').map((l) => `    ${l}`).join('\n'))
      console.log()
      console.log(`  ${c.blue('▸')} ${c.bold('Payload')}`)
      console.log(JSON.stringify(d.payload, null, 2).split('\n').map((l) => `    ${l}`).join('\n'))
      console.log()
      const exp = jwt.expiresIn(token)
      if (exp !== null) {
        const expired = exp < 0
        const status = expired ? c.red('✗ expired') : c.green('✓ valid')
        console.log(`  ${status}  ${c.gray(jwt.formatDuration(exp))}`)
        console.log()
      }
    } catch (e) {
      console.error(`  ${c.red('✗')} ${(e as Error).message}`)
    }
  })

program
  .command('color <hex>')
  .description('Konversi warna + palette')
  .action((hex) => {
    try {
      const rgb = color.hexToRgb(hex)
      const hsl = color.rgbToHsl(rgb)
      const cleanHex = color.rgbToHex(rgb)
      const swatch = hexToAnsiBg(cleanHex)
      console.log()
      console.log(`  ${swatch}          ${c.reset || ''}  ${c.bold(cleanHex)}`)
      console.log()
      console.log(`  ${c.gray('HEX:')}  ${c.cyan(cleanHex)}`)
      console.log(`  ${c.gray('RGB:')}  ${c.cyan(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}`)
      console.log(`  ${c.gray('HSL:')}  ${c.cyan(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}`)
      console.log()
      console.log(`  ${c.blue('▸')} ${c.bold('Palette')}`)
      const palette = color.generatePalette(hex)
      palette.forEach((ph) => {
        const bg = hexToAnsiBg(ph)
        console.log(`    ${bg}      ${c.reset || ''}  ${c.gray(ph)}`)
      })
      console.log()
    } catch (e) {
      console.error(`  ${c.red('✗')} ${(e as Error).message}`)
    }
  })

program
  .command('regex <pattern> <text>')
  .description('Test regex')
  .option('-f, --flags <flags>', 'flags', 'g')
  .action((pattern, text, opts) => {
    const r = regex.testRegex(pattern, opts.flags, text)
    if (!r.ok) return console.error(`  ${c.red('✗')} ${r.error}`)
    console.log()
    console.log(`  ${c.gray('pattern:')} ${c.magenta(pattern)}`)
    console.log(`  ${c.gray('flags:')}   ${c.magenta(opts.flags)}`)
    console.log()
    if (r.matches.length === 0) {
      console.log(`  ${c.yellow('⚠')} Tidak ada match`)
    } else {
      console.log(`  ${c.blue('▸')} ${c.bold(`${r.matches.length} match`)}`)
      r.matches.forEach((m) => {
        console.log(`    ${c.green('▸')} ${c.bold(m.match)}  ${c.gray(`at ${m.index}`)}`)
        if (m.groups.length) {
          m.groups.forEach((g, i) => {
            if (g !== undefined) console.log(`        ${c.gray(`[${i + 1}]`)} ${c.yellow(g)}`)
          })
        }
      })
    }
    console.log()
  })

program
  .command('cron <expr>')
  .description('Explain cron expression')
  .action((expr) => {
    const r = cron.parseCron(expr)
    if (!r.ok) return console.error(`  ${c.red('✗')} ${r.error}`)
    console.log()
    console.log(`  ${c.gray('expression:')} ${c.magenta(expr)}`)
    console.log()
    const labels = ['Menit', 'Jam', 'Tanggal', 'Bulan', 'Hari']
    r.fields.forEach((f, i) => {
      console.log(`  ${c.blue('▸')} ${c.bold(labels[i].padEnd(8))} ${c.cyan(f.raw.padEnd(15))} ${c.gray(f.desc)}`)
    })
    console.log()
    console.log(`  ${c.blue('▸')} ${c.bold('Next 5 runs')}`)
    r.next.forEach((d) => console.log(`    ${c.gray('•')} ${cron.formatNext(d)}`))
    console.log()
  })

program
  .command('case <input>')
  .description('Convert text case')
  .action((input) => {
    const r = ccase.allCases(input)
    console.log()
    console.log(`  ${c.gray('input:')} ${input}`)
    console.log()
    Object.entries(r).forEach(([k, v]) => {
      console.log(`  ${c.blue('▸')} ${c.bold(k.padEnd(16))} ${c.cyan(v)}`)
    })
    console.log()
  })

// ========== Batch 3 ==========
registerBatch3(program)
registerList(program)

// ========== Helpers ==========
async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf-8')
}

function hexToAnsiBg(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `\x1b[48;2;${r};${g};${b}m`
}

if (process.argv.length <= 2) {
  banner()
  program.help()
}

program.parse()
