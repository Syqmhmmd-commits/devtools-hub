export function encode(input: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(unescape(encodeURIComponent(input)))
  }
  return Buffer.from(input, 'utf-8').toString('base64')
}

export function decode(input: string): string {
  if (typeof atob !== 'undefined') {
    return decodeURIComponent(escape(atob(input)))
  }
  return Buffer.from(input, 'base64').toString('utf-8')
}
