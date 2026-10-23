import { createId } from './createId.js'

export const createArticle = (overrides = {}) => {
  const timestamp = new Date().toISOString()
  return {
    id: createId('article'),
    title: '',
    body: '',
    seoTitle: '',
    seoDescription: '',
    slug: '',
    status: 'draft',
    createdAt: timestamp,
    updatedAt: timestamp,
    scheduledAt: null,
    publishedAt: null,
    ...overrides,
  }
}

import { richTextToPlainText } from './richText.js'

const wordSegmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'word' }) : null
const graphemeSegmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null

export const getArticleTitle = (article) => (typeof article?.title === 'string' ? article.title.trim() : '') || 'தலைப்பில்லாத கட்டுரை'

export const getWordCountFromText = (text = '') => {
  const normalizedText = typeof text === 'string' ? text.trim() : ''
  if (!normalizedText) return 0
  if (wordSegmenter) {
    return Array.from(wordSegmenter.segment(normalizedText))
      .filter((segment) => segment.isWordLike).length
  }
  return normalizedText.split(/\s+/u).length
}

export const getReadingMinutesFromWordCount = (wordCount) => (
  Number.isFinite(wordCount) && wordCount > 0 ? Math.ceil(wordCount / 200) : 1
)

export function getArticleReadingMetrics(body = '') {
  const words = getWordCountFromText(richTextToPlainText(body))
  return { words, readingMinutes: getReadingMinutesFromWordCount(words) }
}

export const getWordCount = (body = '') => getArticleReadingMetrics(body).words
export const getReadingMinutes = (body = '') => getArticleReadingMetrics(body).readingMinutes

export const getArticleExcerpt = (body = '', limit = 170) => {
  const text = richTextToPlainText(body).replace(/\s+/gu, ' ').trim()
  const graphemes = graphemeSegmenter
    ? Array.from(graphemeSegmenter.segment(text), (segment) => segment.segment)
    : Array.from(text)
  return graphemes.length > limit ? `${graphemes.slice(0, limit).join('').trimEnd()}…` : text
}

export const makeSafeFilename = (title = '') => {
  const normalizedTitle = typeof title === 'string' ? title.trim() : ''
  return (normalizedTitle || 'என்-கட்டுரை').replace(/[\\/:*?"<>|]/gu, '-').slice(0, 80)
}

