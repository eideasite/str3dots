const BOOKMARKS_KEY = 'jeyamohan-article-bookmarks-v1'
const HOME_SHORTCUTS_KEY = 'jeyamohan-home-article-shortcuts-v1'

function normalizeArticleIds(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((id) => typeof id === 'string').map((id) => id.trim()).filter(Boolean))]
}

function loadArticleIds(key) {
  try {
    const stored = localStorage.getItem(key)
    return stored === null ? [] : normalizeArticleIds(JSON.parse(stored))
  } catch {
    return []
  }
}

function saveArticleIds(key, articleIds) {
  if (!Array.isArray(articleIds) || articleIds.some((id) => typeof id !== 'string' || !id.trim())) return false
  try {
    const existing = localStorage.getItem(key)
    if (existing !== null) {
      let parsed
      try {
        parsed = JSON.parse(existing)
      } catch {
        return false
      }
      if (!Array.isArray(parsed)
        || parsed.some((id) => typeof id !== 'string' || !id.trim())
        || normalizeArticleIds(parsed).length !== parsed.length) return false
    }
    localStorage.setItem(key, JSON.stringify(normalizeArticleIds(articleIds)))
    return true
  } catch {
    return false
  }
}

export const loadBookmarkedArticleIds = () => loadArticleIds(BOOKMARKS_KEY)
export const saveBookmarkedArticleIds = (articleIds) => saveArticleIds(BOOKMARKS_KEY, articleIds)
export const loadHomeShortcutArticleIds = () => loadArticleIds(HOME_SHORTCUTS_KEY)
export const saveHomeShortcutArticleIds = (articleIds) => saveArticleIds(HOME_SHORTCUTS_KEY, articleIds)
