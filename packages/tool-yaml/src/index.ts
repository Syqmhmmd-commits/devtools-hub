export type Result =
  | { ok: true; output: string }
  | { ok: false; error: string }

export async function yamlToJson(yaml: string, indent = 2): Promise<Result> {
  try {
    const jsYaml = await import('js-yaml')
    const parsed = jsYaml.load(yaml)
    return { ok: true, output: JSON.stringify(parsed, null, indent) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function jsonToYaml(json: string): Promise<Result> {
  try {
    const jsYaml = await import('js-yaml')
    const parsed = JSON.parse(json)
    return { ok: true, output: jsYaml.dump(parsed, { indent: 2 }) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
