export function estimateTokens(text = ''): number {
  return Math.ceil(text.length / 4)
}

export function formatTokenCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}
