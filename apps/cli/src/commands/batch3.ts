import type { Command } from 'commander'
import * as pw from '@devtools/tool-password'
import * as qr from '@devtools/tool-qr'
import * as diff from '@devtools/tool-diff'
import * as lorem from '@devtools/tool-lorem'
import * as url from '@devtools/tool-url'
import * as yaml from '@devtools/tool-yaml'
import * as md from '@devtools/tool-markdown'
import * as slug from '@devtools/tool-slug'
import * as semver from '@devtools/tool-semver'
import * as mime from '@devtools/tool-mime'
import { writeFile } from 'node:fs/promises'

export function registerBatch3(program: Command) {
  program
    .command('pw [length]')
    .description('Generate password')
    .option('--no-symbols', 'tanpa simbol')
    .option('--no-uppercase', 'tanpa huruf besar')
    .option('--no-numbers', 'tanpa angka')
    .option('-e, --exclude-ambiguous', 'exclude karakter ambigu')
    .action((length, opts) => {
      const password = pw.generate({
        length: parseInt(length || '16'),
        symbols: opts.symbols,
        uppercase: opts.uppercase,
        numbers: opts.numbers,
        excludeAmbiguous: opts.excludeAmbiguous,
      })
      console.log(password)
      const s = pw.strength(password)
      console.log(`\nStrength: ${s.label} (${s.score}/5)`)
      console.log(`Entropy: ${s.entropy} bits`)
      console.log(`Crack time: ${s.crackTime}`)
    })

  program
    .command('pwcheck <password>')
    .description('Cek strength password')
    .action((password) => {
      const s = pw.strength(password)
      console.log(`Label: ${s.label} (${s.score}/5)`)
      console.log(`Entropy: ${s.entropy} bits`)
      console.log(`Crack time: ${s.crackTime}`)
      console.log('\nChecks:')
      s.checks.forEach((c) => console.log(`  ${c.ok ? '✅' : '❌'} ${c.label}`))
    })

  program
    .command('qr <text>')
    .description('Generate QR code')
    .option('-o, --out <file>', 'output file', 'qr.png')
    .action(async (text, opts) => {
      const dataUrl = await qr.toDataURL(text)
      const base64 = dataUrl.split(',')[1]
      await writeFile(opts.out, Buffer.from(base64, 'base64'))
      console.log(`✅ QR tersimpan di ${opts.out}`)
    })

  program
    .command('diff <fileA> <fileB>')
    .description('Bandingin 2 file')
    .action(async (fileA, fileB) => {
      const fs = await import('node:fs/promises')
      const a = await fs.readFile(fileA, 'utf-8')
      const b = await fs.readFile(fileB, 'utf-8')
      const lines = diff.diffLines(a, b)
      const stats = diff.diffStats(lines)
      lines.forEach((l) => {
        const prefix = l.type === 'add' ? '+' : l.type === 'remove' ? '-' : ' '
        const color =
          l.type === 'add' ? '\x1b[32m' : l.type === 'remove' ? '\x1b[31m' : '\x1b[90m'
        console.log(`${color}${prefix} ${l.value}\x1b[0m`)
      })
      console.log(`\n+${stats.added} -${stats.removed} (${stats.unchanged} unchanged)`)
    })

  program
    .command('lorem [type] [count]')
    .description('type: words | sentences | paragraphs')
    .action((type = 'paragraphs', count = '3') => {
      const n = parseInt(count)
      if (type === 'words') console.log(lorem.words(n))
      else if (type === 'sentences') console.log(lorem.sentences(n))
      else console.log(lorem.paragraphs(n))
    })

  program
    .command('url <input>')
    .description('Parse URL')
    .action((input) => {
      try {
        const parsed = url.parse(input)
        Object.entries(parsed).forEach(([k, v]) => {
          if (k === 'params') {
            console.log('params:')
            Object.entries(v as Record<string, string>).forEach(([pk, pv]) => {
              console.log(`  ${pk} = ${pv}`)
            })
          } else {
            console.log(`${k.padEnd(10)} ${v}`)
          }
        })
      } catch (e) {
        console.error('❌', (e as Error).message)
      }
    })

  program
    .command('yaml <mode> [file]')
    .description('mode: to-json | to-yaml')
    .action(async (mode, file) => {
      const fs = await import('node:fs/promises')
      const input = file ? await fs.readFile(file, 'utf-8') : await readStdin()
      const r =
        mode === 'to-json'
          ? await yaml.yamlToJson(input)
          : await yaml.jsonToYaml(input)
      console.log(r.ok ? r.output : `❌ ${r.error}`)
    })

  program
    .command('md [file]')
    .description('Render markdown ke HTML')
    .action(async (file) => {
      const fs = await import('node:fs/promises')
      const input = file ? await fs.readFile(file, 'utf-8') : await readStdin()
      const html = await md.render(input)
      const s = md.stats(input)
      console.log(html)
      console.error(`\n# ${s.words} words, ${s.chars} chars, ~${s.readingTime} min read`)
    })

  program
    .command('slug <input>')
    .description('Generate slug')
    .action((input) => {
      const v = slug.variants(input)
      Object.entries(v).forEach(([k, val]) => console.log(`${k.padEnd(12)} ${val}`))
    })

  program
    .command('semver <mode> <a> [b]')
    .description('mode: compare | satisfies | parse | bump')
    .action((mode, a, b) => {
      try {
        if (mode === 'compare') {
          const r = semver.compare(a, b!)
          console.log(r > 0 ? `${a} > ${b}` : r < 0 ? `${a} < ${b}` : `${a} = ${b}`)
        } else if (mode === 'satisfies') {
          console.log(semver.satisfies(a, b!) ? '✅ match' : '❌ tidak match')
        } else if (mode === 'parse') {
          console.log(JSON.stringify(semver.parse(a), null, 2))
        } else if (mode === 'bump') {
          console.log(semver.bump(a, (b as any) || 'patch'))
        }
      } catch (e) {
        console.error('❌', (e as Error).message)
      }
    })

  program
    .command('mime <query>')
    .description('Cari MIME type')
    .action((query) => {
      const exact = mime.lookup(query)
      if (exact) {
        console.log(`${query} → ${exact}`)
      } else {
        const results = mime.search(query)
        if (results.length === 0) return console.log('Tidak ada hasil')
        results.forEach((r) => console.log(`${r.ext.padEnd(10)} → ${r.mime}`))
      }
    })
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf-8')
}
