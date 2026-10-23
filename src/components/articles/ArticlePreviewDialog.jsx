import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Dropdown, Input, Modal, Radio, Space, Typography, message } from 'antd'
import { BookFilled, BookOutlined, CloseOutlined, FilePdfOutlined, HighlightOutlined, PushpinFilled, PushpinOutlined, SearchOutlined, StarFilled, StarOutlined, UpOutlined, DownOutlined } from '@ant-design/icons'
import { getArticleTitle } from '../../utils/article.js'
import { richTextToHtml, richTextToPlainText } from '../../utils/richText.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

const BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'LI', 'BLOCKQUOTE', 'PRE'])

function collectSearchText(root) {
  let text = ''
  const segments = []
  const append = (value, node = null) => {
    const start = text.length
    text += value
    if (node && value) segments.push({ node, start, end: text.length })
  }
  const visit = (node) => {
    if (node.nodeType === Node.TEXT_NODE) { append(node.nodeValue || '', node); return }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    if (node.tagName === 'IMG') return
    if (node.tagName === 'BR' || node.tagName === 'HR') { append('\n'); return }
    for (const child of node.childNodes) visit(child)
    if (BLOCK_TAGS.has(node.tagName)) append('\n')
  }
  for (const child of root.childNodes) visit(child)
  return { text, segments }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function clearSearchMarks(root) {
  root.querySelectorAll('mark[data-article-find-match]').forEach((mark) => {
    mark.replaceWith(document.createTextNode(mark.textContent || ''))
  })
  root.normalize()
}

function getArticleSearchText(value) {
  if (typeof document === 'undefined') return richTextToPlainText(value || '')
  const container = document.createElement('div')
  container.innerHTML = richTextToHtml(value || '')
  return collectSearchText(container).text
}

export default function ArticlePreviewDialog({ open, article, bookmarked = false, shortcut = false, pinned = false, highlights = [], onSaveToHighlights, onSaveReview, onToggleBookmark, onToggleShortcut, onTogglePin, onClose, onDownloadPdf }) {
  const { t } = useLanguage()
  const bodyRef = useRef(null)
  const findInputRef = useRef(null)
  const [selectedText, setSelectedText] = useState('')
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewDraft, setReviewDraft] = useState({ rating: 0, title: '', notes: '' })
  const [findState, setFindState] = useState(() => ({ articleId: article?.id, open: false, query: '', activeIndex: 0 }))
  const sameArticle = findState.articleId === article?.id
  const findOpen = sameArticle && findState.open
  const findQuery = sameArticle ? findState.query : ''
  const searchText = useMemo(() => getArticleSearchText(article?.body || ''), [article?.body])
  const matches = useMemo(() => {
    const query = findQuery.trim()
    return findOpen && query ? [...searchText.matchAll(new RegExp(escapeRegExp(query), 'giu'))] : []
  }, [findOpen, findQuery, searchText])
  const matchCount = matches.length
  const activeMatchIndex = matchCount ? Math.min(sameArticle ? findState.activeIndex : 0, matchCount - 1) : 0
  const updateFindState = (patch) => setFindState((current) => ({
    articleId: article?.id,
    open: current.articleId === article?.id ? current.open : false,
    query: current.articleId === article?.id ? current.query : '',
    activeIndex: current.articleId === article?.id ? current.activeIndex : 0,
    ...patch,
  }))

  useEffect(() => {
    if (findOpen) findInputRef.current?.focus()
  }, [findOpen])

  useEffect(() => {
    const root = bodyRef.current
    if (!root) return
    clearSearchMarks(root)
    const query = findQuery.trim()
    if (!findOpen || !query) return

    const { text, segments } = collectSearchText(root)
    const matcher = new RegExp(escapeRegExp(query), 'giu')
    const domMatches = [...text.matchAll(matcher)].map((match) => ({ start: match.index, end: match.index + match[0].length }))
    const currentIndex = activeMatchIndex
    const ranges = domMatches.flatMap((match, matchIndex) => segments
      .filter((segment) => segment.start < match.end && segment.end > match.start)
      .map((segment) => ({
        node: segment.node,
        start: Math.max(match.start, segment.start) - segment.start,
        end: Math.min(match.end, segment.end) - segment.start,
        matchIndex,
      })))
      .sort((left, right) => right.start - left.start)

    for (const item of ranges) {
      if (!item.node.isConnected || item.end > item.node.length) continue
      const range = document.createRange()
      range.setStart(item.node, item.start)
      range.setEnd(item.node, item.end)
      const mark = document.createElement('mark')
      mark.dataset.articleFindMatch = String(item.matchIndex)
      if (item.matchIndex === currentIndex) mark.className = 'article-find-match-active'
      range.surroundContents(mark)
    }

    const activeMark = root.querySelector(`mark[data-article-find-match="${currentIndex}"]`)
    activeMark?.scrollIntoView({ block: 'center', behavior: 'auto' })
  }, [activeMatchIndex, article?.body, article?.id, findOpen, findQuery])

  if (!article) return null

  const articleText = richTextToPlainText(article.body || '')
  const hasSelection = selectedText.length > 0
  const highlightText = hasSelection ? selectedText : articleText
  const highlightMenuItems = highlights.map((collection) => ({ key: collection.id, label: collection.title || t('Untitled highlight collection') }))
  const saveToCollection = async (collectionId) => {
    if (!article.id || !highlightText.trim() || !onSaveToHighlights) return
    try {
      const saved = await onSaveToHighlights(collectionId, {
        articleId: article.id,
        articleTitle: getArticleTitle(article),
        text: highlightText,
        selectedText: hasSelection,
      })
      if (saved === true) message.success(t('Saved to Highlights'))
    } catch {
      // The application save handler reports persistence errors.
    }
  }
  const moveMatch = (direction) => {
    if (!matchCount) return
    updateFindState({ open: true, activeIndex: (activeMatchIndex + direction + matchCount) % matchCount })
  }
  const closeFind = () => {
    updateFindState({ open: false, query: '', activeIndex: 0 })
  }
  const savedReview = article.selfReview && Number.isInteger(article.selfReview.rating)
    && article.selfReview.rating >= 1 && article.selfReview.rating <= 5
    ? {
      rating: article.selfReview.rating,
      title: typeof article.selfReview.title === 'string' ? article.selfReview.title : '',
      notes: typeof article.selfReview.notes === 'string' ? article.selfReview.notes : '',
    }
    : null
  const beginReviewEdit = () => {
    setReviewDraft({ rating: savedReview?.rating || 0, title: savedReview?.title || '', notes: savedReview?.notes || '' })
    setReviewDialogOpen(true)
  }
  const cancelReviewEdit = () => {
    setReviewDraft({ rating: savedReview?.rating || 0, title: savedReview?.title || '', notes: savedReview?.notes || '' })
    setReviewDialogOpen(false)
  }
  const saveReview = async () => {
    if (reviewSaving || !onSaveReview) return
    if (!Number.isInteger(reviewDraft.rating) || reviewDraft.rating < 1 || reviewDraft.rating > 5) {
      message.warning(t('Choose a rating from 1 to 5 stars.'))
      return
    }
    setReviewSaving(true)
    try {
      const saved = await onSaveReview(article.id, { ...reviewDraft })
      if (saved === true) {
        setReviewDialogOpen(false)
        message.success(t('Self-review saved in this browser.'))
      }
    } finally {
      setReviewSaving(false)
    }
  }
  const closePreview = () => { closeFind(); setReviewDialogOpen(false); onClose?.() }
  const updateSelectedText = () => {
    const selection = window.getSelection()
    const isInsidePreview = selection && bodyRef.current?.contains(selection.anchorNode) && bodyRef.current.contains(selection.focusNode)
    setSelectedText(isInsidePreview ? selection.toString() : '')
  }

  return (
    <Modal
      className="article-preview-modal"
      title={t('Article preview')}
      open={open}
      onCancel={closePreview}
      width={840}
      footer={(
        <Space className="article-preview-actions" role="group" aria-label={t('Article preview actions')} wrap>
          {onSaveReview && <Button icon={<StarOutlined />} onClick={beginReviewEdit}>{t(savedReview ? 'Edit self-review' : 'Rate this article')}</Button>}
          <Button icon={<SearchOutlined />} aria-expanded={findOpen} aria-controls="article-find-panel" onClick={() => updateFindState({ open: true, activeIndex: 0 })}>{t('Find in Article')}</Button>
          <Button disabled aria-label={t('Translate unavailable: no translation service is configured')} title={t('No translation service is configured')}>{t('Translate')}</Button>
          <Button disabled aria-label={t('Summarize unavailable: no summarization service is configured')} title={t('No summarization service is configured')}>{t('Summarize')}</Button>
          <Button type={bookmarked ? 'primary' : 'default'} icon={bookmarked ? <BookFilled /> : <BookOutlined />} aria-pressed={bookmarked} onClick={onToggleBookmark}>{t(bookmarked ? 'Remove bookmark' : 'Bookmark article')}</Button>
          <Button type={shortcut ? 'primary' : 'default'} icon={shortcut ? <StarFilled /> : <StarOutlined />} aria-pressed={shortcut} onClick={onToggleShortcut}>{t(shortcut ? 'Remove from Home Shortcuts' : 'Add to Home Shortcuts')}</Button>
          {onTogglePin && <Button type={pinned ? 'primary' : 'default'} icon={pinned ? <PushpinFilled /> : <PushpinOutlined />} aria-pressed={pinned} onClick={onTogglePin}>{t(pinned ? 'Unpin article' : 'Pin article')}</Button>}
          {onSaveToHighlights && <Dropdown trigger={['click']} disabled={!highlights.length || !highlightText.trim()} menu={{ items: highlightMenuItems, onClick: ({ key }) => saveToCollection(key) }}>
            <Button icon={<HighlightOutlined />} disabled={!highlights.length || !highlightText.trim()} aria-label={t(hasSelection ? 'Save selected text to Highlights' : 'Save article to Highlights')}>{t(hasSelection ? 'Save selection to Highlights' : 'Save article to Highlights')}</Button>
          </Dropdown>}
          <Button icon={<FilePdfOutlined />} onClick={onDownloadPdf}>{t('Save as PDF')}</Button>
          <Button type="primary" onClick={closePreview}>{t('Close')}</Button>
        </Space>
      )}
      destroyOnHidden
    >
      <article className="article-preview-content">
        <Typography.Paragraph type="secondary" className="article-preview-note">{t('Choose Save as PDF in the browser print dialog.')}</Typography.Paragraph>
        <Alert
          className="article-preview-note"
          type="info"
          showIcon
          message={t('Translate and Summarize are unavailable')}
          description={t('No translation or summarization service is configured. Article content stays in this preview and is not sent to an external service.')}
        />
        {findOpen && <section id="article-find-panel" className="article-find-panel" aria-label={t('Find in Article')}>
          <Input
            ref={findInputRef}
            aria-label={t('Find in Article')}
            placeholder={t('Find in Article')}
            value={findQuery}
            onChange={(event) => updateFindState({ open: true, query: event.target.value, activeIndex: 0 })}
            onPressEnter={(event) => { event.preventDefault(); moveMatch(event.shiftKey ? -1 : 1) }}
          />
          <span className="article-find-count" role="status" aria-live="polite">
            {findQuery.trim() ? matchCount ? `${activeMatchIndex + 1} / ${matchCount}` : t('No matches found') : t('Enter a word or phrase')}
          </span>
          <Button aria-label={t('Previous Match')} disabled={!matchCount} icon={<UpOutlined />} onClick={() => moveMatch(-1)}>{t('Previous Match')}</Button>
          <Button aria-label={t('Next Match')} disabled={!matchCount} icon={<DownOutlined />} onClick={() => moveMatch(1)}>{t('Next Match')}</Button>
          <Button aria-label={t('Close Find')} icon={<CloseOutlined />} onClick={closeFind}>{t('Close')}</Button>
        </section>}
        <Typography.Title level={1}>{getArticleTitle(article)}</Typography.Title>
        {article.seoDescription && <Typography.Paragraph className="article-preview-description">{article.seoDescription}</Typography.Paragraph>}
        <div ref={bodyRef} className="article-preview-body" onMouseUp={updateSelectedText} onKeyUp={updateSelectedText} dangerouslySetInnerHTML={{ __html: richTextToHtml(article.body || '') }} />
        {onSaveToHighlights && <Typography.Paragraph type="secondary" className="article-preview-note">{highlights.length ? t(hasSelection ? 'Selected text will be saved.' : 'No text selected; the whole article will be saved.') : t('Create a Highlight Collection before saving.')}</Typography.Paragraph>}
        {onSaveReview && <section className="article-self-review" aria-labelledby="article-self-review-heading">
          <div className="article-self-review-heading">
            <Typography.Title id="article-self-review-heading" level={3}>{t('Private self-review')}</Typography.Title>
            <Typography.Text type="secondary">{t('Only you can see this review in this browser.')}</Typography.Text>
          </div>
          <div className="article-self-review-display">
            {savedReview ? <>
              <Typography.Text aria-label={`${savedReview.rating} ${t('out of 5 stars')}`} className="article-self-review-stars">
                {Array.from({ length: 5 }, (_, index) => <span key={index} aria-hidden="true" className={index < savedReview.rating ? 'article-self-review-star is-filled' : 'article-self-review-star'}>{index < savedReview.rating ? <StarFilled /> : <StarOutlined />}</span>)}
                <span className="article-self-review-score">{savedReview.rating} / 5 {t('stars')}</span>
              </Typography.Text>
              {savedReview.title && <Typography.Title level={5}>{savedReview.title}</Typography.Title>}
              {savedReview.notes && <Typography.Paragraph>{savedReview.notes}</Typography.Paragraph>}
              <Button onClick={beginReviewEdit}>{t('Edit Review')}</Button>
            </> : <>
              <Typography.Paragraph type="secondary">{t('Record private feedback to help improve this article.')}</Typography.Paragraph>
              <Button onClick={beginReviewEdit}>{t('Write Self-Review')}</Button>
            </>}
          </div>
        </section>}
      </article>
      {onSaveReview && <Modal
        className="article-self-review-modal"
        title={t('Private article self-review')}
        open={reviewDialogOpen}
        onCancel={cancelReviewEdit}
        width={520}
        zIndex={1100}
        closable={!reviewSaving}
        maskClosable={!reviewSaving}
        keyboard={!reviewSaving}
        footer={(
          <Space wrap>
            <Button disabled={reviewSaving} onClick={cancelReviewEdit}>{t('Close')}</Button>
            <Button type="primary" loading={reviewSaving} disabled={reviewSaving} onClick={saveReview}>{t(savedReview ? 'Update review' : 'Save review')}</Button>
          </Space>
        )}
        destroyOnHidden
      >
        <div className="article-self-review-form">
          <Typography.Paragraph type="secondary">{t('Read your article and give it a private rating from 1 to 5 stars. This review stays in this browser.')}</Typography.Paragraph>
          <Typography.Text strong id="article-review-rating-label">{t('Star rating')}</Typography.Text>
          <Radio.Group
            className="article-self-review-rating"
            aria-labelledby="article-review-rating-label"
            value={reviewDraft.rating || undefined}
            onChange={(event) => setReviewDraft((current) => ({ ...current, rating: event.target.value }))}
          >
            {[1, 2, 3, 4, 5].map((rating) => <Radio.Button key={rating} value={rating} aria-label={`${rating} ${t('out of 5 stars')}`}>
              <span aria-hidden="true">{rating <= reviewDraft.rating ? <StarFilled /> : <StarOutlined />}</span>
              <span className="article-self-review-visually-hidden">{rating} {t('out of 5 stars')}</span>
            </Radio.Button>)}
          </Radio.Group>
          <label className="article-self-review-field">
            <span>{t('Review title (optional)')}</span>
            <Input placeholder={t('Give your review a title')} value={reviewDraft.title} onChange={(event) => setReviewDraft((current) => ({ ...current, title: event.target.value }))} />
          </label>
          <label className="article-self-review-field">
            <span>{t('Review notes')}</span>
            <Input.TextArea placeholder={t('Share your thoughts about this article')} rows={4} value={reviewDraft.notes} onChange={(event) => setReviewDraft((current) => ({ ...current, notes: event.target.value }))} />
          </label>
        </div>
      </Modal>}
    </Modal>
  )
}
