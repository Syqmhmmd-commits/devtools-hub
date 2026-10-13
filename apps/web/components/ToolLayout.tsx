'use client'
import { useState } from 'react'
import Link from 'next/link'

export function ToolLayout({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-xs text-neutral-500 hover:text-neutral-300"
        >
          ← Kembali ke Hub
        </Link>
        <h1 className="text-3xl font-bold mt-2">{title}</h1>
        {description && (
          <p className="text-neutral-400 text-sm mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
