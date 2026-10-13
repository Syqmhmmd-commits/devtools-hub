'use client'
import { useState } from 'react'
import { generate, nanoid, ulid } from '@devtools/tool-uuid'
import { ToolLayout, CopyButton } from '@/components/ToolLayout'

type IdType = 'uuid' | 'nanoid' | 'ulid'

export default function Page() {
  const [count, setCount] = useState(5)
  const [type, setType] = useState<IdType>('uuid')
  const [list, setList] = useState<string[]>([])

  const run = () => {
    const gen =
      type === 'uuid'
        ? generate(count)
        : type === 'nanoid'
        ? Array.from({ length: count }, () => nanoid())
        : Array.from({ length: count }, () => ulid())
    setList(gen)
  }

  return (
    <ToolLayout title="ID Generator" description="Generate UUID, NanoID, atau ULID">
      <div className="flex gap-2 items-center flex-wrap">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as IdType)}
          className="bg-neutral-800 px-3 py-2 rounded text-sm"
        >
          <option value="uuid">UUID v4</option>
          <option value="nanoid">NanoID</option>
          <option value="ulid">ULID</option>
        </select>
        <input
          type="number"
          value={count}
          min={1}
          max={100}
          onChange={(e) => setCount(Math.max(1, Math.min(100, +e.target.value)))}
          className="bg-neutral-800 px-3 py-2 rounded w-24 text-sm"
        />
        <button onClick={run} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium">
          Generate
        </button>
      </div>
      {list.length > 0 && (
        <div className="relative">
          <pre className="p-3 bg-neutral-900 rounded border border-neutral-800 text-sm overflow-auto">
            {list.join('\n')}
          </pre>
          <div className="absolute top-2 right-2">
            <CopyButton text={list.join('\n')} />
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
