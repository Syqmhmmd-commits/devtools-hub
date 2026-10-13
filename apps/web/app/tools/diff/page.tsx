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
