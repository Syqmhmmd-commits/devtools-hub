import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'DevTools Hub',
  description: 'Kumpulan tools developer ringan, 100% di browser.',
}

const navItems = [
  { href: '/tools/base64', label: 'Base64' },
  { href: '/tools/json', label: 'JSON' },
  { href: '/tools/uuid', label: 'UUID' },
  { href: '/tools/hash', label: 'Hash' },
  { href: '/tools/timestamp', label: 'Time' },
  { href: '/tools/jwt', label: 'JWT' },
  { href: '/tools/color', label: 'Color' },
  { href: '/tools/regex', label: 'Regex' },
  { href: '/tools/cron', label: 'Cron' },
  { href: '/tools/case', label: 'Case' },
  { href: '/tools/password', label: 'Pass' },
  { href: '/tools/qr', label: 'QR' },
  { href: '/tools/diff', label: 'Diff' },
  { href: '/tools/lorem', label: 'Lorem' },
  { href: '/tools/url', label: 'URL' },
  { href: '/tools/yaml', label: 'YAML' },
  { href: '/tools/markdown', label: 'MD' },
  { href: '/tools/slug', label: 'Slug' },
  { href: '/tools/semver', label: 'Semver' },
  { href: '/tools/mime', label: 'MIME' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <header className="border-b border-neutral-800 px-6 py-4 sticky top-0 bg-neutral-950/80 backdrop-blur z-10">
          <div className="max-w-6xl mx-auto flex items-center gap-6">
            <Link href="/" className="font-bold text-lg shrink-0">
              🛠️ DevTools
            </Link>
            <nav className="flex gap-3 text-sm text-neutral-400 overflow-x-auto scrollbar-thin">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-neutral-100 whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-6 pt-8">{children}</main>
      </body>
    </html>
  )
}
