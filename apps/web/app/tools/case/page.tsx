'use client'
import { useState } from 'react'
import { allCases } from '@devtools/tool-case'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [input, setInput] = useState('hello world example')
  const results = allCases(input)

  return (
    <ToolLayout title="Case Converter" description="Konversi teks ke berbagai format">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ketik teks di sini..."
        className="w-full p-3 bg-neutral-900 rounded border border-neutral-800 text-sm focus:outline-none focus:border-blue-500"
      />
      <div className="space-y-2">
        {Object.entries(results).map(([name, val]) => (
          <div
            key={name}
            className="flex items-center justify-between p-3 bg-neutral-900 rounded border border-neutral-800"
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs text-neutral-400">{name}</div>
              <div className="font-mono text-sm mt-1 break-all">{val || '—'}</div>
            </div>
            <CopyButton text={val} />
          </div>
        ))}
      </div>
    </ToolLayout>
  )
}
