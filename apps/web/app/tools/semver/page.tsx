'use client'
import { useState } from 'react'
import { compare, satisfies, bump, parse } from '@devtools/tool-semver'
import { ToolLayout } from '@/components/ToolLayout'

export default function Page() {
  const [a, setA] = useState('1.2.3')
  const [b, setB] = useState('1.2.4')
  const [range, setRange] = useState('^1.0.0')

  let parsedA: any = null, cmp = 0, sat = false
  let errorA = '', errorB = ''
  try { parsedA = parse(a) } catch (e) { errorA = (e as Error).message }
  try { cmp = compare(a, b) } catch (e) { errorB = (e as Error).message }
  try { sat = satisfies(a, range) } catch {}

  return (
    <ToolLayout title="Semver Tools" description="Compare, satisfies, bump versi">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-neutral-400 mb-1">Version A</div>
          <input value={a} onChange={(e) => setA(e.target.value)}
            className="w-full p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <div className="text-xs text-neutral-400 mb-1">Version B</div>
          <input value={b} onChange={(e) => setB(e.target.value)}
            className="w-full p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      {!errorA && !errorB && (
        <div className="p-4 bg-neutral-900 rounded border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-2">Compare</div>
          <div className="text-2xl font-mono">
            {a} {cmp > 0 ? '>' : cmp < 0 ? '<' : '='} {b}
          </div>
        </div>
      )}

      <div className="p-4 bg-neutral-900 rounded border border-neutral-800 space-y-3">
        <div className="text-xs text-neutral-400">Satisfies range</div>
        <div className="flex gap-2">
          <input value={range} onChange={(e) => setRange(e.target.value)}
            className="flex-1 p-2 bg-neutral-800 rounded font-mono text-sm" />
          <span className={`px-3 py-2 rounded text-sm font-medium ${sat ? 'bg-green-600' : 'bg-red-600'}`}>
            {sat ? '✅ match' : '❌ tidak'}
          </span>
        </div>
      </div>

      {parsedA && (
        <div className="p-4 bg-neutral-900 rounded border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-2">Parse {a}</div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><span className="text-neutral-400">Major:</span> {parsedA.major}</div>
            <div><span className="text-neutral-400">Minor:</span> {parsedA.minor}</div>
            <div><span className="text-neutral-400">Patch:</span> {parsedA.patch}</div>
          </div>
        </div>
      )}

      <div className="p-4 bg-neutral-900 rounded border border-neutral-800">
        <div className="text-xs text-neutral-400 mb-2">Bump {a}</div>
        <div className="flex gap-2 flex-wrap">
          {(['major', 'minor', 'patch'] as const).map((t) => (
            <button key={t} onClick={() => setA(bump(a, t))}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm">
              {t} → {bump(a, t)}
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
