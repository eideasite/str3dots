import { richTextToPlainText } from './richText.js'

export function articleCanPublish(article) {
  return Boolean(article?.title?.trim() && richTextToPlainText(article?.body || '').trim())
}
