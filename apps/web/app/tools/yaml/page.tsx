'use client'
import { useState } from 'react'
import { yamlToJson, jsonToYaml } from '@devtools/tool-yaml'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

export default function Page() {
  const [input, setInput] = useState('name: test\nversion: 1.0.0\nitems:\n  - a\n  - b')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const toJson = async () => {
    const r = await yamlToJson(input)
    if (r.ok) { setOutput(r.output); setError('') } else { setError(r.error); setOutput('') }
  }
  const toYaml = async () => {
    const r = await jsonToYaml(input)
    if (r.ok) { setOutput(r.output); setError('') } else { setError(r.error); setOutput('') }
  }

  return (
    <ToolLayout title="YAML ↔ JSON" description="Konversi dua arah">
      <div className="flex gap-2">
        <button onClick={toJson} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">YAML → JSON</button>
        <button onClick={toYaml} className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm font-medium">JSON → YAML</button>
      </div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)}
        className="w-full h-48 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500" />
      {error && <p className="text-red-400 text-sm">❌ {error}</p>}
      {output && (
        <div className="relative">
          <pre className="p-3 bg-neutral-900 rounded border border-neutral-800 text-sm overflow-auto">{output}</pre>
          <div className="absolute top-2 right-2"><CopyButton text={output} /></div>
        </div>
      )}
    </ToolLayout>
  )
}
