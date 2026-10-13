import type { Command } from 'commander'
import { c } from '../lib/colors.js'

const CATEGORIES = [
  {
    name: 'Encoding & Data',
    icon: '📦',
    tools: [
      { cmd: 'b64 <mode> <input>', desc: 'Encode/decode Base64' },
      { cmd: 'json <mode> [file]', desc: 'Format, minify, validate' },
      { cmd: 'yaml <mode> [file]', desc: 'YAML ↔ JSON' },
      { cmd: 'url <input>', desc: 'Parse URL' },
      { cmd: 'mime <query>', desc: 'Cari MIME type' },
    ],
  },
  {
    name: 'Text',
    icon: '🔤',
    tools: [
      { cmd: 'case <input>', desc: '9 format teks' },
      { cmd: 'slug <input>', desc: 'URL-friendly slug' },
      { cmd: 'regex <pattern> <text>', desc: 'Test regex' },
      { cmd: 'diff <fileA> <fileB>', desc: 'Compare 2 file' },
      { cmd: 'lorem [type] [count]', desc: 'Placeholder text' },
      { cmd: 'md [file]', desc: 'Markdown → HTML' },
    ],
  },
  {
    name: 'Security',
    icon: '🔒',
    tools: [
      { cmd: 'hash <input>', desc: 'SHA-1/256/384/512' },
      { cmd: 'jwt <token>', desc: 'Decode JWT' },
      { cmd: 'pw [length]', desc: 'Generate password' },
      { cmd: 'pwcheck <password>', desc: 'Cek strength' },
    ],
  },
  {
    name: 'Time',
    icon: '⏰',
    tools: [
      { cmd: 'ts [value]', desc: 'Unix timestamp' },
      { cmd: 'cron <expr>', desc: 'Explain cron' },
    ],
  },
  {
    name: 'Design',
    icon: '🎨',
    tools: [
      { cmd: 'color <hex>', desc: 'Konversi + palette' },
      { cmd: 'qr <text>', desc: 'Generate QR code' },
    ],
  },
  {
    name: 'Misc',
    icon: '🆔',
    tools: [
      { cmd: 'uuid', desc: 'UUID/NanoID/ULID' },
      { cmd: 'semver <mode> <a> [b]', desc: 'Compare versi' },
    ],
  },
]

export function registerList(program: Command) {
  program
    .command('list')
    .alias('ls')
    .description('List semua tool')
    .action(() => {
      console.log()
      console.log(c.bold(c.blue('  🛠️  DevTools Hub')) + c.gray('  — 20 tools'))
      console.log()

      for (const cat of CATEGORIES) {
        console.log(`  ${cat.icon}  ${c.bold(c.white(cat.name))}`)
        for (const tool of cat.tools) {
          const cmd = c.cyan(`dt ${tool.cmd}`)
          console.log(`     ${cmd.padEnd(60)} ${c.gray(tool.desc)}`)
        }
        console.log()
      }

      console.log(c.gray('  Tips:'))
      console.log(c.gray('    • Jalanin tanpa arg buat lihat contoh interaktif'))
      console.log(c.gray(`    • ${c.white('dt --help')} buat daftar command lengkap`))
      console.log(c.gray(`    • ${c.white('dt <command> --help')} buat opsi command spesifik`))
      console.log()
    })
}
