const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ')

function pick(): string { return WORDS[Math.floor(Math.random() * WORDS.length)] }
function capitalize(s: string): string { return s[0].toUpperCase() + s.slice(1) }

export function words(count: number): string {
  return Array.from({ length: count }, pick).join(' ')
}

export function sentences(count: number): string {
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    const wordCount = 8 + Math.floor(Math.random() * 8)
    result.push(capitalize(words(wordCount)) + '.')
  }
  return result.join(' ')
}

export function paragraphs(count: number): string {
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    const sentenceCount = 3 + Math.floor(Math.random() * 3)
    result.push(sentences(sentenceCount))
  }
  return result.join('\n\n')
}
