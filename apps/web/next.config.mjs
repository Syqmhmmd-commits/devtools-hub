import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@devtools/tool-base64',
    '@devtools/tool-json',
    '@devtools/tool-uuid',
    '@devtools/tool-hash',
    '@devtools/tool-timestamp',
    '@devtools/tool-jwt',
    '@devtools/tool-color',
    '@devtools/tool-regex',
    '@devtools/tool-cron',
    '@devtools/tool-case',
    '@devtools/tool-password',
    '@devtools/tool-qr',
    '@devtools/tool-diff',
    '@devtools/tool-lorem',
    '@devtools/tool-url',
    '@devtools/tool-yaml',
    '@devtools/tool-markdown',
    '@devtools/tool-slug',
    '@devtools/tool-semver',
    '@devtools/tool-mime',
  ],
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
}

export default nextConfig
