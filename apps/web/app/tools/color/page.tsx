'use client'
import { useState } from 'react'
import {
  hexToRgb, rgbToHex, rgbToHsl, generatePalette,
  luminance, contrastRatio, wcagLevel,
} from '@devtools/tool-color'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [hex, setHex] = useState('#3b82f6')
  const [bg, setBg] = useState('#ffffff')
  let rgb, hsl, palette: string[] = [], ratio = 0, level = { normal: '', large: '' }
  let error = ''
  try {
    rgb = hexToRgb(hex)
    hsl = rgbToHsl(rgb)
    palette = generatePalette(hex)
    const bgRgb = hexToRgb(bg)
    ratio = contrastRatio(rgb, bgRgb)
    level = wcagLevel(ratio)
  } catch (e) {
    error = (e as Error).message
  }

  return (
    <ToolLayout title="Color Tools" description="Konversi, palette, dan contrast checker">
      <div className="flex gap-4 items-center">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="w-16 h-16 rounded cursor-pointer bg-transparent"
        />
        <input
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="flex-1 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      {error && <p className="text-red-400 text-sm">❌ {error}</p>}
      {rgb && hsl && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ['HEX', rgbToHex(rgb)],
              ['RGB', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],
              ['HSL', `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],
            ].map(([label, val]) => (
              <div key={label} className="p-3 bg-neutral-900 rounded border border-neutral-800">
                <div className="text-xs text-neutral-400 mb-1">{label}</div>
                <div className="font-mono text-sm break-all">{val}</div>
                <div className="mt-2"><CopyButton text={val} /></div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs text-neutral-400 mb-2 uppercase">Palette</div>
            <div className="grid grid-cols-8 rounded overflow-hidden border border-neutral-800">
              {palette.map((c) => (
                <button
                  key={c}
                  onClick={() => navigator.clipboard.writeText(c)}
                  className="h-16 hover:scale-110 transition-transform"
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="p-4 bg-neutral-900 rounded border border-neutral-800 space-y-3">
            <div className="text-xs text-neutral-400 uppercase">Contrast Checker</div>
            <div className="flex gap-3 items-center">
              <div
                className="w-32 h-16 rounded flex items-center justify-center font-bold text-xl"
                style={{ background: bg, color: hex }}
              >
                Sample
              </div>
              <input
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                className="flex-1 p-2 bg-neutral-800 rounded font-mono text-sm"
              />
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                Ratio: <span className="font-mono font-bold">{ratio.toFixed(2)}</span>
              </div>
              <div>Normal text: <span className="font-bold">{level.normal}</span></div>
              <div>Large text: <span className="font-bold">{level.large}</span></div>
            </div>
          </div>
        </>
      )}
    </ToolLayout>
  )
}
