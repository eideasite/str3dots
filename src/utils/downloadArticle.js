import { getArticleTitle, makeSafeFilename } from './article.js'
import { richTextToPlainText } from './richText.js'

export function downloadArticle(article) {
  const blob = new Blob([`${getArticleTitle(article)}\n\n${richTextToPlainText(article.body || '')}`], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${makeSafeFilename(article.title)}.txt`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

