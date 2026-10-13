'use client'
import { useState } from 'react'
import { format, minify, validate } from '@devtools/tool-json'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const run = (fn: typeof format) => {
    const r = fn(input)
    if (r.ok) {
      setOutput(r.output)
      setError('')
    } else {
      setOutput('')
      setError(r.error)
    }
  }

  return (
    <ToolLayout title="JSON Formatter" description="Format, minify, dan validasi JSON">
      <div className="flex gap-2">
        <button onClick={() => run(format)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">Format</button>
        <button onClick={() => run(minify)} className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm font-medium">Minify</button>
        <button
          onClick={() => {
            const r = validate(input)
            setError(r.valid ? '' : r.error || '')
            setOutput(r.valid ? '✅ Valid JSON' : '')
          }}
          className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm font-medium"
        >
          Validate
        </button>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"hello": "world"}'
        className="w-full h-40 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500"
      />
      {error && <p className="text-red-400 text-sm">❌ {error}</p>}
      {output && (
        <div className="relative">
          <pre className="p-3 bg-neutral-900 rounded border border-neutral-800 text-sm overflow-auto">
            {output}
          </pre>
          <div className="absolute top-2 right-2">
            <CopyButton text={output} />
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
