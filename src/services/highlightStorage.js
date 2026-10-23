const HIGHLIGHTS_KEY = 'jeyamohan-highlights-v1'

function createId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  return `highlight-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function createHighlightCollection() {
  return { id: createId(), title: '', items: [], updatedAt: new Date().toISOString() }
}

export function createArticleHighlight({ articleId, articleTitle, text, selectedText = false }) {
  return {
    id: createId(),
    articleId,
    articleTitle,
    text,
    selectedText,
    createdAt: new Date().toISOString(),
  }
}

function isValidArticleHighlight(highlight) {
  return highlight && typeof highlight === 'object'
    && typeof highlight.id === 'string' && highlight.id.trim()
    && typeof highlight.articleId === 'string' && highlight.articleId.trim()
    && typeof highlight.articleTitle === 'string'
    && typeof highlight.text === 'string' && highlight.text.trim()
    && typeof highlight.selectedText === 'boolean'
    && typeof highlight.createdAt === 'string' && Number.isFinite(Date.parse(highlight.createdAt))
}

export function loadHighlights() {
  try {
    const stored = JSON.parse(localStorage.getItem(HIGHLIGHTS_KEY) || '[]')
    if (!Array.isArray(stored)) return []
    return stored.filter((item) => item && typeof item === 'object').map((item) => ({
      id: typeof item.id === 'string' ? item.id : createId(),
      title: typeof item.title === 'string' ? item.title : '',
      items: Array.isArray(item.items) ? item.items.filter((image) => image && typeof image.src === 'string').map((image) => ({
        id: typeof image.id === 'string' ? image.id : createId(),
        src: image.src,
        name: typeof image.name === 'string' ? image.name : '',
      })) : [],
      articleHighlights: Array.isArray(item.articleHighlights) ? item.articleHighlights.filter(isValidArticleHighlight).map((highlight) => ({
        id: highlight.id,
        articleId: highlight.articleId,
        articleTitle: highlight.articleTitle,
        text: highlight.text,
        selectedText: highlight.selectedText === true,
        createdAt: typeof highlight.createdAt === 'string' && Number.isFinite(Date.parse(highlight.createdAt)) ? highlight.createdAt : new Date().toISOString(),
      })) : [],
      updatedAt: typeof item.updatedAt === 'string' && Number.isFinite(Date.parse(item.updatedAt)) ? item.updatedAt : new Date().toISOString(),
    })).filter((item) => item.title || item.items.length || item.articleHighlights.length)
  } catch {
    return []
  }
}

export function saveHighlights(highlights) {
  if (!Array.isArray(highlights) || highlights.some((item) => (
    !item || typeof item.id !== 'string' || !item.id.trim()
    || typeof item.title !== 'string' || !item.title.trim()
    || !Array.isArray(item.items) || item.items.length > 8
    || item.items.some((image) => !image || typeof image.src !== 'string' || !image.src.startsWith('data:image/'))
    || (item.articleHighlights !== undefined && (!Array.isArray(item.articleHighlights) || item.articleHighlights.some((highlight) => !isValidArticleHighlight(highlight))))
  ))) return false

  try {
    const current = localStorage.getItem(HIGHLIGHTS_KEY)
    if (current !== null) {
      try {
        const parsed = JSON.parse(current)
        if (!Array.isArray(parsed) || parsed.some((item) => (
          !item || typeof item !== 'object' || typeof item.id !== 'string'
          || typeof item.title !== 'string' || !Array.isArray(item.items)
          || item.items.some((image) => !image || typeof image.src !== 'string')
          || (item.articleHighlights !== undefined && (!Array.isArray(item.articleHighlights) || item.articleHighlights.some((highlight) => !isValidArticleHighlight(highlight))))
        ))) return false
      } catch {
        // Keep malformed saved data intact rather than replacing it with a new list.
        return false
      }
    }
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights))
    return true
  } catch {
    return false
  }
}
