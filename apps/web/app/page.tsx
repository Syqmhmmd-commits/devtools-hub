import Link from 'next/link'

const groups = [
  {
    name: 'Encoding & Data',
    tools: [
      { href: '/tools/base64', name: 'Base64', desc: 'Encode & decode teks', icon: '🔤' },
      { href: '/tools/json', name: 'JSON', desc: 'Format, minify, validate', icon: '📋' },
      { href: '/tools/yaml', name: 'YAML ↔ JSON', desc: 'Konversi dua arah', icon: '📄' },
      { href: '/tools/url', name: 'URL Parser', desc: 'Breakdown komponen URL', icon: '🔗' },
      { href: '/tools/mime', name: 'MIME Lookup', desc: 'Extension → MIME type', icon: '📎' },
    ],
  },
  {
    name: 'Text',
    tools: [
      { href: '/tools/case', name: 'Case Converter', desc: '9 format teks', icon: '🔠' },
      { href: '/tools/slug', name: 'Slug Generator', desc: 'URL-friendly slug', icon: '🐌' },
      { href: '/tools/regex', name: 'Regex Tester', desc: 'Test + explain pattern', icon: '🔍' },
      { href: '/tools/diff', name: 'Text Diff', desc: 'Compare 2 teks', icon: '🔀' },
      { href: '/tools/lorem', name: 'Lorem Ipsum', desc: 'Placeholder text', icon: '📝' },
      { href: '/tools/markdown', name: 'Markdown', desc: 'Live preview', icon: '📖' },
    ],
  },
  {
    name: 'Security',
    tools: [
      { href: '/tools/hash', name: 'Hash', desc: 'SHA-1/256/384/512', icon: '🔐' },
      { href: '/tools/jwt', name: 'JWT Decoder', desc: 'Decode + expiry', icon: '🎫' },
      { href: '/tools/password', name: 'Password', desc: 'Generator + strength', icon: '🔑' },
    ],
  },
  {
    name: 'Time & Cron',
    tools: [
      { href: '/tools/timestamp', name: 'Timestamp', desc: 'Unix & human date', icon: '⏰' },
      { href: '/tools/cron', name: 'Cron Explainer', desc: 'Field + next runs', icon: '⏱️' },
    ],
  },
  {
    name: 'Design',
    tools: [
      { href: '/tools/color', name: 'Color Tools', desc: 'Palette, contrast', icon: '🎨' },
      { href: '/tools/qr', name: 'QR Generator', desc: 'Custom color & size', icon: '📱' },
    ],
  },
  {
    name: 'Misc',
    tools: [
      { href: '/tools/uuid', name: 'ID Generator', desc: 'UUID, NanoID, ULID', icon: '🆔' },
      { href: '/tools/semver', name: 'Semver', desc: 'Compare & bump versi', icon: '🏷️' },
    ],
  },
]

const totalTools = groups.reduce((sum, g) => sum + g.tools.length, 0)

export default function Home() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">DevTools Hub</h1>
        <p className="text-neutral-400 mt-2">
          {totalTools} tools developer ringan, jalan 100% di browser. Gak ada data yang dikirim ke server.
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.name} className="space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-neutral-500 font-semibold">
            {group.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {group.tools.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="p-5 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-blue-500 transition group"
              >
                <div className="text-3xl">{t.icon}</div>
                <div className="font-semibold mt-3">{t.name}</div>
                <div className="text-xs text-neutral-400 mt-1">{t.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
