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
