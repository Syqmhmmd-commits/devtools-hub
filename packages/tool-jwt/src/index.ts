export interface DecodedJWT {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

function base64UrlDecode(str: string): string {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4))
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/')
  if (typeof atob !== 'undefined') {
    return decodeURIComponent(escape(atob(b64)))
  }
  return Buffer.from(b64, 'base64').toString('utf-8')
}

export function decode(token: string): DecodedJWT {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('JWT harus punya 3 bagian (header.payload.signature)')
  }
  const [h, p, s] = parts
  return {
    header: JSON.parse(base64UrlDecode(h)),
    payload: JSON.parse(base64UrlDecode(p)),
    signature: s,
  }
}

export function isExpired(token: string): boolean {
  try {
    const { payload } = decode(token)
    if (typeof payload.exp !== 'number') return false
    return payload.exp * 1000 < Date.now()
  } catch {
    return false
  }
}

export function expiresIn(token: string): number | null {
  try {
    const { payload } = decode(token)
    if (typeof payload.exp !== 'number') return null
    return payload.exp * 1000 - Date.now()
  } catch {
    return null
  }
}

export function formatDuration(ms: number): string {
  const abs = Math.abs(ms)
  const sec = Math.floor(abs / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  let out = ''
  if (day > 0) out = `${day} hari`
  else if (hr > 0) out = `${hr} jam`
  else if (min > 0) out = `${min} menit`
  else out = `${sec} detik`
  return ms >= 0 ? `expired dalam ${out}` : `sudah expired ${out} lalu`
}
