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
