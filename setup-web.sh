#!/usr/bin/env bash
set -e
cd ~/devtools-hub/apps/web

# ---------- components ----------
mkdir -p components

cat > components/ToolLayout.tsx << 'EOF'
'use client'
import { useState } from 'react'
import Link from 'next/link'

export function ToolLayout({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-xs text-neutral-500 hover:text-neutral-300"
        >
          ← Kembali ke Hub
        </Link>
        <h1 className="text-3xl font-bold mt-2">{title}</h1>
        {description && (
          <p className="text-neutral-400 text-sm mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
EOF

# ---------- layout.tsx ----------
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'DevTools Hub',
  description: 'Kumpulan tools developer ringan, 100% di browser.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <header className="border-b border-neutral-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-6">
            <Link href="/" className="font-bold text-lg">
              🛠️ DevTools
            </Link>
            <nav className="flex gap-4 text-sm text-neutral-400">
              <Link href="/tools/base64" className="hover:text-neutral-100">Base64</Link>
              <Link href="/tools/json" className="hover:text-neutral-100">JSON</Link>
              <Link href="/tools/uuid" className="hover:text-neutral-100">UUID</Link>
              <Link href="/tools/hash" className="hover:text-neutral-100">Hash</Link>
              <Link href="/tools/timestamp" className="hover:text-neutral-100">Timestamp</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  )
}
EOF

# ---------- page.tsx (hub) ----------
cat > app/page.tsx << 'EOF'
import Link from 'next/link'

const tools = [
  { href: '/tools/base64', name: 'Base64', desc: 'Encode & decode teks', icon: '🔤' },
  { href: '/tools/json', name: 'JSON', desc: 'Format, minify, validate', icon: '📋' },
  { href: '/tools/uuid', name: 'ID Generator', desc: 'UUID, NanoID, ULID', icon: '🆔' },
  { href: '/tools/hash', name: 'Hash', desc: 'SHA-1/256/384/512', icon: '🔐' },
  { href: '/tools/timestamp', name: 'Timestamp', desc: 'Unix & human date', icon: '⏰' },
]

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">DevTools Hub</h1>
        <p className="text-neutral-400 mt-2">
          Tools developer ringan, jalan 100% di browser. Gak ada data yang dikirim ke server.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="p-5 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-blue-500 transition"
          >
            <div className="text-3xl">{t.icon}</div>
            <div className="font-semibold mt-3">{t.name}</div>
            <div className="text-xs text-neutral-400 mt-1">{t.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
EOF

# ---------- tools/base64 ----------
mkdir -p app/tools/base64
cat > app/tools/base64/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { encode, decode } from '@devtools/tool-base64'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  let output = ''
  let error = ''
  if (input) {
    try {
      output = mode === 'encode' ? encode(input) : decode(input)
    } catch (e) {
      error = (e as Error).message
    }
  }

  return (
    <ToolLayout title="Base64" description="Encode/decode teks ke Base64">
      <div className="flex gap-2">
        {(['encode', 'decode'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded text-sm font-medium ${
              mode === m ? 'bg-blue-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ketik sesuatu..."
        className="w-full h-32 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
      />
      {error && <p className="text-red-400 text-sm">❌ {error}</p>}
      <div className="relative">
        <pre className="p-3 bg-neutral-900 rounded border border-neutral-800 text-sm overflow-auto min-h-[3rem] whitespace-pre-wrap break-all">
          {output || <span className="text-neutral-600">Output...</span>}
        </pre>
        {output && (
          <div className="absolute top-2 right-2">
            <CopyButton text={output} />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
EOF

# ---------- tools/json ----------
mkdir -p app/tools/json
cat > app/tools/json/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { format, minify, validate } from '@devtools/tool-json'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const run = (fn: typeof format) => {
    const r = fn(input)
    if (r.ok) {
      setOutput(r.output)
      setError('')
    } else {
      setOutput('')
      setError(r.error)
    }
  }

  return (
    <ToolLayout title="JSON Formatter" description="Format, minify, dan validasi JSON">
      <div className="flex gap-2">
        <button onClick={() => run(format)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">Format</button>
        <button onClick={() => run(minify)} className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm font-medium">Minify</button>
        <button
          onClick={() => {
            const r = validate(input)
            setError(r.valid ? '' : r.error || '')
            setOutput(r.valid ? '✅ Valid JSON' : '')
          }}
          className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm font-medium"
        >
          Validate
        </button>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"hello": "world"}'
        className="w-full h-40 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
      />
      {error && <p className="text-red-400 text-sm">❌ {error}</p>}
      {output && (
        <div className="relative">
          <pre className="p-3 bg-neutral-900 rounded border border-neutral-800 text-sm overflow-auto">
            {output}
          </pre>
          <div className="absolute top-2 right-2">
            <CopyButton text={output} />
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
EOF

# ---------- tools/uuid ----------
mkdir -p app/tools/uuid
cat > app/tools/uuid/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { generate, nanoid, ulid } from '@devtools/tool-uuid'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

type IdType = 'uuid' | 'nanoid' | 'ulid'

export default function Page() {
  const [count, setCount] = useState(5)
  const [type, setType] = useState<IdType>('uuid')
  const [list, setList] = useState<string[]>([])

  const run = () => {
    const gen =
      type === 'uuid'
        ? generate(count)
        : type === 'nanoid'
        ? Array.from({ length: count }, () => nanoid())
        : Array.from({ length: count }, () => ulid())
    setList(gen)
  }

  return (
    <ToolLayout title="ID Generator" description="Generate UUID, NanoID, atau ULID">
      <div className="flex gap-2 items-center flex-wrap">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as IdType)}
          className="bg-neutral-800 px-3 py-2 rounded text-sm"
        >
          <option value="uuid">UUID v4</option>
          <option value="nanoid">NanoID</option>
          <option value="ulid">ULID</option>
        </select>
        <input
          type="number"
          value={count}
          min={1}
          max={100}
          onChange={(e) => setCount(Math.max(1, Math.min(100, +e.target.value)))}
          className="bg-neutral-800 px-3 py-2 rounded w-24 text-sm"
        />
        <button onClick={run} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">
          Generate
        </button>
      </div>
      {list.length > 0 && (
        <div className="relative">
          <pre className="p-3 bg-neutral-900 rounded border border-neutral-800 text-sm overflow-auto">
            {list.join('\n')}
          </pre>
          <div className="absolute top-2 right-2">
            <CopyButton text={list.join('\n')} />
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
EOF

# ---------- tools/hash ----------
mkdir -p app/tools/hash
cat > app/tools/hash/page.tsx << 'EOF'
'use client'
import { useState, useEffect } from 'react'
import { hashAll, type Algorithm } from '@devtools/tool-hash'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<Record<Algorithm, string> | null>(null)

  useEffect(() => {
    if (!input) {
      setResults(null)
      return
    }
    hashAll(input).then(setResults)
  }, [input])

  return (
    <ToolLayout title="Hash Generator" description="SHA-1, SHA-256, SHA-384, SHA-512">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ketik teks..."
        className="w-full h-24 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
      />
      {results &&
        Object.entries(results).map(([algo, val]) => (
          <div key={algo} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400 font-mono">{algo}</span>
              <CopyButton text={val} />
            </div>
            <pre className="p-2 bg-neutral-900 rounded border border-neutral-800 text-xs break-all whitespace-pre-wrap">
              {val}
            </pre>
          </div>
        ))}
    </ToolLayout>
  )
}
EOF

# ---------- tools/timestamp ----------
mkdir -p app/tools/timestamp
cat > app/tools/timestamp/page.tsx << 'EOF'
'use client'
import { useState, useEffect } from 'react'
import { now, format, fromNow, fromDate } from '@devtools/tool-timestamp'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [value, setValue] = useState('')
  const [live, setLive] = useState(now())

  useEffect(() => {
    const i = setInterval(() => setLive(now()), 1000)
    return () => clearInterval(i)
  }, [])

  const parsed = value
    ? /^\d+$/.test(value)
      ? +value
      : fromDate(value)
    : null

  return (
    <ToolLayout title="Timestamp" description="Konversi Unix timestamp & tanggal">
      <div className="p-4 bg-neutral-900 rounded border border-neutral-800">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-neutral-400">Sekarang</div>
            <div className="text-2xl font-mono mt-1">{live}</div>
            <div className="text-xs text-neutral-500 mt-1">{format(live)}</div>
          </div>
          <CopyButton text={String(live)} />
        </div>
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="1700000000 atau 2024-01-01"
        className="w-full p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
      />
      {parsed !== null && (
        <div className="p-4 bg-neutral-900 rounded border border-neutral-800 space-y-1">
          <div className="text-xs text-neutral-400">Hasil</div>
          <div className="font-mono text-lg">{parsed}</div>
          <div className="text-sm">{format(parsed)}</div>
          <div className="text-xs text-neutral-500">{fromNow(parsed)}</div>
        </div>
      )}
    </ToolLayout>
  )
}
EOF

echo "✅ Semua file web berhasil dibuat!"
