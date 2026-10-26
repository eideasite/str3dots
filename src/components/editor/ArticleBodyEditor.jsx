import { forwardRef, useCallback, useEffect, useRef } from 'react'
import { App } from 'antd'

import { notifyAppError } from '../../services/errorNotifications.js'
import { richTextToHtml, richTextToPlainText, sanitizeRichTextHtml } from '../../utils/richText.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

const ACCEPTED_PASTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
const MAX_PASTED_IMAGE_SIZE = 4 * 1024 * 1024

function isLegacyObjectPlaceholder(value) {
  return typeof value === 'string' && richTextToPlainText(value).trim() === '[object Object]'
}

const MOBILE_COMMANDS = {
  '11;': { format: 'bold', mode: 'bold' },
  '22;': { format: 'fontIncrease', mode: 'fontIncrease' },
  '21;': { format: 'fontDecrease', mode: 'fontDecrease' },
  '31;': { format: 'underline', mode: 'underline' },
  '33;': { format: 'italic', mode: 'italic' },
  '44;': { format: 'bullet', mode: 'bullet' },
  '45;': { format: 'number', mode: 'number' },
  '46;': { format: 'quote', mode: 'quote' },
  '40;': { format: 'rule' },
  '50;': { format: 'link' },
  '54;': { format: 'image' },
  '55;': { format: 'codeblock', mode: 'codeblock' },
  '1;': { format: 'heading1' },
  '2;': { format: 'heading2' },
  '3;': { format: 'heading3' },
}
const MOBILE_COMMAND_TOKENS = Object.keys(MOBILE_COMMANDS)
const MOBILE_VIEWPORT_QUERY = '(max-width: 700px)'

function isFontMode(mode) {
  return mode === 'fontIncrease' || mode === 'fontDecrease'
}

function getMobileCommandToken(text, caretOffset) {
  const beforeCaret = text.slice(0, caretOffset)
  if (beforeCaret.endsWith(';;')) return ';;'
  return MOBILE_COMMAND_TOKENS.find((token) => beforeCaret.endsWith(token)) || null
}

const ArticleBodyEditor = forwardRef(function ArticleBodyEditor({ value, onChange, onSelectionChange, onMobileCommand }, forwardedRef) {
  const { message } = App.useApp()
  const { t } = useLanguage()
  const localRef = useRef(null)
  const editedRef = useRef(false)
  const mobileModesRef = useRef([])
  const mobileSizeRangeRef = useRef(null)
  const setEditorRef = useCallback((node) => {
    localRef.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) forwardedRef.current = node
  }, [forwardedRef])

  useEffect(() => {
    const editor = localRef.current
    if (!editor || document.activeElement === editor) return
    // Older saves may contain the literal result of String(an editor object).
    // Treat that exact, content-only artifact as empty so the editable canvas
    // opens cleanly; leave persisted data untouched until the user types.
    const safeHtml = isLegacyObjectPlaceholder(value) ? '' : richTextToHtml(value || '')
    if (editor.innerHTML !== safeHtml) editor.innerHTML = safeHtml
  }, [value])

  const consumeMobileCommand = (editor) => {
    if (!window.matchMedia?.(MOBILE_VIEWPORT_QUERY).matches) return false
    const selection = window.getSelection()
    const node = selection?.anchorNode
    if (!selection?.isCollapsed || node?.nodeType !== Node.TEXT_NODE || !editor.contains(node)) return false
    const token = getMobileCommandToken(node.textContent, selection.anchorOffset)
    if (!token) return false
    const tokenStart = selection.anchorOffset - token.length
    if (token !== ';;' && tokenStart > 0 && !/\s/.test(node.textContent[tokenStart - 1])) return false

    const range = document.createRange()
    range.setStart(node, tokenStart)
    range.setEnd(node, selection.anchorOffset)
    range.deleteContents()
    selection.removeAllRanges()
    selection.addRange(range)

    if (token === ';;') {
      const modes = [...mobileModesRef.current].reverse()
      mobileModesRef.current = []
      mobileSizeRangeRef.current = null
      modes.forEach((mode) => onMobileCommand?.('mobileEnd', mode))
      return true
    }

    const command = MOBILE_COMMANDS[token]
    if (command.mode) {
      const currentModes = mobileModesRef.current
      if (currentModes.includes(command.mode)) {
        mobileModesRef.current = currentModes.filter((mode) => mode !== command.mode)
        if (isFontMode(command.mode)) mobileSizeRangeRef.current = null
        onMobileCommand?.('mobileEnd', command.mode)
      } else {
        if (isFontMode(command.mode)) {
          mobileModesRef.current = currentModes.filter((mode) => !isFontMode(mode))
          const startRange = selection.getRangeAt(0).cloneRange()
          startRange.collapse(true)
          mobileSizeRangeRef.current = startRange
        }
        mobileModesRef.current = [...mobileModesRef.current, command.mode]
        onMobileCommand?.(command.format)
      }
    } else if (command.format === 'link' || command.format === 'image') {
      const label = command.format === 'link' ? t('Enter link URL') : t('Enter image URL')
      const url = window.prompt(label, 'https://')
      if (url?.trim()) onMobileCommand?.(command.format, url.trim())
    } else {
      onMobileCommand?.(command.format)
    }
    return true
  }

  const applyMobileSizeToInput = (editor) => {
    const sizeMode = [...mobileModesRef.current].reverse().find(isFontMode)
    const start = mobileSizeRangeRef.current
    const selection = window.getSelection()
    if (!sizeMode || !start || !selection?.isCollapsed || !editor.contains(selection.anchorNode)) return
    try {
      const range = document.createRange()
      range.setStart(start.startContainer, start.startOffset)
      range.setEnd(selection.anchorNode, selection.anchorOffset)
      if (range.collapsed || !range.toString()) return
      const span = document.createElement('span')
      span.setAttribute('data-text-size', sizeMode === 'fontIncrease' ? '3' : '1')
      span.append(range.extractContents())
      range.insertNode(span)
      const previous = span.previousSibling
      const nextStart = previous?.nodeType === Node.ELEMENT_NODE
        && previous.tagName === 'SPAN'
        && previous.getAttribute('data-text-size') === span.getAttribute('data-text-size')
        ? previous
        : span
      if (nextStart !== span) {
        while (span.firstChild) nextStart.append(span.firstChild)
        span.remove()
      }
      const caret = document.createRange()
      caret.setStartAfter(nextStart)
      caret.collapse(true)
      selection.removeAllRanges()
      selection.addRange(caret)
      mobileSizeRangeRef.current = caret.cloneRange()
    } catch {
      mobileSizeRangeRef.current = null
    }
  }

  const handleInput = (event) => {
    // Keep the live DOM and cursor untouched, but persist only allowlisted markup.
    editedRef.current = true
    const editor = event.currentTarget
    if (!consumeMobileCommand(editor)) applyMobileSizeToInput(editor)
    onChange(sanitizeRichTextHtml(editor.innerHTML))
  }

  const handleBlur = (event) => {
    const editor = event.currentTarget
    const safeHtml = sanitizeRichTextHtml(editor.innerHTML)
    if (editor.innerHTML !== safeHtml) editor.innerHTML = safeHtml
    if (!editedRef.current && isLegacyObjectPlaceholder(value)) return
    if (typeof value !== 'string' && !editedRef.current) return
    if (safeHtml !== (typeof value === 'string' ? value : '')) onChange(safeHtml)
    editedRef.current = false
  }

  const handlePaste = (event) => {
    const editor = event.currentTarget
    const imageItem = Array.from(event.clipboardData.items || []).find((item) => item.kind === 'file' && item.type.startsWith('image/'))
    if (imageItem) {
      event.preventDefault()
      const imageFile = imageItem.getAsFile()
      if (!imageFile || !ACCEPTED_PASTED_IMAGE_TYPES.includes(imageFile.type)) {
        message.warning(t('Paste a PNG, JPEG, GIF, or WebP image.'))
        return
      }
      if (imageFile.size > MAX_PASTED_IMAGE_SIZE) {
        message.warning(t('Pasted images must be 4 MB or smaller for local draft storage.'))
        return
      }
      const selection = window.getSelection()
      let range = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null
      if (!range || !editor.contains(range.commonAncestorContainer)) {
        range = document.createRange()
        range.selectNodeContents(editor)
        range.collapse(false)
      }
      const reader = new FileReader()
      reader.onload = () => {
        if (!editor.isConnected || !editor.contains(range.commonAncestorContainer)) return
        const shouldRestoreSelection = document.activeElement === editor
          && selection?.anchorNode
          && editor.contains(selection.anchorNode)
        const image = document.createElement('img')
        image.src = String(reader.result)
        image.alt = imageFile.name || 'Pasted image'
        range.deleteContents()
        range.insertNode(image)
        if (shouldRestoreSelection) {
          range.setStartAfter(image)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
        editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }))
      }
      reader.onerror = () => notifyAppError(t('Could not read the pasted image.'))
      reader.readAsDataURL(imageFile)
      return
    }

    event.preventDefault()
    document.execCommand('insertText', false, event.clipboardData.getData('text/plain'))
  }

  return (
    <div
      ref={setEditorRef}
      className="article-body-input article-rich-editor"
      role="textbox"
      aria-label={t('Article body')}
      aria-multiline="true"
      contentEditable
      suppressContentEditableWarning
      data-placeholder={t('Start writing your article here...')}
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyUp={onSelectionChange}
      onMouseUp={onSelectionChange}
      onPaste={handlePaste}
    />
  )
})

export default ArticleBodyEditor
