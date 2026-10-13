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
