let fallbackIdCounter = 0

function createId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  fallbackIdCounter += 1
  const randomPart = Math.random().toString(36).slice(2, 10)
  return `article-${Date.now().toString(36)}-${fallbackIdCounter.toString(36)}-${randomPart}`
}

export const createArticle = (overrides = {}) => ({
  id: createId(),
  title: '',
  body: '',
  seoTitle: '',
  seoDescription: '',
  slug: '',
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  scheduledAt: null,
  publishedAt: null,
  ...overrides,
})

import { richTextToPlainText } from './richText.js'

export const getArticleTitle = (article) => (typeof article?.title === 'string' ? article.title.trim() : '') || 'தலைப்பில்லாத கட்டுரை'

export const getWordCount = (body = '') => {
  const text = richTextToPlainText(body)
  if (!text) return 0
  if (typeof Intl.Segmenter === 'function') {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text))
      .filter((segment) => segment.isWordLike).length
  }
  return text.split(/\s+/u).length
}

export const getReadingMinutes = (body = '') => Math.max(1, Math.ceil(getWordCount(body) / 200))

export const getArticleExcerpt = (body = '', limit = 170) => {
  const text = richTextToPlainText(body).replace(/\s+/gu, ' ').trim()
  const graphemes = typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (segment) => segment.segment)
    : Array.from(text)
  return graphemes.length > limit ? `${graphemes.slice(0, limit).join('').trimEnd()}…` : text
}

export const makeSafeFilename = (title = '') =>
  (title.trim() || 'என்-கட்டுரை').replace(/[\\/:*?"<>|]/gu, '-').slice(0, 80)

