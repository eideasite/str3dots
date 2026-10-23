import { createArticle } from '../utils/article.js'

export const WORKSPACE_KEY = 'jeyamohan-articles-workspace-v1'
const LEGACY_DRAFT_KEY = 'ezhuthu-draft-v1'
const WORKSPACE_RECOVERY_KEY = 'jeyamohan-articles-workspace-recovery-v1'
let lastObservedWorkspaceRaw
let workspaceBaselineLoaded = false
let workspaceWriteConflict = false
let workspaceRecoveryCopySaved = false
let workspaceRecoveryBlocked = false

const defaultWorkspace = () => ({
  profile: { name: '\u0b9c\u0bc6\u0baf\u0bbae\u0bcb\u0b95\u0ba9\u0bcd', bio: '', avatar: '\u270d\ufe0f' },
  articles: [createArticle()],
})

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

function parseStorageValue(key) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return { found: false, valid: false, value: null, raw: null }
    return { found: true, valid: true, value: JSON.parse(raw), raw }
  } catch {
    try {
      return { found: true, valid: false, value: null, raw: localStorage.getItem(key) }
    } catch {
      return { found: true, valid: false, value: null, raw: null }
    }
  }
}

function saveRecoveryCopy(raw) {
  if (typeof raw !== 'string') return false
  try {
    const current = localStorage.getItem(WORKSPACE_RECOVERY_KEY)
    const backups = current === null ? [] : JSON.parse(current)
    if (!Array.isArray(backups)) return false
    if (backups.some((backup) => backup?.raw === raw)) return true
    backups.push({ createdAt: new Date().toISOString(), raw })
    localStorage.setItem(WORKSPACE_RECOVERY_KEY, JSON.stringify(backups))
    return true
  } catch {
    return false
  }
}

function workspaceNeedsRecoveryCopy(stored) {
  if (!stored.found) return false
  if (!stored.valid || !isRecord(stored.value)) return true
  if (!Array.isArray(stored.value.articles)) return normalizeLegacyDraft(stored.value) === null
  const ids = new Set()
  return stored.value.articles.some((article) => {
    if (!isRecord(article) || typeof article.id !== 'string' || !article.id.trim() || ids.has(article.id)) return true
    ids.add(article.id)
    return false
  })
}

function normalizeArticle(value) {
  if (!isRecord(value)) return createArticle()
  const title = typeof value.title === 'string'
    ? value.title
    : typeof value.articleTitle === 'string' ? value.articleTitle : ''
  const body = typeof value.body === 'string'
    ? value.body
    : typeof value.content === 'string' ? value.content
      : typeof value.text === 'string' ? value.text : ''
  const article = createArticle({
    ...value,
    title,
    body,
    seoTitle: typeof value.seoTitle === 'string' ? value.seoTitle : '',
    seoDescription: typeof value.seoDescription === 'string' ? value.seoDescription : '',
    slug: typeof value.slug === 'string' ? value.slug : '',
  })
  if (typeof article.id !== 'string' || !article.id.trim()) article.id = createArticle().id
  if (!['draft', 'scheduled', 'published'].includes(article.status)) article.status = 'draft'
  const dateOrDefault = (date, fallback) => typeof date === 'string' && Number.isFinite(Date.parse(date)) ? date : fallback
  article.createdAt = dateOrDefault(article.createdAt, new Date().toISOString())
  article.updatedAt = dateOrDefault(article.updatedAt, article.createdAt)
  article.scheduledAt = dateOrDefault(article.scheduledAt, null)
  article.publishedAt = dateOrDefault(article.publishedAt, null)
  return article
}

function normalizeLegacyDraft(value) {
  if (typeof value === 'string') return createArticle({ body: value })
  if (!isRecord(value)) return null
  const legacyArticle = isRecord(value.article) ? value.article : value
  const normalized = normalizeArticle(legacyArticle)
  return normalized.title || normalized.body ? normalized : null
}

function readLegacyDraft() {
  const legacy = parseStorageValue(LEGACY_DRAFT_KEY)
  return legacy.valid ? normalizeLegacyDraft(legacy.value) : null
}

export function loadWorkspace() {
  const defaults = defaultWorkspace()
  const stored = parseStorageValue(WORKSPACE_KEY)
  lastObservedWorkspaceRaw = stored.raw
  workspaceBaselineLoaded = true
  workspaceWriteConflict = false
  workspaceRecoveryCopySaved = false
  workspaceRecoveryBlocked = false
  if (workspaceNeedsRecoveryCopy(stored)) {
    workspaceRecoveryCopySaved = saveRecoveryCopy(stored.raw)
    workspaceRecoveryBlocked = !workspaceRecoveryCopySaved
  }

  if (stored.found && stored.valid && isRecord(stored.value)) {
    const parsed = stored.value
    if (Array.isArray(parsed.articles)) {
      const savedProfile = isRecord(parsed.profile) ? parsed.profile : {}
      return {
        profile: {
          name: typeof savedProfile.name === 'string' ? savedProfile.name : defaults.profile.name,
          bio: typeof savedProfile.bio === 'string' ? savedProfile.bio : '',
          avatar: typeof savedProfile.avatar === 'string' && savedProfile.avatar ? savedProfile.avatar : defaults.profile.avatar,
        },
        articles: parsed.articles.map((article, index) => {
          const normalized = normalizeArticle(article)
          if (isRecord(article) && typeof article.id === 'string' && article.id.trim()
            && parsed.articles.slice(0, index).some((previous) => previous?.id === article.id)) {
            normalized.id = createArticle().id
          }
          return normalized
        }),
      }
    }

    // Older versions stored one draft at the workspace root instead of an articles array.
    const rootDraft = normalizeLegacyDraft(parsed)
    if (rootDraft) {
      const savedProfile = isRecord(parsed.profile) ? parsed.profile : {}
      return {
        profile: {
          name: typeof savedProfile.name === 'string' ? savedProfile.name : defaults.profile.name,
          bio: typeof savedProfile.bio === 'string' ? savedProfile.bio : '',
          avatar: typeof savedProfile.avatar === 'string' && savedProfile.avatar ? savedProfile.avatar : defaults.profile.avatar,
        },
        articles: [rootDraft],
      }
    }
  }

  // Keep the old key intact while migrating; malformed current storage must not hide a valid old draft.
  const legacyDraft = readLegacyDraft()
  if (legacyDraft) return { ...defaults, articles: [legacyDraft] }

  return defaults
}

export function saveWorkspace(workspace) {
  try {
    if (workspaceRecoveryBlocked) return false
    const currentRaw = localStorage.getItem(WORKSPACE_KEY)
    if (!workspaceBaselineLoaded) {
      lastObservedWorkspaceRaw = currentRaw
      workspaceBaselineLoaded = true
    }
    if (currentRaw !== lastObservedWorkspaceRaw) {
      workspaceWriteConflict = true
      return false
    }
    const nextRaw = JSON.stringify(workspace)
    localStorage.setItem(WORKSPACE_KEY, nextRaw)
    lastObservedWorkspaceRaw = nextRaw
    workspaceWriteConflict = false
    return true
  } catch {
    return false
  }
}

export const hasWorkspaceWriteConflict = () => workspaceWriteConflict
export const getWorkspaceRecoveryState = () => workspaceRecoveryBlocked ? 'blocked' : workspaceRecoveryCopySaved ? 'saved' : null
export function getWorkspaceRecoveryData() {
  if (!workspaceRecoveryCopySaved) return workspaceRecoveryBlocked ? lastObservedWorkspaceRaw : null
  try {
    const backups = JSON.parse(localStorage.getItem(WORKSPACE_RECOVERY_KEY) || '[]')
    return Array.isArray(backups) ? backups[backups.length - 1]?.raw || null : null
  } catch {
    return null
  }
}
