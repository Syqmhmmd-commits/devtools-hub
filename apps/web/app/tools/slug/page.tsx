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
