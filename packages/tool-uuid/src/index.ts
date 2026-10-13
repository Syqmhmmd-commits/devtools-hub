export function uuidv4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function generate(count = 1): string[] {
  return Array.from({ length: count }, uuidv4)
}

const NANO_CHARS =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

export function nanoid(size = 21): string {
  let id = ''
  const bytes =
    typeof crypto !== 'undefined'
      ? crypto.getRandomValues(new Uint8Array(size))
      : Array.from({ length: size }, () => Math.floor(Math.random() * 256))
  for (let i = 0; i < size; i++) id += NANO_CHARS[bytes[i] & 63]
  return id
}

const ULID_CHARS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export function ulid(): string {
  let timeStr = ''
  let t = Date.now()
  for (let i = 0; i < 10; i++) {
    timeStr = ULID_CHARS[t % 32] + timeStr
    t = Math.floor(t / 32)
  }
  const rand =
    typeof crypto !== 'undefined'
      ? crypto.getRandomValues(new Uint8Array(16))
      : Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))
  let randStr = ''
  for (let i = 0; i < 16; i++) randStr += ULID_CHARS[rand[i] % 32]
  return timeStr + randStr
}
