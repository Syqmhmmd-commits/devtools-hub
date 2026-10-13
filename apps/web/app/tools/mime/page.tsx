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
