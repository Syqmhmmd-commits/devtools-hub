'use client'
import { useState } from 'react'
import { parseCron, formatNext } from '@devtools/tool-cron'
import { ToolLayout } from '@/components/ToolLayout'

const PRESETS = [
  { name: 'Setiap menit', expr: '* * * * *' },
  { name: 'Setiap 5 menit', expr: '*/5 * * * *' },
  { name: 'Setiap jam', expr: '0 * * * *' },
  { name: 'Tiap hari jam 00:00', expr: '0 0 * * *' },
  { name: 'Tiap Senin 9am', expr: '0 9 * * 1' },
  { name: 'Tiap 1 bulan', expr: '0 0 1 * *' },
]

export default function Page() {
  const [expr, setExpr] = useState('*/5 * * * *')
  const result = expr.trim() ? parseCron(expr) : null

  return (
    <ToolLayout title="Cron Explainer" description="Jelasin cron expression + next runs">
      <input
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        placeholder="* * * * *"
        className="w-full p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-lg text-center tracking-wider focus:outline-none focus:border-blue-500"
      />

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setExpr(p.expr)}
            className="px-3 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 rounded"
          >
            {p.name}
          </button>
        ))}
      </div>

      {result && !result.ok && (
        <p className="text-red-400 text-sm">❌ {result.error}</p>
      )}
      {result && result.ok && (
        <>
          <div className="p-4 bg-neutral-900 rounded border border-neutral-800">
            <div className="text-xs text-neutral-400 mb-3 uppercase">Breakdown</div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
              {['Menit', 'Jam', 'Tanggal', 'Bulan', 'Hari'].map((label, i) => (
                <div key={label}>
                  <div className="text-xs text-neutral-500">{label}</div>
                  <div className="font-mono text-lg mt-1">{result.fields[i].raw}</div>
                  <div className="text-xs text-neutral-400 mt-1">{result.fields[i].desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-neutral-900 rounded border border-neutral-800">
            <div className="text-xs text-neutral-400 mb-3 uppercase">Next 5 runs</div>
            <div className="space-y-1 font-mono text-sm">
              {result.next.map((d, i) => (
                <div key={i}>{formatNext(d)}</div>
              ))}
            </div>
          </div>
        </>
      )}
    </ToolLayout>
  )
}
