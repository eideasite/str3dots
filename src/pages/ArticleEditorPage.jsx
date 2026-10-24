import { useDeferredValue, useRef, useState } from 'react'
import { Alert, Button, Card, Drawer, Dropdown, Statistic, Typography } from 'antd'
import { ArrowRightOutlined, DownOutlined, ExportOutlined, EyeOutlined, FilePdfOutlined, RobotOutlined, SaveOutlined } from '@ant-design/icons'
import ArticleBodyEditor from '../components/editor/ArticleBodyEditor.jsx'
import ArticleStatusTag from '../components/common/ArticleStatusTag.jsx'
import ArticleTitleInput from '../components/editor/ArticleTitleInput.jsx'
import EditorToolbar, { EditorFormatToolbar } from '../components/editor/EditorToolbar.jsx'
import { getReadingMinutesFromWordCount, getWordCountFromText } from '../utils/article.js'
import { formatDate, getDateLocale } from '../utils/formatDate.js'
import { escapeHtml, isSafeRichTextUrl, richTextToPlainText, sanitizeRichTextHtml } from '../utils/richText.js'
import { useLanguage } from '../context/LanguageContext.jsx'

const { Text } = Typography

const FORMAT_COMMANDS = {
  bold: ['bold'],
  italic: ['italic'],
  underline: ['underline'],
  bullet: ['insertUnorderedList'],
  number: ['insertOrderedList'],
  quote: ['formatBlock', 'blockquote'],
  codeblock: ['formatBlock', 'pre'],
  rule: ['insertHorizontalRule'],
  heading1: ['formatBlock', 'h1'],
  heading2: ['formatBlock', 'h2'],
  paragraph: ['formatBlock', 'p'],
}

export default function ArticleEditorPage({ article, saveStatus, focusMode = false, onToggleFocus, onSaveDraft, onChange, onOpenSeo, onManage, onCreate, onDiscard, onBackHome, onPreview, onDownloadPdf }) {
  const { t, language } = useLanguage()
  const bodyRef = useRef(null)
  const savedRange = useRef(null)
  const [activeFormats, setActiveFormats] = useState({})
  const [geminiOpen, setGeminiOpen] = useState(false)

  const refreshActiveFormats = () => {
    const editor = bodyRef.current
    const selection = window.getSelection()
    if (!editor || !selection?.rangeCount || !editor.contains(selection.anchorNode)) {
      setActiveFormats((current) => Object.keys(current).length ? {} : current)
      return
    }

    const activeElement = selection.anchorNode.nodeType === Node.ELEMENT_NODE
      ? selection.anchorNode
      : selection.anchorNode.parentElement
    const blockElement = activeElement?.closest('h1, h2, p, div, blockquote, pre')
    const block = blockElement?.tagName === 'H1' ? 'heading1'
      : blockElement?.tagName === 'H2' ? 'heading2'
        : blockElement?.tagName === 'P' || blockElement?.tagName === 'DIV' ? 'paragraph'
          : null
    const inside = (tag) => Boolean(activeElement?.closest(tag))
    const commandState = (command) => {
      try { return document.queryCommandState(command) } catch { return false }
    }
    const next = {
      hasSelection: !selection.isCollapsed,
      fontSize: Number(activeElement?.closest('[data-text-size]')?.getAttribute('data-text-size') ?? 2),
      bold: commandState('bold'),
      italic: commandState('italic'),
      underline: commandState('underline'),
      bullet: commandState('insertUnorderedList'),
      number: commandState('insertOrderedList'),
      quote: inside('blockquote'),
      codeblock: inside('pre'),
      block,
    }
    setActiveFormats((current) => Object.keys(next).every((key) => current[key] === next[key]) ? current : next)
  }

  const rememberSelection = () => {
    const editor = bodyRef.current
    const selection = window.getSelection()
    if (editor && selection?.rangeCount && editor.contains(selection.anchorNode)) {
      savedRange.current = selection.getRangeAt(0).cloneRange()
    }
    refreshActiveFormats()
  }

  const restoreSelection = () => {
    const editor = bodyRef.current
    if (!editor) return null
    editor.focus()
    const selection = window.getSelection()
    selection.removeAllRanges()
    if (savedRange.current && editor.contains(savedRange.current.startContainer)) {
      selection.addRange(savedRange.current)
    } else {
      const range = document.createRange()
      range.selectNodeContents(editor)
      range.collapse(false)
      selection.addRange(range)
    }
    return selection.getRangeAt(0)
  }

  const deferredBody = useDeferredValue(article?.body || '')

  const commitEditor = () => {
    const editor = bodyRef.current
    if (!editor) return
    const safeHtml = sanitizeRichTextHtml(editor.innerHTML)
    if (editor.innerHTML !== safeHtml) editor.innerHTML = safeHtml
    onChange({ body: safeHtml })
    rememberSelection()
  }

  const applyFormat = (format, value) => {
    const editor = bodyRef.current
    if (!editor) return
    const range = restoreSelection()
    if (!range) return

    if (format === 'fontIncrease' || format === 'fontDecrease') {
      if (range.collapsed) return
      if (!editor.contains(range.commonAncestorContainer)) return
      const anchorElement = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement
      const currentLevel = Number(anchorElement?.closest('[data-text-size]')?.getAttribute('data-text-size') ?? 2)
      const nextLevel = Math.max(0, Math.min(4, currentLevel + (format === 'fontIncrease' ? 1 : -1)))
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT)
      const textNodes = []
      while (walker.nextNode()) {
        const node = walker.currentNode
        if (!range.intersectsNode(node)) continue
        const start = node === range.startContainer ? range.startOffset : 0
        const end = node === range.endContainer ? range.endOffset : node.length
        if (end > start) textNodes.push({ node, start, end })
      }
      const formattedSpans = []
      for (const { node, start, end } of [...textNodes].reverse()) {
        const textRange = document.createRange()
        textRange.setStart(node, start)
        textRange.setEnd(node, end)
        const sizeSpan = document.createElement('span')
        sizeSpan.setAttribute('data-text-size', String(nextLevel))
        sizeSpan.append(textRange.extractContents())
        textRange.insertNode(sizeSpan)
        formattedSpans.push(sizeSpan)
      }
      if (!formattedSpans.length) return
      const selection = window.getSelection()
      const selectedRange = document.createRange()
      selectedRange.setStartBefore(formattedSpans[formattedSpans.length - 1])
      selectedRange.setEndAfter(formattedSpans[0])
      selection.removeAllRanges()
      selection.addRange(selectedRange)
      commitEditor()
      return
    }

    if (format === 'link' || format === 'image') {
      if (!isSafeRichTextUrl(value, format === 'image')) return
      if (format === 'link') {
        if (range.collapsed) {
          document.execCommand('insertHTML', false, `<a href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer">${escapeHtml(value)}</a>`)
        } else {
          document.execCommand('createLink', false, value)
        }
      } else {
        document.execCommand('insertHTML', false, `<img src="${escapeHtml(value)}" alt="" loading="lazy">`)
      }
    } else {
      const command = FORMAT_COMMANDS[format]
      if (command) document.execCommand(command[0], false, command[1])
    }
    commitEditor()
  }

  if (!article) {
    return (
      <div className="page-wrap editor-page">
        <Card className="surface-card">
          <Typography.Title level={3}>{t('No article is open')}</Typography.Title>
          <Typography.Paragraph>
            {t('Open a draft from Articles Management or create a new article.')}
          </Typography.Paragraph>
          <div className="form-actions">
            <Button type="primary" onClick={onCreate}>{t('Create new article')}</Button>
            <Button onClick={onManage}>{t('View articles')}</Button>
          </div>
        </Card>
      </div>
    )
  }

  const plainBody = richTextToPlainText(deferredBody)
  const words = getWordCountFromText(plainBody)
  const readingMinutes = getReadingMinutesFromWordCount(words)
  return (
    <div className="page-wrap editor-page">
      <EditorToolbar
        focusMode={focusMode}
        onToggleFocus={onToggleFocus}
        onBackHome={onBackHome}
        onAskGemini={() => setGeminiOpen(true)}
      />
      <div className="editor-save-actions-row">
        <Alert
          className="local-notice editor-save-status"
          showIcon
          type={saveStatus === 'error' ? 'error' : saveStatus === 'conflict' ? 'warning' : saveStatus === 'saved' ? 'success' : 'info'}
          message={t(saveStatus === 'error' ? 'Save failed' : saveStatus === 'conflict' ? 'Another tab changed this workspace.' : saveStatus === 'saved' ? 'Saved in this browser' : 'Saving draft...')}
          description={t(saveStatus === 'error' ? 'Your edits remain in this editor. Try saving again.' : saveStatus === 'conflict' ? 'Saving here is paused to protect the newer data. Copy any unsaved text before reloading this page.' : saveStatus === 'saved' ? 'Your draft changes are stored in this browser.' : 'Your draft changes are being saved in this browser.')}
        />
        <div className="editor-save-actions-buttons">
          <Dropdown
            menu={{
              items: [
                { key: 'articles', label: t('Articles Management') },
                ...(article?.status === 'draft' ? [{ key: 'discard', label: t('Discard Draft'), danger: true }] : []),
              ],
              onClick: ({ key }) => (key === 'discard' ? onDiscard?.() : onManage?.()),
            }}
            trigger={['click']}
          >
            <Button className="editor-manage-button">{t('Manage')} <DownOutlined /></Button>
          </Dropdown>
          <Button className="editor-next-button" type="primary" onClick={onOpenSeo}>
            {t('Next')} <ArrowRightOutlined />
          </Button>
          <Button className="editor-pdf-button" icon={<FilePdfOutlined />} title={t('Choose Save as PDF in the browser print dialog.')} onClick={onDownloadPdf}>{t('Print / Save as PDF')}</Button>
          <Button className="editor-save-draft-button" icon={<SaveOutlined />} onClick={onSaveDraft}>{t('Save Draft')}</Button>
          <Button className="editor-preview-button" icon={<EyeOutlined />} onClick={onPreview}>{t('Preview')}</Button>
        </div>
      </div>
      <Card className="surface-card editor-card">
        <div className="editor-meta"><Text type="secondary">{t('Article title')}</Text><ArticleStatusTag status={article.status} /></div>
        <ArticleTitleInput value={article.title} onChange={(title) => onChange({ title })} />
        <div className="editor-compose-row">
          <EditorFormatToolbar onFormat={applyFormat} activeFormats={activeFormats} />
          <div className="editor-compose-body">
            <ArticleBodyEditor ref={bodyRef} value={article.body} onChange={(body) => onChange({ body })} onSelectionChange={rememberSelection} />
          </div>
        </div>
        <div className="editor-footer"><Text type="secondary">{plainBody.length} {t('characters')}</Text><Text type="secondary">{words} {t('words')} | {readingMinutes} {t('min read')}</Text></div>
      </Card>
      <div className="editor-bottom-note"><Statistic title={t('Last updated')} value={formatDate(article.updatedAt, { dateStyle: 'medium', timeStyle: 'short' }, getDateLocale(language))} /></div>
      <Drawer
        className="gemini-writing-drawer"
        title={<span><RobotOutlined /> {t('Ask Gemini')}</span>}
        placement="right"
        open={geminiOpen}
        onClose={() => setGeminiOpen(false)}
        width="min(420px, 100vw)"
        destroyOnHidden
      >
        <Typography.Paragraph>{t('Gemini is an external Google service. You can sign in to your Google account on Google’s official Gemini page if prompted.')}</Typography.Paragraph>
        <Alert
          showIcon
          type="info"
          message={t('Your article stays in this writing space')}
          description={t('Opening Gemini does not connect your Google account to this app and does not send your draft. If you want Gemini to review text, copy the specific text and paste it there yourself.')}
        />
        <Button
          className="gemini-writing-open"
          type="primary"
          block
          icon={<ExportOutlined />}
          href="https://gemini.google.com/app"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('Open Gemini and sign in with Google')}
        </Button>
      </Drawer>
    </div>
  )
}
