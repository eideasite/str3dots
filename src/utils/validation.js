import { richTextToPlainText } from './richText.js'

export function articleCanPublish(article) {
  const title = typeof article?.title === 'string' ? article.title.trim() : ''
  const body = richTextToPlainText(typeof article?.body === 'string' ? article.body : '').trim()
  return Boolean(title && body)
}
