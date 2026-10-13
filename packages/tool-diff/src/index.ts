export interface DiffLine {
  type: 'add' | 'remove' | 'context'
  value: string
  lineA?: number
  lineB?: number
}

export function diffLines(a: string, b: string): DiffLine[] {
  const linesA = a.split('\n')
  const linesB = b.split('\n')
  return diffArrays(linesA, linesB)
}

function diffArrays(a: string[], b: string[]): DiffLine[] {
  const result: DiffLine[] = []
  const n = a.length, m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  let i = 0, j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ type: 'context', value: a[i], lineA: i + 1, lineB: j + 1 })
      i++; j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: 'remove', value: a[i], lineA: i + 1 })
      i++
    } else {
      result.push({ type: 'add', value: b[j], lineB: j + 1 })
      j++
    }
  }
  while (i < n) { result.push({ type: 'remove', value: a[i], lineA: i + 1 }); i++ }
  while (j < m) { result.push({ type: 'add', value: b[j], lineB: j + 1 }); j++ }
  return result
}

export function diffStats(lines: DiffLine[]) {
  return {
    added: lines.filter((l) => l.type === 'add').length,
    removed: lines.filter((l) => l.type === 'remove').length,
    unchanged: lines.filter((l) => l.type === 'context').length,
  }
}
