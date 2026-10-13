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
