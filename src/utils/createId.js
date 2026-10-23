let fallbackIdCounter = 0

export function createId(prefix) {
  const idPrefix = typeof prefix === 'string' && prefix.trim() ? `${prefix.trim()}-` : ''
  if (typeof globalThis.crypto?.randomUUID === 'function') return `${idPrefix}${globalThis.crypto.randomUUID()}`

  fallbackIdCounter += 1
  const randomPart = Math.random().toString(36).slice(2, 10)
  return `${idPrefix}${Date.now().toString(36)}-${fallbackIdCounter.toString(36)}-${randomPart}`
}
