function words(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
}

export function camelCase(input: string): string {
  const w = words(input)
  return w.map((x, i) => (i === 0 ? x : x[0].toUpperCase() + x.slice(1))).join('')
}

export function pascalCase(input: string): string {
  return words(input).map((x) => x[0].toUpperCase() + x.slice(1)).join('')
}

export function snakeCase(input: string): string {
  return words(input).join('_')
}

export function kebabCase(input: string): string {
  return words(input).join('-')
}

export function constantCase(input: string): string {
  return words(input).join('_').toUpperCase()
}

export function dotCase(input: string): string {
  return words(input).join('.')
}

export function titleCase(input: string): string {
  return words(input).map((x) => x[0].toUpperCase() + x.slice(1)).join(' ')
}

export function sentenceCase(input: string): string {
  const w = words(input)
  if (w.length === 0) return ''
  return [w[0][0].toUpperCase() + w[0].slice(1), ...w.slice(1)].join(' ')
}

export function slug(input: string): string {
  return words(input).join('-')
}

export function allCases(input: string) {
  return {
    camelCase: camelCase(input),
    PascalCase: pascalCase(input),
    snake_case: snakeCase(input),
    'kebab-case': kebabCase(input),
    CONSTANT_CASE: constantCase(input),
    'dot.case': dotCase(input),
    'Title Case': titleCase(input),
    'Sentence case': sentenceCase(input),
    slug: slug(input),
  }
}
