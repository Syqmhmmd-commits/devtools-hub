export interface QROptions {
  size?: number
  margin?: number
  color?: { dark?: string; light?: string }
}

export async function toDataURL(text: string, opts: QROptions = {}): Promise<string> {
  const QRCode = (await import('qrcode')).default
  return QRCode.toDataURL(text, {
    width: opts.size ?? 300,
    margin: opts.margin ?? 2,
    color: {
      dark: opts.color?.dark ?? '#000000',
      light: opts.color?.light ?? '#ffffff',
    },
  })
}

export async function toSVG(text: string, opts: QROptions = {}): Promise<string> {
  const QRCode = (await import('qrcode')).default
  return QRCode.toString(text, {
    type: 'svg',
    width: opts.size ?? 300,
    margin: opts.margin ?? 2,
    color: {
      dark: opts.color?.dark ?? '#000000',
      light: opts.color?.light ?? '#ffffff',
    },
  })
}
