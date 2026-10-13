export type FormatResult =
  | { ok: true; output: string; size: number }
  | { ok: false; error: string }

export function format(input: string, indent = 2): FormatResult {
  try {
    const parsed = JSON.parse(input)
    const output = JSON.stringify(parsed, null, indent)
    return { ok: true, output, size: output.length }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export function minify(input: string): FormatResult {
  try {
    const parsed = JSON.parse(input)
    const output = JSON.stringify(parsed)
    return { ok: true, output, size: output.length }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export function validate(input: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(input)
    return { valid: true }
  } catch (e) {
    return { valid: false, error: (e as Error).message }
  }
}
