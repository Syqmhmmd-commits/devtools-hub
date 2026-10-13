export const MIME_MAP: Record<string, string> = {
  html: 'text/html', htm: 'text/html', css: 'text/css',
  js: 'application/javascript', mjs: 'application/javascript',
  json: 'application/json', xml: 'application/xml',
  yaml: 'application/yaml', yml: 'application/yaml',
  csv: 'text/csv', txt: 'text/plain', md: 'text/markdown',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
  ico: 'image/x-icon', avif: 'image/avif',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  pdf: 'application/pdf', zip: 'application/zip',
  gz: 'application/gzip', tar: 'application/x-tar',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf',
  wasm: 'application/wasm', exe: 'application/octet-stream',
  env: 'text/plain', gitignore: 'text/plain', lock: 'text/plain',
}

export function lookup(extOrFile: string): string | null {
  const ext = extOrFile.includes('.')
    ? extOrFile.split('.').pop()!.toLowerCase()
    : extOrFile.toLowerCase()
  return MIME_MAP[ext] ?? null
}

export function search(query: string): { ext: string; mime: string }[] {
  const q = query.toLowerCase()
  return Object.entries(MIME_MAP)
    .filter(([ext, mime]) => ext.includes(q) || mime.toLowerCase().includes(q))
    .map(([ext, mime]) => ({ ext, mime }))
}
