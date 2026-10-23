import { getArticleTitle, makeSafeFilename } from './article.js'
import { richTextToPlainText } from './richText.js'

export function downloadArticle(article) {
  const title = getArticleTitle(article)
  const body = richTextToPlainText(article?.body || '')
  const blob = new Blob([`${title}\n\n${body}`], { type: 'text/plain;charset=utf-8' })
  let url
  const link = document.createElement('a')
  try {
    url = URL.createObjectURL(blob)
    link.href = url
    link.download = `${makeSafeFilename(title)}.txt`
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    if (url) window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

