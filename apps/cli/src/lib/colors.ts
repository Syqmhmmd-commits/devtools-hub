// ANSI colors - zero dependency
const esc = (code: string) => (s: string) => `\x1b[${code}m${s}\x1b[0m`

export const c = {
  bold: esc('1'),
  dim: esc('2'),
  italic: esc('3'),
  underline: esc('4'),
  red: esc('31'),
  green: esc('32'),
  yellow: esc('33'),
  blue: esc('34'),
  magenta: esc('35'),
  cyan: esc('36'),
  white: esc('37'),
  gray: esc('90'),
  bgBlue: esc('44'),
  bgGreen: esc('42'),
  bgRed: esc('41'),
  reset: '\x1b[0m',
}

export const ok = (s: string) => `${c.green('✓')} ${s}`
export const err = (s: string) => `${c.red('✗')} ${s}`
export const info = (s: string) => `${c.blue('ℹ')} ${s}`
export const warn = (s: string) => `${c.yellow('⚠')} ${s}`
export const label = (s: string) => c.gray(s)
export const value = (s: string) => c.cyan(s)
export const heading = (s: string) => `\n${c.bold(c.blue(s))}`
export const divider = () => c.gray('─'.repeat(50))
