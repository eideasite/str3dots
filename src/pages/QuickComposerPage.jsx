import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, Empty, Input, Modal, Popover, Space, Spin, Tooltip, Typography, message } from 'antd'
import { AudioOutlined, FileTextOutlined, PictureOutlined, SmileOutlined } from '@ant-design/icons'

import { notifyAppError } from '../services/errorNotifications.js'
import { formatDate, getDateLocale } from '../utils/formatDate.js'
import { waitForPostingMinimum } from '../services/publishingService.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import HighlightsSection from '../components/common/HighlightsSection.jsx'
import ProfileAvatar from '../components/common/ProfileAvatar.jsx'
import ArticleList from '../components/articles/ArticleList.jsx'

const { TextArea } = Input
const EMOJIS = ['🙂', '😊', '❤️', '👏', '🙏', '✨', '🌿', '💭']
const ACCEPTED_IMAGES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
const MAX_IMAGE_SIZE = 4 * 1024 * 1024

export default function QuickComposerPage({ profile, posts = [], articles = [], highlights = [], bookmarkedIds = [], shortcutIds = [], pinnedIds = [], onToggleBookmark, onToggleShortcut, onTogglePin, onSaveHighlights, onCreatePost, onWriteArticle, onOpenArticle, onArticleAction }) {
  const { t, language } = useLanguage()
  const [open, setOpen] = useState(false)
  const [posting, setPosting] = useState(false)
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [dictating, setDictating] = useState(false)
  const [showAllPosts, setShowAllPosts] = useState(false)
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const imageReaderRef = useRef(null)

  useEffect(() => () => {
    recognitionRef.current?.stop()
    imageReaderRef.current?.abort()
  }, [])

  const toggleDictation = (openComposer = false) => {
    if (dictating) {
      recognitionRef.current?.stop()
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      notifyAppError(t('Voice dictation is not supported by this browser.'), t('Voice input unavailable'))
      return
    }

    if (openComposer) setOpen(true)
    try {
      const recognition = new SpeechRecognition()
      recognition.lang = language === 'ta' ? 'ta-IN' : (navigator.language || 'en-US')
      recognition.continuous = true
      recognition.interimResults = false
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .slice(event.resultIndex)
          .filter((result) => result.isFinal)
          .map((result) => result[0]?.transcript || '')
          .join(' ')
          .trim()
        if (transcript) setText((current) => `${current}${current && !/\s$/.test(current) ? ' ' : ''}${transcript}`)
      }
      recognition.onerror = (event) => {
        setDictating(false)
        if (event.error === 'aborted') return
        const explanation = event.error === 'not-allowed'
          ? t('Allow microphone access in your browser to dictate.')
          : event.error === 'no-speech'
            ? t('No speech was detected. Try again.')
            : t('Voice dictation stopped: {error}').replace('{error}', event.error || t('unknown error'))
        notifyAppError(explanation, t('Voice input problem'))
      }
      recognition.onend = () => setDictating(false)
      recognitionRef.current = recognition
      setDictating(true)
      recognition.start()
    } catch (error) {
      setDictating(false)
      notifyAppError(error?.message || t('Could not start voice dictation.'), t('Voice input problem'))
    }
  }

  const submitPost = async () => {
    if (posting || (!text.trim() && !image)) return
    setPosting(true)
    const startedAt = Date.now()
    try {
      await waitForPostingMinimum(startedAt)
      const saved = onCreatePost({ text: text.trim(), image })
      if (!saved) return
      setText('')
      setImage(null)
      setOpen(false)
      message.success(t('Post saved in this browser.'))
    } catch {
      notifyAppError(t('Could not save this post in this browser.'))
    } finally {
      setPosting(false)
    }
  }

  const handleImage = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!ACCEPTED_IMAGES.includes(file.type) || file.size > MAX_IMAGE_SIZE) {
      message.warning(t('Choose a PNG, JPEG, GIF, or WebP image up to 4 MB.'))
      return
    }
    imageReaderRef.current?.abort()
    const reader = new FileReader()
    imageReaderRef.current = reader
    reader.onload = () => {
      if (imageReaderRef.current !== reader) return
      imageReaderRef.current = null
      setImage({ src: String(reader.result), name: file.name })
    }
    reader.onerror = () => {
      if (imageReaderRef.current !== reader) return
      imageReaderRef.current = null
      notifyAppError(t('Could not read that image.'))
    }
    reader.readAsDataURL(file)
  }

  const openPhotoComposer = () => {
    setOpen(true)
    fileInputRef.current?.click()
  }

  const emojiPicker = <div className="quick-composer-emoji-list">{EMOJIS.map((emoji) => <Button key={emoji} type="text" aria-label={`Insert ${emoji}`} onClick={() => setText((current) => `${current}${emoji}`)}>{emoji}</Button>)}</div>
  const recentPosts = useMemo(
    () => posts.slice().sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt)),
    [posts],
  )
  const numberedRecentPosts = useMemo(() => {
    const dailyPostNumbers = new Map()

    return recentPosts.slice().reverse().map((post) => {
      const createdAt = new Date(post.createdAt)
      const dayKey = Number.isNaN(createdAt.getTime())
        ? `invalid-${post.id}`
        : `${createdAt.getFullYear()}-${createdAt.getMonth()}-${createdAt.getDate()}`
      const postNumber = (dailyPostNumbers.get(dayKey) || 0) + 1
      dailyPostNumbers.set(dayKey, postNumber)

      return { post, postNumber }
    }).reverse()
  }, [recentPosts])
  const visiblePosts = showAllPosts ? numberedRecentPosts : numberedRecentPosts.slice(0, 3)
  const activeArticles = useMemo(() => articles.filter((article) => !article.archived), [articles])
  const articleSampleNumbers = useMemo(() => {
    const numbers = new Map()
    activeArticles.forEach((article) => {
      if (!(typeof article.title === 'string' && article.title.trim())) {
        numbers.set(article.id, numbers.size + 1)
      }
    })
    return numbers
  }, [activeArticles])
  const articlesById = useMemo(() => new Map(articles.map((article) => [article.id, article])), [articles])
  const articleListProps = {
    filter: 'all',
    articleSampleNumbers,
    onOpen: onOpenArticle,
    onAction: onArticleAction,
    bookmarkedIds,
    shortcutIds,
    pinnedIds,
    onToggleBookmark,
    onToggleShortcut,
    onTogglePin,
  }
  const shortcutArticles = useMemo(
    () => shortcutIds.map((id) => articlesById.get(id)).filter((article) => article && !article.archived),
    [articlesById, shortcutIds],
  )
  const missingShortcutCount = useMemo(
    () => shortcutIds.filter((id) => !articlesById.has(id) || articlesById.get(id).archived).length,
    [articlesById, shortcutIds],
  )

  return (
    <main className="quick-composer-page">
      <div className="quick-composer-layout">
      <div className="quick-composer-main-column">
      <div className="quick-composer-panel">
        <div className="quick-composer">
          <ProfileAvatar profile={profile} className="quick-composer-avatar" />
          <Input
            className="quick-composer-input"
            variant="borderless"
            readOnly
            aria-label={t('Start writing a post')}
            placeholder={t("What's on your mind, {name}?").replace('{name}', profile.name || t('writer'))}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setOpen(true)
              }
            }}
          />
          <Tooltip title={t(dictating ? 'Stop voice dictation' : 'Start voice dictation')}>
            <Button className={`quick-composer-mic ${dictating ? 'is-listening' : ''}`} type="text" aria-label={t(dictating ? 'Stop voice dictation' : 'Start voice dictation')} aria-pressed={dictating} icon={<AudioOutlined />} onClick={() => toggleDictation(true)} />
          </Tooltip>
        </div>
        <div className="quick-composer-options">
          <Button type="text" className="quick-composer-option photo-option" icon={<PictureOutlined />} onClick={openPhotoComposer}>{t('Photo')}</Button>
          <Button type="text" className="quick-composer-option article-option" icon={<FileTextOutlined />} onClick={onWriteArticle}>{t('Write article')}</Button>
        </div>
      </div>

      <section className="home-article-section quick-composer-recent" aria-labelledby="home-recent-posts-heading">
        <div className="home-article-section-heading">
          <div className="home-post-heading-title">
            <Typography.Title level={4} id="home-recent-posts-heading">{t('Recent Posts')}</Typography.Title>
            <span
              className="home-post-total-count"
              aria-label={t('Total posts: {count}').replace('{count}', String(recentPosts.length))}
              title={t('Total posts: {count}').replace('{count}', String(recentPosts.length))}
            >
              {recentPosts.length}
            </span>
          </div>
          {recentPosts.length > 3 && <Button type="link" onClick={() => setShowAllPosts((current) => !current)}>{t(showAllPosts ? 'Show Less' : 'See More')}</Button>}
        </div>
        {visiblePosts.length === 0 ? <Empty className="list-empty" description={t('No posts yet')} /> : (
          <div className="home-post-feed">
            {visiblePosts.map(({ post, postNumber }) => (
              <Card className="home-post-card" key={post.id}>
                <div className="home-post-author">
                  <ProfileAvatar profile={profile} size={40} className="quick-composer-avatar home-post-avatar" />
                  <div className="home-post-author-info">
                    <Typography.Text className="home-post-author-name" strong>{profile.name || t('Writer')}</Typography.Text>
                    <div className="home-post-meta">
                      <Typography.Text type="secondary">{formatDate(post.createdAt, { dateStyle: 'medium', timeStyle: 'short' }, getDateLocale(language))} · {t('Local post')}</Typography.Text>
                      <span className="home-post-number-chip" aria-label={`Post number ${postNumber}`} title={`Post ${postNumber} for this day`}>#{postNumber}</span>
                    </div>
                  </div>
                </div>
                {(post.text || post.image?.src) && (
                  <div className="home-post-content">
                    {post.text && <div className="home-post-body">{post.text}</div>}
                    {post.image?.src && <img className="home-post-image" src={post.image.src} alt={post.image.name || t('Post image')} />}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
      <section className="home-article-section quick-composer-articles" aria-labelledby="home-articles-heading">
        <div className="home-article-section-heading">
          <Typography.Title level={4} id="home-articles-heading">{t('Articles')}</Typography.Title>
        </div>
        {activeArticles.length > 4 ? (
          <>
            <ArticleList
              {...articleListProps}
              articles={activeArticles.slice(0, 4)}
              articleSampleNumbers={articleSampleNumbers}
              compact
            />
            <ArticleList
              {...articleListProps}
              articles={activeArticles.slice(4)}
              articleSampleNumbers={articleSampleNumbers}
            />
          </>
        ) : (
          <ArticleList
            {...articleListProps}
            articles={activeArticles}
            articleSampleNumbers={articleSampleNumbers}
            compact
          />
        )}
      </section>
      </div>
      <div className="quick-composer-left-column">
      <div className="quick-composer-highlights"><HighlightsSection profile={profile} highlights={highlights} onSave={onSaveHighlights} /></div>
      </div>

      <div className="quick-composer-right-column">
      <section className="home-article-section quick-composer-shortcuts" aria-labelledby="home-shortcuts-heading">
        <div className="home-article-section-heading">
          <Typography.Title level={4} id="home-shortcuts-heading">{t('Home Shortcuts')}</Typography.Title>
        </div>
        {missingShortcutCount > 0 && <Typography.Text className="home-reference-warning" type="secondary">{t('Some shortcuts point to articles that are no longer available.')}</Typography.Text>}
        <ArticleList
          articles={shortcutArticles}
          filter="all"
          onOpen={onOpenArticle}
          bookmarkedIds={bookmarkedIds}
          shortcutIds={shortcutIds}
          pinnedIds={pinnedIds}
          onToggleBookmark={onToggleBookmark}
          onToggleShortcut={onToggleShortcut}
          onTogglePin={onTogglePin}
          emptyDescription={t(shortcutIds.length ? 'Saved shortcuts are unavailable.' : 'No Home Shortcuts yet')}
        />
      </section>
      </div>

      </div>

      <Modal
        className="create-post-modal"
        title={t('Create post')}
        open={open}
        onCancel={() => { if (!posting) { recognitionRef.current?.stop(); setOpen(false) } }}
        footer={null}
        closable={!posting}
        maskClosable={!posting}
        keyboard={!posting}
        destroyOnHidden
      >
        <Spin spinning={posting} tip={t('Posting...')}>
          <div className="create-post-author"><ProfileAvatar profile={profile} className="quick-composer-avatar" /><Typography.Text strong>{profile.name || t('Writer')}</Typography.Text></div>
          <TextArea
            className="create-post-textarea"
            autoFocus
            autoSize={{ minRows: 5, maxRows: 10 }}
            aria-label={t('Write your post')}
            placeholder={t("What's on your mind, {name}?").replace('{name}', profile.name || t('writer'))}
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={posting}
          />
          {image && <div className="create-post-image-preview"><img src={image.src} alt={image.name} /><Button type="text" aria-label={t('Remove image')} disabled={posting} onClick={() => setImage(null)}>×</Button></div>}
          <div className="create-post-additions">
            <Typography.Text strong>{t('Add to your post')}</Typography.Text>
            <Space size="small">
              <Tooltip title={t('Add an image')}><Button type="text" aria-label={t('Add an image')} icon={<PictureOutlined />} disabled={posting} onClick={() => fileInputRef.current?.click()} /></Tooltip>
              <Tooltip title={t(dictating ? 'Stop voice dictation' : 'Start voice dictation')}><Button type="text" className={`create-post-mic ${dictating ? 'is-listening' : ''}`} aria-label={t(dictating ? 'Stop voice dictation' : 'Start voice dictation')} aria-pressed={dictating} icon={<AudioOutlined />} disabled={posting} onClick={() => toggleDictation()} /></Tooltip>
              <Popover trigger="click" content={emojiPicker}><Button type="text" aria-label={t('Add an emoji')} icon={<SmileOutlined />} disabled={posting} /></Popover>
            </Space>
          </div>
          <Button type="primary" block className="create-post-submit" disabled={posting || dictating || (!text.trim() && !image)} loading={posting} onClick={submitPost}>{t('Post')}</Button>
          <Typography.Text type="secondary" className="create-post-note">{t('This creates a local post in this browser only.')}</Typography.Text>
        </Spin>
      </Modal>

      <input ref={fileInputRef} className="quick-composer-file" type="file" accept={ACCEPTED_IMAGES.join(',')} onChange={handleImage} />
    </main>
  )
}
