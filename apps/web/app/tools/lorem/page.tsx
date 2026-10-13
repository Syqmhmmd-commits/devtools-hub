'use client'
import { useState } from 'react'
import { words, sentences, paragraphs } from '@devtools/tool-lorem'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

type Type = 'words' | 'sentences' | 'paragraphs'

export default function Page() {
  const [type, setType] = useState<Type>('paragraphs')
  const [count, setCount] = useState(3)
  const [output, setOutput] = useState(paragraphs(3))

  const gen = () => {
    const fn = type === 'words' ? words : type === 'sentences' ? sentences : paragraphs
    setOutput(fn(count))
  }

  return (
    <ToolLayout title="Lorem Ipsum" description="Generate teks placeholder">
      <div className="flex gap-2 items-center flex-wrap">
        <select value={type} onChange={(e) => setType(e.target.value as Type)}
          className="bg-neutral-800 px-3 py-2 rounded text-sm">
          <option value="words">Kata</option>
          <option value="sentences">Kalimat</option>
          <option value="paragraphs">Paragraf</option>
        </select>
        <input type="number" min={1} max={50} value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(50, +e.target.value)))}
          className="bg-neutral-800 px-3 py-2 rounded w-24 text-sm" />
        <button onClick={gen} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">
          Generate
        </button>
        <CopyButton text={output} />
      </div>
      <pre className="p-4 bg-neutral-900 rounded border border-neutral-800 text-sm whitespace-pre-wrap leading-relaxed">
        {output}
      </pre>
    </ToolLayout>
  )
}
