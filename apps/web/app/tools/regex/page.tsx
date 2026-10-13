'use client'
import { useState } from 'react'
import { testRegex, explain, COMMON_PATTERNS } from '@devtools/tool-regex'
import { ToolLayout } from '@/components/ToolLayout'

export default function Page() {
  const [pattern, setPattern] = useState('\\d+')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('abc 123 def 456')
  const result = testRegex(pattern, flags, text)
  const tokens = pattern ? explain(pattern) : []

  return (
    <ToolLayout title="Regex Tester" description="Test dan jelasin regex">
      <div className="flex gap-2">
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="pattern"
          className="flex-1 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
        />
        <input
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          placeholder="flags"
          className="w-20 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <div className="text-xs text-neutral-400 mb-2">Contoh pattern:</div>
        <div className="flex flex-wrap gap-2">
          {COMMON_PATTERNS.map((p) => (
            <button
              key={p.name}
              onClick={() => setPattern(p.pattern)}
              className="px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 rounded"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-24 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
      />

      {!result.ok && <p className="text-red-400 text-sm">❌ {result.error}</p>}
      {result.ok && (
        <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-2">
            {result.matches.length} match{result.matches.length !== 1 ? 'es' : ''}
          </div>
          {result.matches.map((m, i) => (
            <div key={i} className="text-sm font-mono">
              <span className="text-blue-400">"{m.match}"</span>
              <span className="text-neutral-500"> at index {m.index}</span>
              {m.groups.length > 0 && (
                <span className="text-neutral-400"> groups: {JSON.stringify(m.groups)}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {tokens.length > 0 && (
        <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-2">Penjelasan token</div>
          <div className="space-y-1">
            {tokens.map((t, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="font-mono text-blue-400 w-12 shrink-0">{t.raw}</span>
                <span className="text-neutral-400">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
