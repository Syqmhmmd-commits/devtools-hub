'use client'
import { useState } from 'react'
import { encode, decode } from '@devtools/tool-base64'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  let output = ''
  let error = ''
  if (input) {
    try {
      output = mode === 'encode' ? encode(input) : decode(input)
    } catch (e) {
      error = (e as Error).message
    }
  }

  return (
    <ToolLayout title="Base64" description="Encode/decode teks ke Base64">
      <div className="flex gap-2">
        {(['encode', 'decode'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded text-sm font-medium ${
              mode === m ? 'bg-blue-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ketik sesuatu..."
        className="w-full h-32 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
      />
      {error && <p className="text-red-400 text-sm">❌ {error}</p>}
      <div className="relative">
        <pre className="p-3 bg-neutral-900 rounded border border-neutral-800 text-sm overflow-auto min-h-[3rem] whitespace-pre-wrap break-all">
          {output || <span className="text-neutral-600">Output...</span>}
        </pre>
        {output && (
          <div className="absolute top-2 right-2">
            <CopyButton text={output} />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
