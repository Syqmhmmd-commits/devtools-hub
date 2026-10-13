export interface SlugOptions {
  separator?: string
  lowercase?: boolean
  maxLength?: number
}

const LIGATURES: Record<string, string> = {
  Æ: 'AE', æ: 'ae',
  Ø: 'O', ø: 'o',
  Ð: 'D', ð: 'd',
  Þ: 'TH', þ: 'th',
  ß: 'ss',
  Œ: 'OE', œ: 'oe',
}

export function slugify(input: string, opts: SlugOptions = {}): string {
  const { separator = '-', lowercase = true, maxLength } = opts

  let normalized = input
  for (const [k, v] of Object.entries(LIGATURES)) {
    normalized = normalized.split(k).join(v)
  }

  let slug = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, separator)
    .replace(new RegExp(`${escape(separator)}+`, 'g'), separator)

  if (lowercase) slug = slug.toLowerCase()
  if (maxLength && slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(new RegExp(`${escape(separator)}$`), '')
  }
  return slug
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function variants(input: string) {
  return {
    dash: slugify(input, { separator: '-' }),
    underscore: slugify(input, { separator: '_' }),
    dot: slugify(input, { separator: '.' }),
    'dash-lower': slugify(input, { separator: '-', lowercase: true }),
    'dash-upper': slugify(input, { separator: '-', lowercase: false }),
  }
}
