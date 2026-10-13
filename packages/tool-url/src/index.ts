export interface ParsedURL {
  protocol: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  params: Record<string, string>
}

export function parse(input: string): ParsedURL {
  const url = new URL(input.includes('://') ? input : `https://${input}`)
  const params: Record<string, string> = {}
  url.searchParams.forEach((v, k) => { params[k] = v })
  return {
    protocol: url.protocol.replace(':', ''),
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? '443' : '80'),
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    origin: url.origin,
    params,
  }
}

export function buildQuery(params: Record<string, string>): string {
  return new URLSearchParams(params).toString()
}

export function parseQuery(query: string): Record<string, string> {
  const clean = query.startsWith('?') ? query.slice(1) : query
  const result: Record<string, string> = {}
  new URLSearchParams(clean).forEach((v, k) => { result[k] = v })
  return result
}
