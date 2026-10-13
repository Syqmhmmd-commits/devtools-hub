export type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export async function hash(
  input: string,
  algorithm: Algorithm = 'SHA-256'
): Promise<string> {
  const data = new TextEncoder().encode(input)
  const buffer = await crypto.subtle.digest(algorithm, data)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashAll(input: string) {
  const algs: Algorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']
  const results = await Promise.all(
    algs.map(async (a) => [a, await hash(input, a)] as const)
  )
  return Object.fromEntries(results) as Record<Algorithm, string>
}
