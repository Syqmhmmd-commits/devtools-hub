export interface PasswordOptions {
  length?: number
  uppercase?: boolean
  lowercase?: boolean
  numbers?: boolean
  symbols?: boolean
  excludeAmbiguous?: boolean
}

const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

const AMBIGUOUS = 'Il1O0o'

function randomIndex(max: number): number {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return arr[0] % max
}

export function generate(opts: PasswordOptions = {}): string {
  const {
    length = 16, uppercase = true, lowercase = true,
    numbers = true, symbols = true, excludeAmbiguous = false,
  } = opts
  let pool = ''
  if (uppercase) pool += CHARS.uppercase
  if (lowercase) pool += CHARS.lowercase
  if (numbers) pool += CHARS.numbers
  if (symbols) pool += CHARS.symbols
  if (excludeAmbiguous) pool = pool.split('').filter((c) => !AMBIGUOUS.includes(c)).join('')
  if (!pool) throw new Error('Pilih minimal satu tipe karakter')
  let result = ''
  for (let i = 0; i < length; i++) result += pool[randomIndex(pool.length)]
  return result
}

export interface StrengthResult {
  score: number
  label: string
  entropy: number
  crackTime: string
  checks: { label: string; ok: boolean }[]
}

export function strength(password: string): StrengthResult {
  const checks = [
    { label: 'Panjang ≥ 12', ok: password.length >= 12 },
    { label: 'Huruf kecil', ok: /[a-z]/.test(password) },
    { label: 'Huruf besar', ok: /[A-Z]/.test(password) },
    { label: 'Angka', ok: /[0-9]/.test(password) },
    { label: 'Simbol', ok: /[^a-zA-Z0-9]/.test(password) },
    { label: 'Tidak ada pola umum', ok: !/(123|abc|qwerty|password)/i.test(password) },
  ]
  let poolSize = 0
  if (/[a-z]/.test(password)) poolSize += 26
  if (/[A-Z]/.test(password)) poolSize += 26
  if (/[0-9]/.test(password)) poolSize += 10
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32
  const entropy = password.length > 0 ? password.length * Math.log2(poolSize || 1) : 0
  let score = 0
  if (entropy >= 30) score++
  if (entropy >= 50) score++
  if (entropy >= 70) score++
  if (entropy >= 90) score++
  if (checks.filter((c) => c.ok).length >= 5) score++
  const labels = ['Sangat lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat kuat', 'Super kuat']
  const label = labels[Math.min(score, 5)]
  const guesses = Math.pow(2, entropy)
  const seconds = guesses / 1e10
  return { score, label, entropy: Math.round(entropy), crackTime: formatTime(seconds), checks }
}

function formatTime(seconds: number): string {
  if (seconds < 1) return 'instan'
  if (seconds < 60) return `${Math.round(seconds)} detik`
  if (seconds < 3600) return `${Math.round(seconds / 60)} menit`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} jam`
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} hari`
  const years = seconds / 31536000
  if (years < 1e6) return `${Math.round(years)} tahun`
  if (years < 1e9) return `${Math.round(years / 1e6)} juta tahun`
  return `${(years / 1e9).toExponential(2)} miliar tahun`
}
