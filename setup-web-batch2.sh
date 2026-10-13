#!/usr/bin/env bash
set -e
cd ~/devtools-hub/apps/web

# ---------- tools/jwt ----------
mkdir -p app/tools/jwt
cat > app/tools/jwt/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { decode, expiresIn, formatDuration } from '@devtools/tool-jwt'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [token, setToken] = useState('')
  let result: any = null
  let error = ''
  let expiry = ''
  if (token.trim()) {
    try {
      result = decode(token)
      const exp = expiresIn(token)
      if (exp !== null) expiry = formatDuration(exp)
    } catch (e) {
      error = (e as Error).message
    }
  }

  return (
    <ToolLayout title="JWT Decoder" description="Decode header, payload, dan cek expiry">
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste JWT token di sini..."
        className="w-full h-32 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-xs focus:outline-none focus:border-blue-500 break-all"
      />
      {error && <p className="text-red-400 text-sm">❌ {error}</p>}
      {result && (
        <>
          {expiry && (
            <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
              <span className="text-xs text-neutral-400">Status: </span>
              <span className={expiry.includes('sudah') ? 'text-red-400' : 'text-green-400'}>
                {expiry}
              </span>
            </div>
          )}
          {(['header', 'payload'] as const).map((part) => (
            <div key={part} className="relative">
              <div className="text-xs text-neutral-400 mb-1 uppercase">{part}</div>
              <pre className="p-3 bg-neutral-900 rounded border border-neutral-800 text-xs overflow-auto">
                {JSON.stringify(result[part], null, 2)}
              </pre>
              <div className="absolute top-6 right-2">
                <CopyButton text={JSON.stringify(result[part], null, 2)} />
              </div>
            </div>
          ))}
        </>
      )}
    </ToolLayout>
  )
}
EOF

# ---------- tools/color ----------
mkdir -p app/tools/color
cat > app/tools/color/page.tsx << 'EOF'
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
EOF

# ---------- tools/regex ----------
mkdir -p app/tools/regex
cat > app/tools/regex/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { testRegex, explain, COMMON_PATTERNS } from '@devtools/tool-regex'
import { ToolLayout } from '@/components/ToolLayout'

export default function Page() {
  const [pattern, setPattern] = useState('\\d+')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('abc 123 def 456')
  const result = testRegex(pattern, flags, text)
  const tokens = pattern ? explain(pattern) : []

  return (
    <ToolLayout title="Regex Tester" description="Test dan jelasin regex">
      <div className="flex gap-2">
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="pattern"
          className="flex-1 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
        />
        <input
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          placeholder="flags"
          className="w-20 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <div className="text-xs text-neutral-400 mb-2">Contoh pattern:</div>
        <div className="flex flex-wrap gap-2">
          {COMMON_PATTERNS.map((p) => (
            <button
              key={p.name}
              onClick={() => setPattern(p.pattern)}
              className="px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 rounded"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-24 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
      />

      {!result.ok && <p className="text-red-400 text-sm">❌ {result.error}</p>}
      {result.ok && (
        <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-2">
            {result.matches.length} match{result.matches.length !== 1 ? 'es' : ''}
          </div>
          {result.matches.map((m, i) => (
            <div key={i} className="text-sm font-mono">
              <span className="text-blue-400">"{m.match}"</span>
              <span className="text-neutral-500"> at index {m.index}</span>
              {m.groups.length > 0 && (
                <span className="text-neutral-400"> groups: {JSON.stringify(m.groups)}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {tokens.length > 0 && (
        <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
          <div className="text-xs text-neutral-400 mb-2">Penjelasan token</div>
          <div className="space-y-1">
            {tokens.map((t, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="font-mono text-blue-400 w-12 shrink-0">{t.raw}</span>
                <span className="text-neutral-400">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
EOF

# ---------- tools/cron ----------
mkdir -p app/tools/cron
cat > app/tools/cron/page.tsx << 'EOF'
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
EOF

# ---------- tools/case ----------
mkdir -p app/tools/case
cat > app/tools/case/page.tsx << 'EOF'
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
EOF

echo "✅ 5 halaman web batch 2 berhasil dibuat!"
