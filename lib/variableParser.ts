const VAR_REGEX = /\{\{([^{}]+)\}\}/g

export function extractVariables(prompt: string): string[] {
  if (!prompt) return []
  const matches = [...prompt.matchAll(VAR_REGEX)]
  return [...new Set(matches.map((m) => m[1]))]
}

export function resolvePrompt(
  prompt: string,
  variables: Record<string, string> = {}
): string {
  if (!prompt) return ''
  return prompt.replace(VAR_REGEX, (match, name) => {
    const val = variables[name]
    return val && val.trim() ? val.trim() : match
  })
}

export function allVariablesFilled(
  prompt: string,
  variables: Record<string, string> = {}
): boolean {
  return extractVariables(prompt).every((name) => variables[name]?.trim())
}
