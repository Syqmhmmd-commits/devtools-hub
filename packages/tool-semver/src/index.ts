export interface ParsedVersion {
  major: number
  minor: number
  patch: number
  prerelease: string
  build: string
  raw: string
}

export function parse(version: string): ParsedVersion {
  const m = version.trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([^+]+))?(?:\+(.+))?$/)
  if (!m) throw new Error(`Format version tidak valid: ${version}`)
  return {
    major: +m[1], minor: +m[2], patch: +m[3],
    prerelease: m[4] || '', build: m[5] || '', raw: version,
  }
}

export function compare(a: string, b: string): number {
  const va = parse(a), vb = parse(b)
  if (va.major !== vb.major) return va.major - vb.major
  if (va.minor !== vb.minor) return va.minor - vb.minor
  if (va.patch !== vb.patch) return va.patch - vb.patch
  if (!va.prerelease && vb.prerelease) return 1
  if (va.prerelease && !vb.prerelease) return -1
  if (va.prerelease < vb.prerelease) return -1
  if (va.prerelease > vb.prerelease) return 1
  return 0
}

export function satisfies(version: string, range: string): boolean {
  const r = range.trim()
  if (r === '*') return true
  const v = parse(version)
  if (r.startsWith('^')) {
    const min = parse(r.slice(1))
    return compare(version, r.slice(1)) >= 0 && v.major === min.major
  }
  if (r.startsWith('~')) {
    const min = parse(r.slice(1))
    return compare(version, r.slice(1)) >= 0 && v.major === min.major && v.minor === min.minor
  }
  if (r.startsWith('>=')) return compare(version, r.slice(2).trim()) >= 0
  if (r.startsWith('>')) return compare(version, r.slice(1).trim()) > 0
  if (r.startsWith('<=')) return compare(version, r.slice(2).trim()) <= 0
  if (r.startsWith('<')) return compare(version, r.slice(1).trim()) < 0
  return compare(version, r) === 0
}

export function bump(version: string, type: 'major' | 'minor' | 'patch'): string {
  const v = parse(version)
  if (type === 'major') return `${v.major + 1}.0.0`
  if (type === 'minor') return `${v.major}.${v.minor + 1}.0`
  return `${v.major}.${v.minor}.${v.patch + 1}`
}
