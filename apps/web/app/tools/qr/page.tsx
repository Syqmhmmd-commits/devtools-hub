'use client'
import { useState, useEffect } from 'react'
import { toDataURL } from '@devtools/tool-qr'
import { ToolLayout } from '@/components/ToolLayout'

export default function Page() {
  const [text, setText] = useState('https://github.com')
  const [size, setSize] = useState(300)
  const [dark, setDark] = useState('#000000')
  const [light, setLight] = useState('#ffffff')
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    if (!text) return setDataUrl('')
    toDataURL(text, { size: 600, color: { dark, light } }).then(setDataUrl)
  }, [text, dark, light])

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'qr.png'
    a.click()
  }

  return (
    <ToolLayout title="QR Generator" description="Generate QR code dari teks/URL">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Teks atau URL..."
        className="w-full h-24 p-3 bg-neutral-900 rounded border border-neutral-800 text-sm focus:outline-none focus:border-blue-500"
      />

      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-xs text-neutral-400 mb-1">Ukuran</div>
          <input type="range" min={200} max={800} value={size} onChange={(e) => setSize(+e.target.value)} className="w-full" />
        </div>
        <div>
          <div className="text-xs text-neutral-400 mb-1">Warna QR</div>
          <input type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
        </div>
        <div>
          <div className="text-xs text-neutral-400 mb-1">Background</div>
          <input type="color" value={light} onChange={(e) => setLight(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
        </div>
      </div>

      {dataUrl && (
        <div className="flex flex-col items-center gap-4 p-6 bg-neutral-900 rounded border border-neutral-800">
          <img src={dataUrl} alt="QR" style={{ width: size, maxWidth: '100%' }} />
          <button onClick={download} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">
            ⬇ Download PNG
          </button>
        </div>
      )}
    </ToolLayout>
  )
}
