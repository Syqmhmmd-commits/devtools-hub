'use client'
import { useState, useEffect } from 'react'
import { generate, strength } from '@devtools/tool-password'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [password, setPassword] = useState('')

  const regenerate = () => {
    try {
      setPassword(generate({ length, uppercase, lowercase, numbers, symbols, excludeAmbiguous }))
    } catch (e) {
      setPassword('')
    }
  }

  useEffect(() => { regenerate() }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous])

  const s = password ? strength(password) : null

  return (
    <ToolLayout title="Password Generator" description="Generate + cek kekuatan password">
      <div className="flex gap-2">
        <input
          readOnly
          value={password}
          className="flex-1 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none"
        />
        <CopyButton text={password} />
        <button onClick={regenerate} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">
          ↻
        </button>
      </div>

      {s && (
        <div className="p-4 bg-neutral-900 rounded border border-neutral-800 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-neutral-400">Strength</div>
              <div className="font-semibold">{s.label}</div>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-6 h-2 rounded ${
                    i < s.score
                      ? s.score <= 2 ? 'bg-red-500' : s.score <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                      : 'bg-neutral-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-neutral-400">Entropy:</span> {s.entropy} bits</div>
            <div><span className="text-neutral-400">Crack time:</span> {s.crackTime}</div>
          </div>
        </div>
      )}

      <div className="p-4 bg-neutral-900 rounded border border-neutral-800 space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Panjang</span>
            <span className="font-mono">{length}</span>
          </div>
          <input
            type="range" min={4} max={64} value={length}
            onChange={(e) => setLength(+e.target.value)}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['Huruf besar', uppercase, setUppercase] as const,
            ['Huruf kecil', lowercase, setLowercase] as const,
            ['Angka', numbers, setNumbers] as const,
            ['Simbol', symbols, setSymbols] as const,
            ['Exclude ambigu (Il1O0o)', excludeAmbiguous, setExcludeAmbiguous] as const,
          ].map(([label, val, set]) => (
            <label key={label} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} />
              {label}
            </label>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
