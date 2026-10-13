import { c, ok, err, info, heading, divider, label, value } from './colors.js'

export function banner() {
  console.log()
  console.log(c.bold(c.blue('  ⚡ DevTools Hub')) + c.gray('  v0.0.1'))
  console.log(c.gray('  20 developer tools in your terminal'))
  console.log()
}

export function printJson(obj: unknown, indent = 2) {
  console.log(JSON.stringify(obj, null, indent))
}

export function printKV(label: string, val: string, padWidth = 12) {
  console.log(`  ${label.padEnd(padWidth)} ${value(val)}`)
}

export function printSection(title: string) {
  console.log()
  console.log(`${c.bold(c.blue('▸'))} ${c.bold(title)}`)
  console.log(c.gray('  ' + '─'.repeat(40)))
}

export function printMatch(match: string, index: number, groups?: (string | undefined)[]) {
  console.log(`  ${c.green('▸')} ${c.bold(match)} ${c.gray(`at ${index}`)}`)
  if (groups?.length) {
    groups.forEach((g, i) => {
      if (g !== undefined) console.log(`      ${c.gray(`[${i + 1}]`)} ${c.yellow(g)}`)
    })
  }
}

export function printHash(algo: string, hash: string) {
  console.log(`  ${c.gray(algo.padEnd(10))} ${c.cyan(hash)}`)
}

export function printPassword(password: string, strength: {
  label: string
  score: number
  entropy: number
  crackTime: string
}) {
  console.log()
  console.log(`  ${c.bold(password)}`)
  console.log()
  const colors = [c.red, c.red, c.yellow, c.green, c.green, c.green]
  const colorFn = colors[Math.min(strength.score, 5)]
  console.log(`  ${c.gray('Strength:')} ${colorFn(strength.label)} ${c.gray(`(${strength.score}/5)`)}`)
  console.log(`  ${c.gray('Entropy:')}  ${strength.entropy} bits`)
  console.log(`  ${c.gray('Crack:')}    ${strength.crackTime}`)
}

export function printPalette(hexes: string[]) {
  hexes.forEach((hex) => {
    const bg = hexToAnsiBg(hex)
    console.log(`  ${bg}      ${c.gray(hex)}`)
  })
}

function hexToAnsiBg(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `\x1b[48;2;${r};${g};${b}m`
}

export function printLogo() {
  console.log(c.blue(`
   ╭─────────────────────────────╮
   │   🛠️  DevTools Hub CLI      │
   │   20 tools, 1 command       │
   ╰─────────────────────────────╯
  `))
}

export { c, ok, err, info, heading, divider, label, value }
