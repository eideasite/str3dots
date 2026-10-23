import DOMPurify from 'dompurify'

const ALLOWED_TAGS = new Set(['P', 'DIV', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'SPAN', 'H1', 'H2', 'H3', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'CODE', 'HR', 'A', 'IMG'])
const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [...ALLOWED_TAGS].map((tag) => tag.toLowerCase()),
  ALLOWED_ATTR: ['href', 'src', 'alt', 'data-text-size'],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'form'],
  RETURN_TRUSTED_TYPE: false,
}

export function isRichTextHtml(value = '') {
  return typeof value === 'string'
    && /<(?:p|div|br|strong|b|em|i|u|s|span|h[1-3]|ul|ol|li|blockquote|pre|code|hr|a|img)(?:\s|\/?>)/i.test(value)
}

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

function isSafeUrl(value, image = false) {
  const candidate = typeof value === 'string' ? value.trim() : ''
  if (!candidate || [...candidate].some((character) => {
    const code = character.charCodeAt(0)
    return code <= 31 || code === 127
  })) return false
  if (image && /^data:image\/(?:png|jpeg|gif|webp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(candidate) && candidate.length <= 1500000) return true
  try {
    const url = new URL(candidate, window.location.origin)
    if (url.username || url.password) return false
    if (url.protocol === 'mailto:') return !image
    if (!['http:', 'https:'].includes(url.protocol)) return false
    return url.origin === window.location.origin || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function sanitizeRichTextHtml(value = '') {
  if (typeof value !== 'string') return ''
  if (typeof DOMParser === 'undefined') return escapeHtml(value)
  const template = document.createElement('template')
  template.innerHTML = DOMPurify.sanitize(value, SANITIZE_OPTIONS)
  template.content.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href')
    if (!href || !isSafeUrl(href)) {
      anchor.removeAttribute('href')
      anchor.removeAttribute('target')
      anchor.removeAttribute('rel')
      return
    }
    anchor.setAttribute('href', href.trim())
    anchor.setAttribute('target', '_blank')
    anchor.setAttribute('rel', 'noopener noreferrer')
  })
  template.content.querySelectorAll('img').forEach((image) => {
    const src = image.getAttribute('src')
    if (!src || !isSafeUrl(src, true)) image.removeAttribute('src')
    else image.setAttribute('src', src.trim())
    image.setAttribute('loading', 'lazy')
  })
  template.content.querySelectorAll('span').forEach((span) => {
    const textSize = span.getAttribute('data-text-size')
    if (!/^[0-4]$/.test(textSize || '')) span.removeAttribute('data-text-size')
  })
  return template.innerHTML
}

function formatMarkdownInline(value) {
  let text = escapeHtml(value)
  text = text.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, (_, alt, src) => `<img src="${escapeHtml(src)}" alt="${alt}">`)
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, (_, label, href) => `<a href="${escapeHtml(href)}">${label}</a>`)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>')
  return text
}

export function plainTextToHtml(value = '') {
  if (typeof value !== 'string') return ''
  const lines = value.split('\n')
  const output = []
  let listType = null
  const closeList = () => { if (listType) { output.push(`</${listType}>`); listType = null } }
  for (const line of lines) {
    const heading = line.match(/^(#{1,2})\s+(.+)$/)
    const bullet = line.match(/^\s*[-*]\s+(.+)$/)
    const numbered = line.match(/^\s*\d+\.\s+(.+)$/)
    if (heading) { closeList(); const level = heading[1].length; output.push(`<h${level}>${formatMarkdownInline(heading[2])}</h${level}>`); continue }
    if (/^\s*---+\s*$/.test(line)) { closeList(); output.push('<hr>'); continue }
    if (/^>\s?/.test(line)) { closeList(); output.push(`<blockquote><p>${formatMarkdownInline(line.replace(/^>\s?/, ''))}</p></blockquote>`); continue }
    const nextListType = bullet ? 'ul' : numbered ? 'ol' : null
    if (nextListType) {
      if (listType !== nextListType) { closeList(); output.push(`<${nextListType}>`); listType = nextListType }
      output.push(`<li>${formatMarkdownInline((bullet || numbered)[1])}</li>`); continue
    }
    closeList()
    if (!line.trim()) continue
    output.push(`<p>${formatMarkdownInline(line)}</p>`)
  }
  closeList()
  return output.join('')
}

export function richTextToHtml(value = '') {
  if (typeof value !== 'string' || !value.trim()) return ''
  return sanitizeRichTextHtml(isRichTextHtml(value) ? value : plainTextToHtml(value))
}

export function richTextToPlainText(value = '') {
  if (typeof value !== 'string' || !value.trim()) return ''
  if (typeof DOMParser === 'undefined') return value.replace(/<[^>]*>/g, ' ')
  const doc = new DOMParser().parseFromString(richTextToHtml(value), 'text/html')
  doc.querySelectorAll('img').forEach((node) => node.replaceWith(node.alt || '[Image]'))
  doc.querySelectorAll('br,hr').forEach((node) => node.replaceWith('\n'))
  doc.querySelectorAll('p,h1,h2,h3,li,blockquote,pre').forEach((node) => node.append('\n'))
  return (doc.body.textContent || '').replace(/\u00a0/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

export function isSafeRichTextUrl(value, image = false) {
  return isSafeUrl(value, image)
}
