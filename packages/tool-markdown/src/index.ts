export async function render(md: string): Promise<string> {
  const { marked } = await import('marked')
  return await marked.parse(md)
}

export function stats(md: string) {
  const words = md.trim().split(/\s+/).filter(Boolean).length
  const chars = md.length
  const lines = md.split('\n').length
  const readingTime = Math.max(1, Math.round(words / 200))
  return { words, chars, lines, readingTime }
}
