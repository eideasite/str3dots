import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { App as AntApp, ConfigProvider, Modal, Radio, Typography, message, theme as antdTheme } from 'antd'
import enUS from 'antd/locale/en_US'
import taIN from 'antd/locale/ta_IN'

import { notifyAppError } from './services/errorNotifications.js'
import QuickComposerPage from './pages/QuickComposerPage.jsx'
const ArticleEditorPage = lazy(() => import('./pages/ArticleEditorPage.jsx'))
const ArticlesManagementPage = lazy(() => import('./pages/ArticlesManagementPage.jsx'))
const ArchivePage = lazy(() => import('./pages/ArchivePage.jsx'))
const ExternalAiToolsPage = lazy(() => import('./pages/ExternalAiToolsPage.jsx'))
const BookmarksPage = lazy(() => import('./pages/BookmarksPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const PublishedPostPage = lazy(() => import('./pages/PublishedPostPage.jsx'))
const PublishSuccessDialog = lazy(() => import('./components/publishing/PublishSuccessDialog.jsx'))
const SchedulePostDialog = lazy(() => import('./components/publishing/SchedulePostDialog.jsx'))
const SEOSettingsPage = lazy(() => import('./pages/SEOSettingsPage.jsx'))
const ShareArticleDialog = lazy(() => import('./components/publishing/ShareArticleDialog.jsx'))
const DiscardDraftDialog = lazy(() => import('./components/articles/DiscardDraftDialog.jsx'))
const ArticlePreviewDialog = lazy(() => import('./components/articles/ArticlePreviewDialog.jsx'))
import MainLayout from './layouts/MainLayout.jsx'
import ErrorNotificationHost from './components/common/ErrorNotificationHost.jsx'
import SystemErrorBoundary from './components/common/SystemErrorBoundary.jsx'
import ProfileAvatar from './components/common/ProfileAvatar.jsx'
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx'
import { useArticles } from './hooks/useArticles.js'
import { useDraft } from './hooks/useDraft.js'
import { getWorkspaceRecoveryData, getWorkspaceRecoveryState, hasWorkspaceWriteConflict, loadWorkspace, saveWorkspace, WORKSPACE_KEY } from './services/articleStorage.js'
import { createLocalPost, loadPosts, savePosts } from './services/postStorage.js'
import { createArticleHighlight, loadHighlights, saveHighlights } from './services/highlightStorage.js'
import { loadBookmarkedArticleIds, loadHomeShortcutArticleIds, saveBookmarkedArticleIds, saveHomeShortcutArticleIds } from './services/articleReferenceStorage.js'
import { publishLocally as getPublishedStatus, scheduleLocally as getScheduledStatus, waitForPostingMinimum } from './services/publishingService.js'
import { articleCanPublish } from './utils/validation.js'
import { getArticleTitle, makeSafeFilename } from './utils/article.js'
import { richTextToHtml } from './utils/richText.js'
import './styles/global.css'
import './styles/components.css'

const APP_PAGES = new Set(['compose', 'profile', 'editor', 'seo', 'published', 'articles', 'bookmarks', 'archive', 'external-ai-tools'])
const ARTICLE_CONTEXT_PAGES = new Set(['editor', 'seo', 'published'])

function getInitialRoute() {
  const statePage = window.history.state?.jeyamohanPage
  const hash = window.location.hash.startsWith('#/') ? window.location.hash.slice(2) : ''
  const [hashPage, hashQuery = ''] = hash.split('?')
  const hashArticleId = new URLSearchParams(hashQuery).get('article')
  return {
    page: APP_PAGES.has(statePage) ? statePage : APP_PAGES.has(hashPage) ? hashPage : 'compose',
    articleId: typeof window.history.state?.jeyamohanArticleId === 'string'
      ? window.history.state.jeyamohanArticleId
      : hashArticleId,
  }
}

const SESSION_KEY = 'jeyamohan-articles-local-session-v1'

function loadSessionStatus() {
  try {
    const status = sessionStorage.getItem(SESSION_KEY)
    return status === 'locked' || status === 'signed-out' ? status : 'active'
  } catch {
    return 'active'
  }
}

function LocalSessionScreen({ status, profile, onContinue }) {
  const { t } = useLanguage()
  const signedOut = status === 'signed-out'
  return <main className="local-session-screen">
    <section className="local-session-card">
      <ProfileAvatar profile={profile} size={68} className="profile-avatar" />
      <p className="local-session-eyebrow">Jeyamohan Articles</p>
      <h1>{t(signedOut ? 'You are signed out' : 'Writing space locked')}</h1>
      <p>{signedOut ? t('Your articles and posts remain saved in this browser.') : t('This local lock hides the page only; it does not protect browser data.')}</p>
      <button type="button" className="system-error-retry local-session-continue" onClick={onContinue}>{t(signedOut ? 'Continue as {name}' : 'Unlock writing space').replace('{name}', profile.name || t('Writer'))}</button>
      <small>{t('This profile works locally in this browser and is not connected to an online account.')}</small>
    </section>
  </main>
}

function AppContent({ themeMode, onThemeChange, language, onLanguageChange }) {
  const { t } = useLanguage()
  const [initialRoute] = useState(getInitialRoute)
  const [sessionStatus, setSessionStatus] = useState(loadSessionStatus)
  const [workspace, setWorkspace] = useState(loadWorkspace)
  const [workspaceRecoveryState] = useState(getWorkspaceRecoveryState)
  const [posts, setPosts] = useState(loadPosts)
  const [highlights, setHighlights] = useState(loadHighlights)
  const [bookmarkedArticleIds, setBookmarkedArticleIds] = useState(loadBookmarkedArticleIds)
  const [homeShortcutArticleIds, setHomeShortcutArticleIds] = useState(loadHomeShortcutArticleIds)
  const [pendingPinArticleId, setPendingPinArticleId] = useState(null)
  const [replacementPinId, setReplacementPinId] = useState(null)
  const [savingPin, setSavingPin] = useState(false)
  const { saveStatus, setSaveStatus, saveNow } = useDraft(workspace)
  const { updateWorkspace, updateArticle: updateArticleById, createNewArticle: addArticle } = useArticles(setWorkspace, () => setSaveStatus('saving'))
  const [page, setPage] = useState(initialRoute.page)
  const [focusMode, setFocusMode] = useState(false)
  const [editorReturnPage, setEditorReturnPage] = useState('compose')
  const [activeArticleId, setActiveArticleId] = useState(() => workspace.articles.some((article) => article.id === initialRoute.articleId)
    ? initialRoute.articleId
    : workspace.articles[0]?.id || null)
  const [seoReturnPage, setSeoReturnPage] = useState('editor')
  const [shareOpen, setShareOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [printingArticle, setPrintingArticle] = useState(null)
  const [posting, setPosting] = useState(false)
  const postingRef = useRef(false)
  const savingPinRef = useRef(false)
  const activeArticle = useMemo(() => workspace.articles.find((article) => article.id === activeArticleId) || null, [workspace.articles, activeArticleId])

  useEffect(() => {
    const handleWorkspaceChange = (event) => {
      if (event.key === WORKSPACE_KEY && event.newValue !== event.oldValue) setSaveStatus('conflict')
    }
    window.addEventListener('storage', handleWorkspaceChange)
    return () => window.removeEventListener('storage', handleWorkspaceChange)
  }, [setSaveStatus])

  useLayoutEffect(() => {
    if (!printingArticle) return undefined
    const originalTitle = document.title
    const clearPrintState = () => setPrintingArticle(null)
    document.title = makeSafeFilename(printingArticle.title || getArticleTitle(printingArticle))
    window.addEventListener('afterprint', clearPrintState)
    const printTimer = window.setTimeout(() => window.print(), 120)
    const fallbackTimer = window.setTimeout(clearPrintState, 120000)
    return () => {
      window.clearTimeout(printTimer)
      window.clearTimeout(fallbackTimer)
      window.removeEventListener('afterprint', clearPrintState)
      document.title = originalTitle
    }
  }, [printingArticle])

  useLayoutEffect(() => {
    const currentState = window.history.state || {}
    const articleQuery = ARTICLE_CONTEXT_PAGES.has(page) && activeArticleId ? `?article=${encodeURIComponent(activeArticleId)}` : ''
    const expectedHash = `#/${page}${articleQuery}`
    if (!APP_PAGES.has(currentState.jeyamohanPage) || !Number.isInteger(currentState.jeyamohanDepth)
      || currentState.jeyamohanArticleId !== activeArticleId || window.location.hash !== expectedHash) {
      const url = `${window.location.pathname}${window.location.search}${expectedHash}`
      window.history.replaceState({ ...currentState, jeyamohanPage: page, jeyamohanDepth: currentState.jeyamohanDepth || 0, jeyamohanArticleId: activeArticleId }, '', url)
    }
    const handlePopState = (event) => {
      const nextPage = event.state?.jeyamohanPage
      const nextValidPage = APP_PAGES.has(nextPage) ? nextPage : 'compose'
      const hash = window.location.hash.startsWith('#/') ? window.location.hash.slice(2) : ''
      const [, hashQuery = ''] = hash.split('?')
      const routeArticleId = typeof event.state?.jeyamohanArticleId === 'string'
        ? event.state.jeyamohanArticleId
        : new URLSearchParams(hashQuery).get('article')
      setPage(nextValidPage)
      if (nextValidPage !== 'editor') setFocusMode(false)
      if (routeArticleId && workspace.articles.some((article) => article.id === routeArticleId)) setActiveArticleId(routeArticleId)
      else if (ARTICLE_CONTEXT_PAGES.has(nextValidPage)) setActiveArticleId(workspace.articles[0]?.id || null)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [page, activeArticleId, workspace.articles])

  const navigateTo = (destination, { replace = false, articleId = activeArticleId } = {}) => {
    if (!APP_PAGES.has(destination)) return
    if (destination !== 'editor') setFocusMode(false)
    const currentDepth = Number.isInteger(window.history.state?.jeyamohanDepth) ? window.history.state.jeyamohanDepth : 0
    const nextArticleId = workspace.articles.some((article) => article.id === articleId) ? articleId : null
    const nextState = { ...window.history.state, jeyamohanPage: destination, jeyamohanDepth: replace ? currentDepth : currentDepth + 1, jeyamohanArticleId: nextArticleId }
    const articleQuery = ARTICLE_CONTEXT_PAGES.has(destination) && nextArticleId ? `?article=${encodeURIComponent(nextArticleId)}` : ''
    const url = `${window.location.pathname}${window.location.search}#/${destination}${articleQuery}`
    if (replace) window.history.replaceState(nextState, '', url)
    else if (destination !== page || nextArticleId !== activeArticleId) window.history.pushState(nextState, '', url)
    setPage(destination)
  }

  const goBack = (fallback) => {
    if ((window.history.state?.jeyamohanDepth || 0) > 0) window.history.back()
    else navigateTo(fallback, { replace: true })
  }

  const updateArticle = (patch, id = activeArticleId) => updateArticleById(id, patch)
  const saveArticleSelfReview = (articleId, review) => {
    if (!articleId || !Number.isInteger(review?.rating) || review.rating < 1 || review.rating > 5
      || typeof review.title !== 'string' || typeof review.notes !== 'string') {
      notifyAppError(t('Enter a rating from 1 to 5 stars before saving your review.'))
      return false
    }
    if (!workspace.articles.some((article) => article.id === articleId)) {
      notifyAppError(t('This article is no longer available.'))
      return false
    }
    const nextWorkspace = {
      ...workspace,
      articles: workspace.articles.map((article) => article.id === articleId
        ? { ...article, selfReview: { rating: review.rating, title: review.title, notes: review.notes, updatedAt: new Date().toISOString() } }
        : article),
    }
    setSaveStatus('saving')
    if (!saveWorkspace(nextWorkspace)) {
      setSaveStatus(hasWorkspaceWriteConflict() ? 'conflict' : 'error')
      notifyAppError(t('Could not save this self-review in this browser. Your review is still open; try saving again.'))
      return false
    }
    setWorkspace(nextWorkspace)
    setSaveStatus('saved')
    return true
  }
  const persistArticleStatus = (status) => {
    const updatedAt = new Date().toISOString()
    const nextWorkspace = {
      ...workspace,
      articles: workspace.articles.map((article) => article.id === activeArticleId
        ? { ...article, ...status, updatedAt }
        : article),
    }
    setSaveStatus('saving')
    if (!saveWorkspace(nextWorkspace)) {
      setSaveStatus(hasWorkspaceWriteConflict() ? 'conflict' : 'error')
      throw new Error('Browser storage could not save the article status')
    }
    setWorkspace(nextWorkspace)
    setSaveStatus('saved')
  }
  const createArticle = (body = '') => {
    const article = addArticle(body ? { body } : undefined)
    setEditorReturnPage(page === 'editor' ? 'compose' : page)
    setActiveArticleId(article.id)
    navigateTo('editor', { articleId: article.id })
  }
  const createPost = (content) => {
    const nextPosts = [createLocalPost(content), ...posts]
    if (!savePosts(nextPosts)) {
      notifyAppError(t('Could not save this post in this browser.'))
      return false
    }
    setPosts(nextPosts)
    return true
  }
  const updateArticleReference = (article, currentIds, setIds, persist, labels) => {
    const articleId = article?.id
    if (!articleId || !workspace.articles.some((savedArticle) => savedArticle.id === articleId)) {
      notifyAppError(t('This article is no longer available.'))
      return false
    }
    const isSaved = currentIds.includes(articleId)
    const nextIds = isSaved
      ? currentIds.filter((id) => id !== articleId)
      : [articleId, ...currentIds.filter((id) => id !== articleId)]
    if (!persist(nextIds)) {
      notifyAppError(t(labels.error))
      return false
    }
    setIds(nextIds)
    message.success(t(isSaved ? labels.removed : labels.added))
    return true
  }
  const toggleArticleBookmark = (article) => updateArticleReference(
    article,
    bookmarkedArticleIds,
    setBookmarkedArticleIds,
    saveBookmarkedArticleIds,
    { added: 'Article bookmarked.', removed: 'Bookmark removed.', error: 'Could not save bookmarks in this browser.' },
  )
  const toggleHomeArticleShortcut = (article) => updateArticleReference(
    article,
    homeShortcutArticleIds,
    setHomeShortcutArticleIds,
    saveHomeShortcutArticleIds,
    { added: 'Article added to Home Shortcuts.', removed: 'Article removed from Home Shortcuts.', error: 'Could not save Home Shortcuts in this browser.' },
  )
  const pinnedArticleIds = useMemo(() => [...new Set(workspace.articles.filter((article) => article.pinned === true).map((article) => article.id))], [workspace.articles])
  const persistPinnedIds = (nextIds, allowExistingOverLimit = false) => {
    if (new Set(nextIds).size !== nextIds.length || (nextIds.length > 3 && !allowExistingOverLimit)) return false
    const nextWorkspace = {
      ...workspace,
      articles: workspace.articles.map((article) => ({ ...article, pinned: nextIds.includes(article.id) })),
    }
    if (!saveWorkspace(nextWorkspace)) {
      setSaveStatus(hasWorkspaceWriteConflict() ? 'conflict' : 'error')
      notifyAppError(t('Could not save pinned articles in this browser.'))
      return false
    }
    setWorkspace(nextWorkspace)
    return true
  }
  const toggleArticlePin = (article) => {
    if (savingPinRef.current) return false
    if (!article?.id || !workspace.articles.some((savedArticle) => savedArticle.id === article.id)) {
      notifyAppError(t('This article is no longer available.'))
      return false
    }
    if (pinnedArticleIds.includes(article.id)) {
      const nextIds = pinnedArticleIds.filter((id) => id !== article.id)
      if (!persistPinnedIds(nextIds, true)) return false
      message.success(t('Article unpinned.'))
      return true
    }
    if (pinnedArticleIds.length > 3) {
      message.warning(t('More than three articles were already pinned. Unpin articles until three remain before adding another.'))
      return false
    }
    if (pinnedArticleIds.length === 3) {
      setPendingPinArticleId(article.id)
      setReplacementPinId(null)
      return false
    }
    if (!persistPinnedIds([...pinnedArticleIds, article.id])) return false
    message.success(t('Article pinned.'))
    return true
  }
  const confirmPinReplacement = () => {
    if (savingPinRef.current || !pendingPinArticleId || !replacementPinId) return
    const candidate = workspace.articles.find((article) => article.id === pendingPinArticleId)
    if (!candidate || !workspace.articles.some((article) => article.id === replacementPinId && article.pinned === true)) {
      notifyAppError(t('A selected article is no longer available.'))
      setPendingPinArticleId(null)
      return
    }
    savingPinRef.current = true
    setSavingPin(true)
    try {
      const nextIds = pinnedArticleIds.map((id) => id === replacementPinId ? candidate.id : id)
      if (!persistPinnedIds(nextIds)) return
      setPendingPinArticleId(null)
      setReplacementPinId(null)
      message.success(t('Pinned article replaced.'))
    } finally {
      savingPinRef.current = false
      setSavingPin(false)
    }
  }
  const saveHighlightList = (nextHighlights) => {
    if (!saveHighlights(nextHighlights)) {
      notifyAppError(t('Could not save highlights. Browser storage may be full or the saved highlight data may be damaged. Your edits remain open; free storage or repair the saved data, then retry.'))
      return false
    }
    setHighlights(nextHighlights)
    return true
  }
  const saveArticleToHighlights = (collectionId, highlightData) => {
    const sourceExists = workspace.articles.some((article) => article.id === highlightData?.articleId)
    if (!sourceExists) {
      notifyAppError(t('This article is no longer available.'))
      return false
    }
    const collection = highlights.find((item) => item.id === collectionId)
    if (!collection) {
      notifyAppError(t('Choose an available Highlight Collection.'))
      return false
    }
    if (typeof highlightData?.text !== 'string' || !highlightData.text.trim()) {
      notifyAppError(t('There is no article text to save.'))
      return false
    }
    const entries = collection.articleHighlights || []
    if (entries.some((item) => item.articleId === highlightData.articleId && item.text === highlightData.text)) {
      message.info(t('This text is already saved in that collection.'))
      return 'duplicate'
    }
    const entry = createArticleHighlight(highlightData)
    const nextHighlights = highlights.map((item) => item.id === collectionId
      ? { ...item, articleHighlights: [...entries, entry], updatedAt: new Date().toISOString() }
      : item)
    return saveHighlightList(nextHighlights)
  }
  const navigate = (destination) => {
    if (destination === 'write-article') {
      createArticle()
      return
    }
    navigateTo(destination)
  }
  const openArticle = (article) => {
    setEditorReturnPage(page)
    setActiveArticleId(article.id)
    navigateTo(article.status === 'published' ? 'published' : 'editor', { articleId: article.id })
  }
  const openSeo = (returnPage = page, articleId = activeArticleId) => {
    setSeoReturnPage(returnPage)
    navigateTo('seo', { articleId })
  }
  const openShare = (article = activeArticle) => {
    if (!article) return
    if (!articleCanPublish(article)) {
      message.warning(t('A title and body are required to share or publish.'))
      return
    }
    setActiveArticleId(article.id)
    setShareOpen(true)
  }
  const openSchedule = (article = activeArticle) => {
    if (!article) return
    if (!articleCanPublish(article)) {
      message.warning(t('A title and body are required to schedule.'))
      return
    }
    setActiveArticleId(article.id)
    setScheduleOpen(true)
  }
  const handleArticleAction = (article, action) => {
    setActiveArticleId(article.id)
    if (action === 'archive' || action === 'unarchive') {
      updateArticleById(article.id, { archived: action === 'archive', archivedAt: action === 'archive' ? new Date().toISOString() : null })
      message.success(t(action === 'archive' ? 'Article moved to Archive.' : 'Article restored from Archive.'))
      return
    }
    if (action === 'edit') navigateTo('editor', { articleId: article.id })
    if (action === 'seo') openSeo('articles', article.id)
    if (action === 'share' || action === 'publish') openShare(article)
    if (action === 'schedule') openSchedule(article)
    if (action === 'discard') setDiscardOpen(true)
  }
  const publishArticleLocally = async () => {
    if (postingRef.current) return
    if (!activeArticle || !articleCanPublish(activeArticle)) {
      message.warning(t('A title and body are required to publish.'))
      return
    }
    const startedAt = Date.now()
    postingRef.current = true
    setPosting(true)
    try {
      await waitForPostingMinimum(startedAt)
      persistArticleStatus(getPublishedStatus())
      setShareOpen(false)
      navigateTo('published')
      setSuccessOpen(true)
      message.success(t('Post saved as published in this browser.'))
    } catch {
      notifyAppError(t('Could not publish this article. Your draft is still saved.'))
    } finally {
      postingRef.current = false
      setPosting(false)
    }
  }
  const scheduleArticleLocally = async (scheduledAt) => {
    if (postingRef.current) return false
    if (!activeArticle || !articleCanPublish(activeArticle)) {
      message.warning(t('A title and body are required to schedule.'))
      return false
    }
    const selectedTime = new Date(scheduledAt)
    if (!Number.isFinite(selectedTime.getTime()) || selectedTime <= new Date()) {
      message.warning(t('Choose a future date and time'))
      return false
    }
    const startedAt = Date.now()
    postingRef.current = true
    setPosting(true)
    try {
      await waitForPostingMinimum(startedAt)
      persistArticleStatus(getScheduledStatus(selectedTime.toISOString()))
      setScheduleOpen(false)
      message.success(t('The schedule was saved in this browser only.'))
      return true
    } catch {
      notifyAppError(t('Could not save this schedule. Your draft is still saved.'))
      return false
    } finally {
      postingRef.current = false
      setPosting(false)
    }
  }
  const confirmDiscard = () => {
    const discardedId = activeArticleId
    if (!discardedId || !workspace.articles.some((article) => article.id === discardedId)) {
      setDiscardOpen(false)
      return
    }
    const nextWorkspace = {
      ...workspace,
      articles: workspace.articles.filter((article) => article.id !== discardedId),
    }
    setSaveStatus('saving')
    if (!saveWorkspace(nextWorkspace)) {
      setSaveStatus(hasWorkspaceWriteConflict() ? 'conflict' : 'error')
      notifyAppError(t('Could not discard this draft because the browser could not save the change. Your article is still available.'))
      return
    }
    setWorkspace(nextWorkspace)
    setSaveStatus('saved')
    setDiscardOpen(false)
    setActiveArticleId(nextWorkspace.articles[0]?.id || null)
    navigateTo('articles')
    message.success(t('Draft discarded.'))
  }


  const continueFromProfile = () => {
    setEditorReturnPage('profile')
    navigateTo('editor')
  }
  const scheduleFromShare = () => { setShareOpen(false); openSchedule() }
  const changeSessionStatus = (nextStatus) => {
    try {
      if (nextStatus === 'active') sessionStorage.removeItem(SESSION_KEY)
      else sessionStorage.setItem(SESSION_KEY, nextStatus)
    } catch {
      if (nextStatus !== 'active') notifyAppError(t('The browser could not remember this session state.'))
    }
    setSessionStatus(nextStatus)
  }

  const downloadWorkspaceRecoveryCopy = () => {
    const recoveryData = getWorkspaceRecoveryData()
    if (typeof recoveryData !== 'string') {
      notifyAppError(t('Could not read the workspace recovery copy.'))
      return
    }
    const url = URL.createObjectURL(new Blob([recoveryData], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `jeyamohan-workspace-recovery-${new Date().toISOString().slice(0, 10)}.json`
    link.style.display = 'none'
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  if (sessionStatus !== 'active') {
    return <LocalSessionScreen status={sessionStatus} profile={workspace.profile} onContinue={() => changeSessionStatus('active')} />
  }

  let pageContent
  if (page === 'compose') {
    pageContent = <QuickComposerPage profile={workspace.profile} posts={posts} articles={workspace.articles} highlights={highlights} bookmarkedIds={bookmarkedArticleIds} shortcutIds={homeShortcutArticleIds} pinnedIds={pinnedArticleIds} onTogglePin={toggleArticlePin} onToggleBookmark={toggleArticleBookmark} onToggleShortcut={toggleHomeArticleShortcut} onSaveHighlights={saveHighlightList} onCreatePost={createPost} onWriteArticle={() => createArticle()} onOpenArticle={openArticle} onArticleAction={handleArticleAction} />
  } else if (page === 'profile') {
    pageContent = <ProfilePage profile={workspace.profile} onChange={(profile) => updateWorkspace((current) => ({ ...current, profile }))} onContinue={continueFromProfile} />
  } else if (page === 'editor') {
    pageContent = <ArticleEditorPage article={activeArticle} saveStatus={saveStatus} focusMode={focusMode} onToggleFocus={() => setFocusMode((value) => !value)} onSaveDraft={saveNow} onChange={(patch) => updateArticle(patch)} onOpenSeo={() => openSeo('editor')} onManage={() => navigateTo('articles')} onCreate={() => createArticle()} onBackHome={() => goBack(editorReturnPage)} onDiscard={() => setDiscardOpen(true)} onPreview={() => setPreviewOpen(true)} onDownloadPdf={() => setPrintingArticle(activeArticle)} />
  } else if (page === 'seo') {
    pageContent = <SEOSettingsPage article={activeArticle} onChange={(patch) => updateArticle(patch)} onBack={() => goBack(seoReturnPage)} onContinue={() => openShare()} />
  } else if (page === 'published') {
    pageContent = <PublishedPostPage article={activeArticle} onBack={() => goBack('articles')} onEdit={() => navigateTo('editor')} onShare={() => openShare()} onDownloadPdf={() => setPrintingArticle(activeArticle)} />
  } else if (page === 'articles') {
    pageContent = <ArticlesManagementPage articles={workspace.articles.filter((article) => !article.archived)} pinnedIds={pinnedArticleIds} onTogglePin={toggleArticlePin} onCreate={createArticle} onOpen={openArticle} onAction={handleArticleAction} />
  } else if (page === 'bookmarks') {
    pageContent = <BookmarksPage articles={workspace.articles} bookmarkedIds={bookmarkedArticleIds} shortcutIds={homeShortcutArticleIds} pinnedIds={pinnedArticleIds} onOpen={openArticle} onToggleBookmark={toggleArticleBookmark} onToggleShortcut={toggleHomeArticleShortcut} onTogglePin={toggleArticlePin} />
  } else if (page === 'archive') {
    pageContent = <ArchivePage articles={workspace.articles.filter((article) => article.archived)} onOpen={openArticle} onAction={handleArticleAction} pinnedIds={pinnedArticleIds} />
  } else if (page === 'external-ai-tools') {
    pageContent = <ExternalAiToolsPage />
  } else {
    pageContent = <NotFoundPage onHome={() => navigateTo('compose')} />
  }

  return (
    <>
      <MainLayout page={page} focusMode={page === 'editor' && focusMode} onNavigate={navigate} saveStatus={saveStatus} workspaceRecoveryState={workspaceRecoveryState} onDownloadRecoveryCopy={downloadWorkspaceRecoveryCopy} themeMode={themeMode} onThemeChange={onThemeChange} language={language} onLanguageChange={onLanguageChange} profile={workspace.profile} onLock={() => changeSessionStatus('locked')} onSignOut={() => changeSessionStatus('signed-out')}>
        <Suspense fallback={<div className="screen-loading" role="status">{t('Loading…')}</div>}>
          {pageContent}
        </Suspense>
      </MainLayout>
      {printingArticle && <div id="article-print-root" aria-hidden="true"><article className="article-print-content"><header><p>{workspace.profile.name}</p><h1>{getArticleTitle(printingArticle)}</h1></header><div dangerouslySetInnerHTML={{ __html: richTextToHtml(printingArticle.body || '') }} /></article></div>}
      {previewOpen && <Suspense fallback={null}><ArticlePreviewDialog key={activeArticle?.id} open article={activeArticle} highlights={highlights} pinned={pinnedArticleIds.includes(activeArticle?.id)} onTogglePin={() => toggleArticlePin(activeArticle)} onSaveToHighlights={saveArticleToHighlights} onSaveReview={saveArticleSelfReview} bookmarked={bookmarkedArticleIds.includes(activeArticle?.id)} shortcut={homeShortcutArticleIds.includes(activeArticle?.id)} onToggleBookmark={() => toggleArticleBookmark(activeArticle)} onToggleShortcut={() => toggleHomeArticleShortcut(activeArticle)} onClose={() => setPreviewOpen(false)} onDownloadPdf={() => setPrintingArticle(activeArticle)} /></Suspense>}
      <Modal
        className="pin-replacement-modal"
        title={t('Replace a pinned article?')}
        open={Boolean(pendingPinArticleId)}
        onCancel={() => { if (!savingPin) { setPendingPinArticleId(null); setReplacementPinId(null) } }}
        cancelText={t('Cancel')}
        okText={t('Confirm replacement')}
        confirmLoading={savingPin}
        okButtonProps={{ disabled: !replacementPinId }}
        cancelButtonProps={{ disabled: savingPin }}
        closable={!savingPin}
        maskClosable={!savingPin}
        onOk={confirmPinReplacement}
        width={520}
        destroyOnHidden
      >
        <Typography.Paragraph>{t('The pin limit is three. Choose a pinned article to replace with:')} <Typography.Text strong>{pendingPinArticleId ? getArticleTitle(workspace.articles.find((article) => article.id === pendingPinArticleId)) : ''}</Typography.Text></Typography.Paragraph>
        <Radio.Group className="pin-replacement-options" aria-label={t('Choose a pinned article to replace')} value={replacementPinId} onChange={(event) => setReplacementPinId(event.target.value)}>
          {workspace.articles.filter((article) => article.pinned === true).map((article) => <Radio className="pin-replacement-option" key={article.id} value={article.id}>{getArticleTitle(article)}</Radio>)}
        </Radio.Group>
      </Modal>
      {shareOpen && <Suspense fallback={null}><ShareArticleDialog open article={activeArticle} loading={posting} onClose={() => !posting && setShareOpen(false)} onPublishLocal={publishArticleLocally} onSchedule={scheduleFromShare} onDownloadPdf={() => setPrintingArticle(activeArticle)} /></Suspense>}
      {scheduleOpen && <Suspense fallback={null}><SchedulePostDialog open article={activeArticle} loading={posting} onClose={() => !posting && setScheduleOpen(false)} onSchedule={scheduleArticleLocally} /></Suspense>}
      {successOpen && <Suspense fallback={null}><PublishSuccessDialog open article={activeArticle} onClose={() => setSuccessOpen(false)} onView={() => { setSuccessOpen(false); navigateTo('published') }} /></Suspense>}
      {discardOpen && <Suspense fallback={null}><DiscardDraftDialog open article={activeArticle} onCancel={() => setDiscardOpen(false)} onConfirm={confirmDiscard} /></Suspense>}
    </>
  )
}

const THEME_STORAGE_KEY = 'jeyamohan-articles-theme-v1'
const LANGUAGE_STORAGE_KEY = 'jeyamohan-articles-language-v1'

function loadThemeMode() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function loadLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'ta' ? 'ta' : 'en'
  } catch {
    return 'en'
  }
}

export default function App() {
  const [themeMode, setThemeMode] = useState(loadThemeMode)
  const [language, setLanguage] = useState(loadLanguage)
  const isDark = themeMode === 'dark'

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = themeMode
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    } catch {
      // Theme still applies for the current session if browser storage is unavailable.
    }
  }, [themeMode])

  useLayoutEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch {
      // Language still applies for the current session if storage is unavailable.
    }
  }, [language])

  const themeConfig = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDark ? '#f5f5f5' : '#111111',
      colorText: isDark ? '#eeeeee' : '#171717',
      colorTextSecondary: isDark ? '#b4b4b4' : '#777777',
      colorBgBase: isDark ? '#151515' : '#ffffff',
      colorBgLayout: isDark ? '#101010' : '#f7f7f7',
      colorBgContainer: isDark ? '#1c1c1c' : '#ffffff',
      colorBorder: isDark ? '#ffffff' : '#e5e5e5',
      colorBorderSecondary: isDark ? '#ffffff' : '#e5e5e5',
      colorInfo: isDark ? '#69b1ff' : '#1677ff',
      colorWarning: isDark ? '#ffc53d' : '#d48806',
      colorError: isDark ? '#ff7875' : '#c93636',
      colorSuccess: isDark ? '#95de64' : '#389e0d',
      borderRadius: 10,
      controlHeight: 40,
      fontFamily: "'Inter', 'Noto Sans Tamil', 'Latha', 'Nirmala UI', system-ui, sans-serif",
    },
  }

  return (
    <LanguageProvider language={language}>
      <ConfigProvider theme={themeConfig} locale={language === 'ta' ? taIN : enUS}>
        <AntApp>
          <ErrorNotificationHost />
          <SystemErrorBoundary>
            <AppContent themeMode={themeMode} onThemeChange={(checked) => setThemeMode(checked ? 'dark' : 'light')} language={language} onLanguageChange={setLanguage} />
          </SystemErrorBoundary>
        </AntApp>
      </ConfigProvider>
    </LanguageProvider>
  )
}
