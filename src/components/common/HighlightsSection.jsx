import { notifyAppError } from '../../services/errorNotifications.js'
import { useRef, useState } from 'react'
import { Button, Empty, Input, Modal, Popconfirm, Space, Typography, message } from 'antd'
import { ArrowLeftOutlined, CheckOutlined, DeleteOutlined, DownOutlined, EditOutlined, LeftOutlined, PictureOutlined, PlusOutlined, RightOutlined, StarOutlined, UpOutlined, UploadOutlined } from '@ant-design/icons'
import { createHighlightCollection } from '../../services/highlightStorage.js'
import { formatDate, getDateLocale } from '../../utils/formatDate.js'
import { createId } from '../../utils/createId.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import ProfileAvatar from './ProfileAvatar.jsx'

const MAX_IMAGE_SIZE = 4 * 1024 * 1024
const MAX_ITEMS = 8
const ACCEPTED_IMAGES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
const MAX_STORED_IMAGE_EDGE = 1280

function HighlightImage({ src, alt, className, fallbackLabel }) {
  const [failedSrc, setFailedSrc] = useState(null)
  if (!src || failedSrc === src) {
    return <span className={`${className} highlight-image-fallback`} role="img" aria-label={fallbackLabel}>
      <PictureOutlined aria-hidden="true" />
      <span>{fallbackLabel}</span>
    </span>
  }
  return <img className={className} src={src} alt={alt} onError={() => setFailedSrc(src)} />
}

function compactImage(image) {
  if (!/^data:image\/(png|jpeg|webp);/i.test(image.src)) return Promise.resolve(image)
  return new Promise((resolve) => {
    const source = new Image()
    source.onload = () => {
      try {
        const scale = Math.min(1, MAX_STORED_IMAGE_EDGE / Math.max(source.naturalWidth, source.naturalHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(source.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(source.naturalHeight * scale))
        const context = canvas.getContext('2d')
        if (!context) return resolve(image)
        context.drawImage(source, 0, 0, canvas.width, canvas.height)
        const src = canvas.toDataURL('image/webp', 0.78)
        resolve(src.length < image.src.length ? { ...image, src } : image)
      } catch {
        resolve(image)
      }
    }
    source.onerror = () => resolve(image)
    source.src = image.src
  })
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ id: createId('highlight-image'), src: String(reader.result), name: file.name })
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function HighlightsSection({ profile, highlights = [], onSave }) {
  const { t, language } = useLanguage()
  const carouselRef = useRef(null)
  const fileRef = useRef(null)
  const readingImagesRef = useRef(false)
  const [view, setView] = useState(null)
  const [editing, setEditing] = useState(null)
  const [readingImages, setReadingImages] = useState(false)
  const [savingCollection, setSavingCollection] = useState(false)

  const startNewCollection = () => {
    setEditing(createHighlightCollection())
    setView('edit')
  }

  const beginEdit = (collection) => {
    setEditing({ ...collection, items: [...collection.items], articleHighlights: [...(collection.articleHighlights || [])] })
    setView('edit')
  }

  const addImages = async (event) => {
    if (savingCollection || readingImagesRef.current || !editing) return
    const collectionId = editing.id
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    if (editing.items.length + files.length > MAX_ITEMS) {
      message.warning(t('Each highlight can contain up to 8 photos.'))
      return
    }
    const accepted = files.filter((file) => ACCEPTED_IMAGES.includes(file.type) && file.size <= MAX_IMAGE_SIZE)
    if (accepted.length !== files.length) message.warning(t('Choose PNG, JPEG, GIF, or WebP photos up to 4 MB each.'))
    if (!accepted.length) return
    readingImagesRef.current = true
    setReadingImages(true)
    try {
      const images = await Promise.all(accepted.map(readImage))
      setEditing((current) => current?.id === collectionId ? { ...current, items: [...current.items, ...images] } : current)
    } catch {
      notifyAppError(t('Could not read one of those photos.'))
    } finally {
      readingImagesRef.current = false
      setReadingImages(false)
    }
  }

  const saveCollection = async () => {
    if (!editing || savingCollection || readingImages || !editing.title.trim() || !editing.items.length || editing.items.length > MAX_ITEMS) return
    setSavingCollection(true)
    try {
      const compacted = await Promise.all(editing.items.map(compactImage))
      const cleaned = { ...editing, title: editing.title.trim(), items: compacted, updatedAt: new Date().toISOString() }
      const exists = highlights.some((item) => item.id === cleaned.id)
      const next = exists
        ? highlights.map((item) => item.id === cleaned.id ? cleaned : item)
        : [cleaned, ...highlights]
      if (!onSave(next)) return
      message.success(t('Saved in this browser'))
      setEditing(null)
      setView('manage')
    } finally {
      setSavingCollection(false)
    }
  }

  const deleteCollection = () => {
    if (savingCollection) return
    const next = highlights.filter((item) => item.id !== editing.id)
    if (!onSave(next)) return
    setEditing(null)
    setView('manage')
  }

  const chooseCover = (index) => {
    setEditing((current) => {
      if (!current || index === 0 || !current.items[index]) return current
      const cover = current.items[index]
      return { ...current, items: [cover, ...current.items.filter((_, itemIndex) => itemIndex !== index)] }
    })
  }

  const closeDialog = () => {
    if (view === 'edit') {
      setEditing(null)
      setView('manage')
      return
    }
    setView(null)
  }

  const moveCarousel = (direction) => {
    const isMobile = window.matchMedia?.('(max-width: 700px)').matches
    carouselRef.current?.scrollBy({ left: isMobile ? 0 : direction * 210, top: isMobile ? direction * 150 : 0, behavior: 'smooth' })
  }
  const modalTitle = view === 'edit'
    ? <Space><Button className="highlight-back-button" type="text" disabled={savingCollection} aria-label={t('Back to highlights')} icon={<ArrowLeftOutlined />} onClick={closeDialog} /><span>{t('Edit highlight collection')}</span></Space>
    : t('Edit highlights')

  return (
    <section className="highlights-section" aria-label={t('Highlights')}>
      <div className="highlights-heading-row">
        <Typography.Title level={4}>{t('Highlights')}</Typography.Title>
        {highlights.length > 2 && <Space size={4}>
          <Button type="text" aria-label={t('Previous highlights')} icon={<><LeftOutlined className="highlight-scroll-horizontal-icon" /><UpOutlined className="highlight-scroll-vertical-icon" /></>} onClick={() => moveCarousel(-1)} />
          <Button type="text" aria-label={t('Next highlights')} icon={<><RightOutlined className="highlight-scroll-horizontal-icon" /><DownOutlined className="highlight-scroll-vertical-icon" /></>} onClick={() => moveCarousel(1)} />
        </Space>}
      </div>
      {highlights.length ? (
        <div className="highlights-carousel" ref={carouselRef}>
          {highlights.map((collection) => (
            <button className="highlight-tile" key={collection.id} type="button" onClick={() => beginEdit(collection)} aria-label={`${t('Edit')} ${collection.title}`}>
              <span className="highlight-cover"><HighlightImage className="highlight-cover-image" src={collection.items[0]?.src} alt="" fallbackLabel={t('Photo unavailable')} /></span>
              <span className="highlight-title">{collection.title}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="highlights-empty"><ProfileAvatar profile={profile} /><Typography.Text type="secondary">{t('Add photos to create your first highlight.')}</Typography.Text></div>
      )}
      <Button block className="highlights-edit-button" onClick={() => setView('manage')}>{t('Edit highlights')}</Button>

      <Modal
        className="highlights-modal"
        title={modalTitle}
        open={Boolean(view)}
        onCancel={() => { if (!savingCollection) closeDialog() }}
        footer={view === 'edit' ? [
          editing && highlights.some((item) => item.id === editing.id) && <Popconfirm key="delete" title={t('Delete this highlight collection?')} onConfirm={deleteCollection}><Button danger disabled={savingCollection} icon={<DeleteOutlined />}>{t('Delete collection')}</Button></Popconfirm>,
          <Button key="cancel" disabled={savingCollection} onClick={closeDialog}>{t('Cancel')}</Button>,
          <Button key="save" type="primary" disabled={!editing?.title.trim() || !editing?.items.length || readingImages || savingCollection} loading={savingCollection || readingImages} onClick={saveCollection}>{t('Save')}</Button>,
        ] : null}
        width={760}
        destroyOnHidden
      >
        {view === 'manage' && <div className="highlights-manager">
          {highlights.length ? highlights.map((collection) => (
            <div className="highlight-manager-row" key={collection.id}>
              <HighlightImage className="highlight-manager-cover" src={collection.items[0]?.src} alt="" fallbackLabel={t('Photo unavailable')} />
              <div className="highlight-manager-info"><Typography.Text strong>{collection.title}</Typography.Text><Typography.Text type="secondary">{collection.items.length} {t('photos')} · {(collection.articleHighlights || []).length} {t('saved text highlights')}</Typography.Text><Typography.Text type="secondary">{t('Updated')} {formatDate(collection.updatedAt, { dateStyle: 'medium' }, getDateLocale(language))}</Typography.Text></div>
              <Button type="text" aria-label={`${t('Edit')} ${collection.title}`} icon={<EditOutlined />} onClick={() => beginEdit(collection)} />
            </div>
          )) : <Empty description={t('No highlights yet')} />}
          <Button type="primary" block icon={<PlusOutlined />} onClick={startNewCollection}>{t('Add new')}</Button>
        </div>}

        {view === 'edit' && editing && <div className="highlight-editor">
          <div className="highlight-editor-cover-wrap">
            <Typography.Text>{t('Cover')}</Typography.Text>
            {editing.items[0] ? <HighlightImage className="highlight-editor-cover" src={editing.items[0].src} alt={editing.items[0].name || t('Highlight cover')} fallbackLabel={t('Photo unavailable')} /> : <div className="highlight-editor-cover highlight-cover-empty"><UploadOutlined /><span>{t('Add photos')}</span></div>}
          </div>
          <label className="field-label" htmlFor="highlight-title">{t('Title')}</label>
          <Input id="highlight-title" maxLength={60} value={editing.title} disabled={savingCollection} onChange={(event) => setEditing((current) => ({ ...current, title: event.target.value }))} placeholder={t('Highlight title')} />
          {editing.articleHighlights?.length > 0 && <section className="highlight-article-items" aria-label={t('Saved article text')}>
            <Typography.Text strong>{t('Saved article text')}</Typography.Text>
            {editing.articleHighlights.map((highlight) => <div className="highlight-article-item" key={highlight.id}>
              <div><Typography.Text strong>{highlight.articleTitle}</Typography.Text><Typography.Paragraph ellipsis={{ rows: 3, expandable: true, symbol: t('More') }}>{highlight.text}</Typography.Paragraph></div>
              <Button danger type="text" disabled={savingCollection} aria-label={`${t('Remove')} ${highlight.articleTitle}`} icon={<DeleteOutlined />} onClick={() => setEditing((current) => ({ ...current, articleHighlights: current.articleHighlights.filter((item) => item.id !== highlight.id) }))} />
            </div>)}
          </section>}
          <div className="highlight-editor-toolbar"><Typography.Text strong>{t('Photos')} ({editing.items.length}/{MAX_ITEMS})</Typography.Text><Button icon={<PlusOutlined />} disabled={savingCollection} loading={readingImages} onClick={() => fileRef.current?.click()}>{t('Add more')}</Button><input ref={fileRef} type="file" accept={ACCEPTED_IMAGES.join(',')} multiple hidden onChange={addImages} /></div>
          <div className="highlight-photo-grid">
            {editing.items.map((image, index) => <div className="highlight-photo-item" key={image.id}><HighlightImage className="highlight-photo-thumbnail" src={image.src} alt={image.name} fallbackLabel={t('Photo unavailable')} /><Button className="highlight-cover-select" type="text" disabled={savingCollection || index === 0} aria-label={index === 0 ? t('Current cover') : t('Set as cover')} title={index === 0 ? t('Current cover') : t('Set as cover')} icon={index === 0 ? <CheckOutlined /> : <StarOutlined />} onClick={() => chooseCover(index)} /><Button danger type="text" disabled={savingCollection} aria-label={`${t('Remove')} ${image.name}`} icon={<DeleteOutlined />} onClick={() => setEditing((current) => ({ ...current, items: current.items.filter((item) => item.id !== image.id) }))} /></div>)}
          </div>
        </div>}
      </Modal>
    </section>
  )
}
