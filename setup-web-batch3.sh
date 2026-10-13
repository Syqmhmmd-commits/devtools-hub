#!/usr/bin/env bash
set -e
cd ~/devtools-hub/apps/web

# ---------- tools/password ----------
mkdir -p app/tools/password
cat > app/tools/password/page.tsx << 'EOF'
'use client'
import { useState, useEffect } from 'react'
import { generate, strength } from '@devtools/tool-password'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [password, setPassword] = useState('')

  const regenerate = () => {
    try {
      setPassword(generate({ length, uppercase, lowercase, numbers, symbols, excludeAmbiguous }))
    } catch (e) {
      setPassword('')
    }
  }

  useEffect(() => { regenerate() }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous])

  const s = password ? strength(password) : null

  return (
    <ToolLayout title="Password Generator" description="Generate + cek kekuatan password">
      <div className="flex gap-2">
        <input
          readOnly
          value={password}
          className="flex-1 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none"
        />
        <CopyButton text={password} />
        <button onClick={regenerate} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">
          ↻
        </button>
      </div>

      {s && (
        <div className="p-4 bg-neutral-900 rounded border border-neutral-800 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-neutral-400">Strength</div>
              <div className="font-semibold">{s.label}</div>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-6 h-2 rounded ${
                    i < s.score
                      ? s.score <= 2 ? 'bg-red-500' : s.score <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                      : 'bg-neutral-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-neutral-400">Entropy:</span> {s.entropy} bits</div>
            <div><span className="text-neutral-400">Crack time:</span> {s.crackTime}</div>
          </div>
        </div>
      )}

      <div className="p-4 bg-neutral-900 rounded border border-neutral-800 space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Panjang</span>
            <span className="font-mono">{length}</span>
          </div>
          <input
            type="range" min={4} max={64} value={length}
            onChange={(e) => setLength(+e.target.value)}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['Huruf besar', uppercase, setUppercase] as const,
            ['Huruf kecil', lowercase, setLowercase] as const,
            ['Angka', numbers, setNumbers] as const,
            ['Simbol', symbols, setSymbols] as const,
            ['Exclude ambigu (Il1O0o)', excludeAmbiguous, setExcludeAmbiguous] as const,
          ].map(([label, val, set]) => (
            <label key={label} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} />
              {label}
            </label>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
EOF

# ---------- tools/qr ----------
mkdir -p app/tools/qr
cat > app/tools/qr/page.tsx << 'EOF'
'use client'
import { useState, useEffect } from 'react'
import { toDataURL } from '@devtools/tool-qr'
import { ToolLayout } from '@/components/ToolLayout'

export default function Page() {
  const [text, setText] = useState('https://github.com')
  const [size, setSize] = useState(300)
  const [dark, setDark] = useState('#000000')
  const [light, setLight] = useState('#ffffff')
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    if (!text) return setDataUrl('')
    toDataURL(text, { size: 600, color: { dark, light } }).then(setDataUrl)
  }, [text, dark, light])

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'qr.png'
    a.click()
  }

  return (
    <ToolLayout title="QR Generator" description="Generate QR code dari teks/URL">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Teks atau URL..."
        className="w-full h-24 p-3 bg-neutral-900 rounded border border-neutral-800 text-sm focus:outline-none focus:border-blue-500"
      />

      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-xs text-neutral-400 mb-1">Ukuran</div>
          <input type="range" min={200} max={800} value={size} onChange={(e) => setSize(+e.target.value)} className="w-full" />
        </div>
        <div>
          <div className="text-xs text-neutral-400 mb-1">Warna QR</div>
          <input type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
        </div>
        <div>
          <div className="text-xs text-neutral-400 mb-1">Background</div>
          <input type="color" value={light} onChange={(e) => setLight(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
        </div>
      </div>

      {dataUrl && (
        <div className="flex flex-col items-center gap-4 p-6 bg-neutral-900 rounded border border-neutral-800">
          <img src={dataUrl} alt="QR" style={{ width: size, maxWidth: '100%' }} />
          <button onClick={download} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">
            ⬇ Download PNG
          </button>
        </div>
      )}
    </ToolLayout>
  )
}
EOF

# ---------- tools/diff ----------
mkdir -p app/tools/diff
cat > app/tools/diff/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { diffLines, diffStats } from '@devtools/tool-diff'
import { ToolLayout } from '@/components/ToolLayout'

export default function Page() {
  const [a, setA] = useState('hello\nworld\nfoo')
  const [b, setB] = useState('hello\nworld!\nfoo\nbar')
  const lines = diffLines(a, b)
  const stats = diffStats(lines)

  return (
    <ToolLayout title="Text Diff" description="Bandingin 2 teks, baris per baris">
      <div className="grid grid-cols-2 gap-3">
        <textarea value={a} onChange={(e) => setA(e.target.value)}
          className="h-40 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500" />
        <textarea value={b} onChange={(e) => setB(e.target.value)}
          className="h-40 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500" />
      </div>
      <div className="flex gap-4 text-sm">
        <span className="text-green-400">+{stats.added}</span>
        <span className="text-red-400">-{stats.removed}</span>
        <span className="text-neutral-400">{stats.unchanged} unchanged</span>
      </div>
      <div className="bg-neutral-900 rounded border border-neutral-800 overflow-auto font-mono text-sm">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`px-3 py-0.5 flex gap-3 ${
              l.type === 'add' ? 'bg-green-500/10 text-green-300'
              : l.type === 'remove' ? 'bg-red-500/10 text-red-300'
              : 'text-neutral-400'
            }`}
          >
            <span className="w-8 text-right text-neutral-600 select-none">{l.lineA || ''}</span>
            <span className="w-8 text-right text-neutral-600 select-none">{l.lineB || ''}</span>
            <span className="w-4 select-none">
              {l.type === 'add' ? '+' : l.type === 'remove' ? '-' : ' '}
            </span>
            <span className="whitespace-pre-wrap flex-1">{l.value || ' '}</span>
          </div>
        ))}
      </div>
    </ToolLayout>
  )
}
EOF

# ---------- tools/lorem ----------
mkdir -p app/tools/lorem
cat > app/tools/lorem/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { words, sentences, paragraphs } from '@devtools/tool-lorem'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

type Type = 'words' | 'sentences' | 'paragraphs'

export default function Page() {
  const [type, setType] = useState<Type>('paragraphs')
  const [count, setCount] = useState(3)
  const [output, setOutput] = useState(paragraphs(3))

  const gen = () => {
    const fn = type === 'words' ? words : type === 'sentences' ? sentences : paragraphs
    setOutput(fn(count))
  }

  return (
    <ToolLayout title="Lorem Ipsum" description="Generate teks placeholder">
      <div className="flex gap-2 items-center flex-wrap">
        <select value={type} onChange={(e) => setType(e.target.value as Type)}
          className="bg-neutral-800 px-3 py-2 rounded text-sm">
          <option value="words">Kata</option>
          <option value="sentences">Kalimat</option>
          <option value="paragraphs">Paragraf</option>
        </select>
        <input type="number" min={1} max={50} value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(50, +e.target.value)))}
          className="bg-neutral-800 px-3 py-2 rounded w-24 text-sm" />
        <button onClick={gen} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">
          Generate
        </button>
        <CopyButton text={output} />
      </div>
      <pre className="p-4 bg-neutral-900 rounded border border-neutral-800 text-sm whitespace-pre-wrap leading-relaxed">
        {output}
      </pre>
    </ToolLayout>
  )
}
EOF

# ---------- tools/url ----------
mkdir -p app/tools/url
cat > app/tools/url/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { parse } from '@devtools/tool-url'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [input, setInput] = useState('https://example.com/path?foo=bar&baz=qux#section')
  let parsed: any = null
  let error = ''
  try { if (input.trim()) parsed = parse(input) } catch (e) { error = (e as Error).message }

  return (
    <ToolLayout title="URL Parser" description="Breakdown komponen URL">
      <input value={input} onChange={(e) => setInput(e.target.value)}
        className="w-full p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500" />
      {error && <p className="text-red-400 text-sm">❌ {error}</p>}
      {parsed && (
        <>
          <div className="space-y-2">
            {[
              ['Protocol', parsed.protocol],
              ['Hostname', parsed.hostname],
              ['Port', parsed.port],
              ['Pathname', parsed.pathname],
              ['Search', parsed.search],
              ['Hash', parsed.hash],
              ['Origin', parsed.origin],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-3 p-3 bg-neutral-900 rounded border border-neutral-800">
                <span className="text-xs text-neutral-400 w-24 shrink-0">{k}</span>
                <span className="font-mono text-sm flex-1 break-all">{v || '—'}</span>
                {v && <CopyButton text={v} />}
              </div>
            ))}
          </div>
          {Object.keys(parsed.params).length > 0 && (
            <div className="p-4 bg-neutral-900 rounded border border-neutral-800">
              <div className="text-xs text-neutral-400 mb-2 uppercase">Query Params</div>
              <div className="space-y-1">
                {Object.entries(parsed.params).map(([k, v]) => (
                  <div key={k} className="font-mono text-sm">
                    <span className="text-blue-400">{k}</span> = <span>{v as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </ToolLayout>
  )
}
EOF

# ---------- tools/yaml ----------
mkdir -p app/tools/yaml
cat > app/tools/yaml/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { yamlToJson, jsonToYaml } from '@devtools/tool-yaml'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [input, setInput] = useState('name: test\nversion: 1.0.0\nitems:\n  - a\n  - b')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const toJson = async () => {
    const r = await yamlToJson(input)
    if (r.ok) { setOutput(r.output); setError('') } else { setError(r.error); setOutput('') }
  }
  const toYaml = async () => {
    const r = await jsonToYaml(input)
    if (r.ok) { setOutput(r.output); setError('') } else { setError(r.error); setOutput('') }
  }

  return (
    <ToolLayout title="YAML ↔ JSON" description="Konversi dua arah">
      <div className="flex gap-2">
        <button onClick={toJson} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">YAML → JSON</button>
        <button onClick={toYaml} className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm font-medium">JSON → YAML</button>
      </div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)}
        className="w-full h-48 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500" />
      {error && <p className="text-red-400 text-sm">❌ {error}</p>}
      {output && (
        <div className="relative">
          <pre className="p-3 bg-neutral-900 rounded border border-neutral-800 text-sm overflow-auto">{output}</pre>
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
        </div>
      )}
    </ToolLayout>
  )
}
EOF

# ---------- tools/markdown ----------
mkdir -p app/tools/markdown
cat > app/tools/markdown/page.tsx << 'EOF'
'use client'
import { useState, useEffect } from 'react'
import { render, stats } from '@devtools/tool-markdown'
import { ToolLayout } from '@/components/ToolLayout'

export default function Page() {
  const [md, setMd] = useState('# Hello\n\nIni **markdown** dengan `code` dan [link](https://example.com).\n\n- item 1\n- item 2')
  const [html, setHtml] = useState('')
  const s = stats(md)

  useEffect(() => { render(md).then(setHtml) }, [md])

  return (
    <ToolLayout title="Markdown Preview" description="Render markdown real-time">
      <div className="flex gap-4 text-xs text-neutral-400">
        <span>{s.words} words</span>
        <span>{s.chars} chars</span>
        <span>{s.lines} lines</span>
        <span>~{s.readingTime} min read</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <textarea value={md} onChange={(e) => setMd(e.target.value)}
          className="h-96 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500" />
        <div
          className="h-96 p-4 bg-neutral-900 rounded border border-neutral-800 overflow-auto prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </ToolLayout>
  )
}
EOF

# ---------- tools/slug ----------
mkdir -p app/tools/slug
cat > app/tools/slug/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { slugify, variants } from '@devtools/tool-slug'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [input, setInput] = useState('Hello World — Æther 2024!')
  const v = variants(input)

  return (
    <ToolLayout title="Slug Generator" description="Bikin URL-friendly slug">
      <input value={input} onChange={(e) => setInput(e.target.value)}
        className="w-full p-3 bg-neutral-900 rounded border border-neutral-800 text-sm focus:outline-none focus:border-blue-500" />
      <div className="space-y-2">
        {Object.entries(v).map(([k, val]) => (
          <div key={k} className="flex items-center gap-3 p-3 bg-neutral-900 rounded border border-neutral-800">
            <span className="text-xs text-neutral-400 w-24 shrink-0">{k}</span>
            <span className="font-mono text-sm flex-1 break-all">{val}</span>
            <CopyButton text={val} />
          </div>
        ))}
      </div>
    </ToolLayout>
  )
}
EOF

# ---------- tools/semver ----------
mkdir -p app/tools/semver
cat > app/tools/semver/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { compare, satisfies, bump, parse } from '@devtools/tool-semver'
import { ToolLayout } from '@/components/ToolLayout'

export default function Page() {
  const [a, setA] = useState('1.2.3')
  const [b, setB] = useState('1.2.4')
  const [range, setRange] = useState('^1.0.0')

  let parsedA: any = null, cmp = 0, sat = false
  let errorA = '', errorB = ''
  try { parsedA = parse(a) } catch (e) { errorA = (e as Error).message }
  try { cmp = compare(a, b) } catch (e) { errorB = (e as Error).message }
  try { sat = satisfies(a, range) } catch {}

  return (
    <ToolLayout title="Semver Tools" description="Compare, satisfies, bump versi">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-neutral-400 mb-1">Version A</div>
          <input value={a} onChange={(e) => setA(e.target.value)}
            className="w-full p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <div className="text-xs text-neutral-400 mb-1">Version B</div>
          <input value={b} onChange={(e) => setB(e.target.value)}
            className="w-full p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      {!errorA && !errorB && (
        <div className="p-4 bg-neutral-900 rounded border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-2">Compare</div>
          <div className="text-2xl font-mono">
            {a} {cmp > 0 ? '>' : cmp < 0 ? '<' : '='} {b}
          </div>
        </div>
      )}

      <div className="p-4 bg-neutral-900 rounded border border-neutral-800 space-y-3">
        <div className="text-xs text-neutral-400">Satisfies range</div>
        <div className="flex gap-2">
          <input value={range} onChange={(e) => setRange(e.target.value)}
            className="flex-1 p-2 bg-neutral-800 rounded font-mono text-sm" />
          <span className={`px-3 py-2 rounded text-sm font-medium ${sat ? 'bg-green-600' : 'bg-red-600'}`}>
            {sat ? '✅ match' : '❌ tidak'}
          </span>
        </div>
      </div>

      {parsedA && (
        <div className="p-4 bg-neutral-900 rounded border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-2">Parse {a}</div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><span className="text-neutral-400">Major:</span> {parsedA.major}</div>
            <div><span className="text-neutral-400">Minor:</span> {parsedA.minor}</div>
            <div><span className="text-neutral-400">Patch:</span> {parsedA.patch}</div>
          </div>
        </div>
      )}

      <div className="p-4 bg-neutral-900 rounded border border-neutral-800">
        <div className="text-xs text-neutral-400 mb-2">Bump {a}</div>
        <div className="flex gap-2 flex-wrap">
          {(['major', 'minor', 'patch'] as const).map((t) => (
            <button key={t} onClick={() => setA(bump(a, t))}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm">
              {t} → {bump(a, t)}
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
EOF

# ---------- tools/mime ----------
mkdir -p app/tools/mime
cat > app/tools/mime/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { search, lookup } from '@devtools/tool-mime'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [query, setQuery] = useState('image')
  const results = query ? search(query) : []
  const exact = query ? lookup(query) : null

  return (
    <ToolLayout title="MIME Lookup" description="Cari MIME type berdasarkan extension atau keyword">
      <input value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder=".png atau image atau json..."
        className="w-full p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500" />
      {exact && (
        <div className="p-3 bg-blue-600/20 border border-blue-600 rounded">
          <div className="text-xs text-blue-400 mb-1">Exact match</div>
          <div className="font-mono text-sm">{query} → {exact}</div>
        </div>
      )}
      <div className="space-y-1">
        {results.map((r) => (
          <div key={r.ext} className="flex items-center gap-3 p-2 bg-neutral-900 rounded border border-neutral-800">
            <span className="font-mono text-sm text-blue-400 w-20">.{r.ext}</span>
            <span className="font-mono text-sm flex-1 break-all">{r.mime}</span>
            <CopyButton text={r.mime} />
          </div>
        ))}
      </div>
      {query && results.length === 0 && !exact && (
        <p className="text-neutral-500 text-sm">Tidak ada hasil</p>
      )}
    </ToolLayout>
  )
}
EOF

echo "✅ 10 halaman web batch 3 berhasil dibuat!"
