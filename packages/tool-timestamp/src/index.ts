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
