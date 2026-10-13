<div align="center">

# 🛠️ DevTools Hub

**20 tools developer ringan — jalan di CLI dan browser.**
**100% client-side, gak ada data yang dikirim ke server.**

[![MIT License](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-12-f69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

[Report Bug](https://github.com/Syqmhmmd-commits/devtools-hub/issues) · [Request Feature](https://github.com/Syqmhmmd-commits/devtools-hub/issues)

</div>

---

## ✨ Kenapa DevTools Hub?

Kebanyakan tools online buat developer itu kirim data ke server (privacy risk), penuh iklan, dan gak ada versi CLI-nya.

**DevTools Hub** beda:

- ✅ **100% client-side** — data lu gak keluar dari device
- ✅ **Jalan di CLI + browser** — satu codebase
- ✅ **Monorepo** — gampang nambah tool baru
- ✅ **Open source** — self-hostable, gak ada tracking

## 🧰 20 Tools

| Kategori | Tools |
|----------|-------|
| 📦 **Encoding & Data** | Base64, JSON, YAML ↔ JSON, URL Parser, MIME Lookup |
| 🔤 **Text** | Case Converter, Slug, Regex, Text Diff, Lorem, Markdown |
| 🔒 **Security** | Hash, JWT Decoder, Password Generator |
| ⏰ **Time** | Timestamp, Cron Explainer |
| 🎨 **Design** | Color Tools, QR Generator |
| 🆔 **Misc** | ID Generator (UUID/NanoID/ULID), Semver |

## 🚀 Quick Start

### Web App

```bash
git clone https://github.com/Syqmhmmd-commits/devtools-hub.git
cd devtools-hub
pnpm install
pnpm dev
Buka http://localhost:3000
```
## CLI 
$ dt list

  DevTools Hub  — 20 tools

  [E]  Encoding & Data
     dt b64 <mode> <input>              Encode/decode Base64
     dt json <mode> [file]              Format, minify, validate
     dt yaml <mode> [file]              YAML ↔ JSON
     dt url <input>                     Parse URL
     dt mime <query>                    Cari MIME type

  [T]  Text
     dt case <input>                    9 format teks
     dt slug <input>                    URL-friendly slug
     dt regex <pattern> <text>          Test regex
     dt diff <fileA> <fileB>            Compare 2 file
     dt lorem [type] [count]            Placeholder text
     dt md [file]                       Markdown → HTML

  [S]  Security
     dt hash <input>                    SHA-1/256/384/512
     dt jwt <token>                     Decode JWT
     dt pw [length]                     Generate password
     dt pwcheck <password>              Cek strength

  [T]  Time
     dt ts [value]                      Unix timestamp
     dt cron <expr>                     Explain cron

  [D]  Design
     dt color <hex>                     Konversi + palette
     dt qr <text>                       Generate QR code

  [M]  Misc
     dt uuid                            UUID/NanoID/ULID
     dt semver <mode> <a> [b]           Compare versi

Contoh output berwarna:

$ dt hash "hello"

  input: hello

  > SHA-1    aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
  > SHA-256  2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
  > SHA-384  59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90...
  > SHA-512  9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673c...

$ dt color "#3b82f6"

              #3b82f6

  HEX:  #3b82f6
  RGB:  rgb(59, 130, 246)
  HSL:  hsl(217, 91%, 60%)

  > Palette
            #e7f0fe
            #b6d1fc
            #6da2f8
            #2474f5
            #0a5adb
            #0846aa
            #06327a
            #031e49

## 🏗️ Arsitektur
Setiap tool punya core logic murni yang di-share antara CLI & Web:

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

## 📁 Struktur

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

## 🛠️ Development

pnpm install              # install semua dependencies
pnpm dev                  # jalanin web (localhost:3000)
pnpm cli <cmd>            # jalanin CLI via tsx
pnpm --filter cli build   # build CLI untuk publish

## 📝 Lisensi
MIT © Syqmhmmd-commits

<div align="center">
⭐ Kalau berguna, kasih star ya! ⭐

</div> ```
