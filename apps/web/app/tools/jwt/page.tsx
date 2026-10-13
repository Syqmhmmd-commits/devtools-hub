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
