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
