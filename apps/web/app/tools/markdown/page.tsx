'use client'
import { useState, useEffect } from 'react'
import { render, stats } from '@devtools/tool-markdown'
import { ToolLayout } from '@/components/ToolLayout'

export default function Page() {
  const [md, setMd] = useState('# Hello\n\nIni **markdown** dengan `code` dan [link](https://example.com).\n\n- item 1\n- item 2')
  const [html, setHtml] = useState('')
  const s = stats(md)

  useEffect(() => { render(md).then(setHtml) }, [md])

  return (
    <ToolLayout title="Markdown Preview" description="Render markdown real-time">
      <div className="flex gap-4 text-xs text-neutral-400">
        <span>{s.words} words</span>
        <span>{s.chars} chars</span>
        <span>{s.lines} lines</span>
        <span>~{s.readingTime} min read</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <textarea value={md} onChange={(e) => setMd(e.target.value)}
          className="h-96 p-3 bg-neutral-900 rounded border border-neutral-800 font-mono text-sm focus:outline-none focus:border-blue-500" />
        <div
          className="h-96 p-4 bg-neutral-900 rounded border border-neutral-800 overflow-auto prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </ToolLayout>
  )
}
