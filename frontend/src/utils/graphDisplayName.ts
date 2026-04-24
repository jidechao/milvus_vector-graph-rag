/** Map API graph id from GET /graphs to a short Chinese label for UI. */
export function graphDisplayName(name: string): string {
  if (name === 'unprefixed') return '默认（无前缀 vgrag_*）'
  return name
}
