# 🛠️ DevTools Hub

**20 tools developer ringan — jalan di CLI dan browser.**
**100% client-side, gak ada data yang dikirim ke server.**

[![MIT License](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-12-f69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

[Demo](https://devtools-hub.vercel.app) · [Report Bug](https://github.com/Syqmhmmd-commits/devtools-hub/issues) · [Request Feature](https://github.com/Syqmhmmd-commits/devtools-hub/issues)

</div>

---

## ✨ Kenapa DevTools Hub?

Kebanyakan tools online buat developer itu:
- ❌ Kirim data ke server (privacy risk)
- ❌ Penuh iklan
- ❌ Cuma bisa diakses lewat web, gak ada CLI
- ❌ Gak bisa self-host

**DevTools Hub** beda:
- ✅ 100% client-side — data lu gak keluar dari device
- ✅ Jalan di CLI **dan** browser, satu codebase
- ✅ Monorepo — gampang nambah tool baru
- ✅ Open source, self-hostable

## 🧰 20 Tools

<table>
<tr>
<td valign="top" width="50%">

### 📦 Encoding & Data
- **Base64** — encode/decode teks
- **JSON** — format, minify, validate
- **YAML ↔ JSON** — konversi dua arah
- **URL Parser** — breakdown komponen
- **MIME Lookup** — extension → MIME type

### 🔤 Text
- **Case Converter** — 9 format
- **Slug Generator** — URL-friendly
- **Regex Tester** — test + explain
- **Text Diff** — compare 2 teks
- **Lorem Ipsum** — placeholder
- **Markdown** — live preview

</td>
<td valign="top" width="50%">

### 🔒 Security
- **Hash** — SHA-1/256/384/512
- **JWT Decoder** — decode + expiry
- **Password Generator** — + strength meter

### ⏰ Time
- **Timestamp** — Unix ↔ human
- **Cron Explainer** — field + next runs

### 🎨 Design
- **Color Tools** — palette, contrast
- **QR Generator** — custom warna + size

### 🆔 Misc
- **ID Generator** — UUID, NanoID, ULID
- **Semver** — compare & bump

</td>
</tr>
</table>

## 🚀 Quick Start

### Web App

```bash
git clone https://github.com/Syqmhmmd-commits/devtools-hub.git
cd devtools-hub
pnpm install
pnpm dev

Buka http://localhost:3000

CLI
# Base64
pnpm cli b64 encode "hello world"
# → aGVsbG8gd29ybGQ=

# JWT decode
pnpm cli jwt "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Color palette
pnpm cli color "#3b82f6"

# Generate password
pnpm cli pw 24

# Cron explainer
pnpm cli cron "*/5 * * * *"

# List semua command
pnpm cli --help

🏗️ Arsitektur

                  ┌──────────────────┐
                  │   tool-xxx/      │
                  │  (pure functions)│
                  └────────┬─────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │   CLI       │           │    Web      │
       │ (Node APIs) │           │ (Browser)   │
       └─────────────┘           └─────────────┘


📁 Struktur

devtools-hub/
├── packages/
│   ├── core/                 # shared utils
│   ├── tool-base64/          # 20 tool packages
│   ├── tool-json/
│   └── ...
├── apps/
│   ├── cli/                  # commander-based CLI
│   └── web/                  # Next.js 16 + Tailwind v4
├── pnpm-workspace.yaml
└── package.json

🛠️ Development

pnpm install              # install semua dependencies
pnpm dev                  # jalanin web (localhost:3000)
pnpm cli <cmd>            # jalanin CLI via tsx
pnpm --filter cli build   # build CLI untuk publish

📝 Lisensi

MIT © Syqmhmmd-commits

<div align="center">
⭐ Kalau berguna, kasih star ya! ⭐
