import { Alert, Card, Typography } from 'antd'
import ArticleList from '../components/articles/ArticleList.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const { Paragraph, Text, Title } = Typography

export default function BookmarksPage({ articles, bookmarkedIds, shortcutIds, pinnedIds, onOpen, onToggleBookmark, onToggleShortcut, onTogglePin }) {
  const { t } = useLanguage()
  const bookmarkedSet = new Set(bookmarkedIds)
  const bookmarkedArticles = articles.filter((article) => bookmarkedSet.has(article.id))
  const missingCount = bookmarkedIds.length - bookmarkedArticles.length

  return (
    <div className="page-wrap">
      <div className="page-heading">
        <Text className="eyebrow">{t('Your writing')}</Text>
        <Title level={2}>{t('Bookmarks')}</Title>
        <Paragraph>{t('Articles you saved for quick access.')}</Paragraph>
      </div>
      {missingCount > 0 && <Alert className="local-notice" type="warning" showIcon message={t('Some bookmarked articles are no longer available.')} />}
      <Card className="surface-card list-card">
        <ArticleList
          articles={bookmarkedArticles}
          filter="all"
          onOpen={onOpen}
          bookmarkedIds={bookmarkedIds}
          onToggleBookmark={onToggleBookmark}
          onToggleShortcut={onToggleShortcut}
          shortcutIds={shortcutIds}
          pinnedIds={pinnedIds}
          emptyDescription={t(bookmarkedIds.length ? 'Saved bookmarks are unavailable.' : 'No bookmarked articles yet')}
          onTogglePin={onTogglePin}
        />
      </Card>
    </div>
  )
}
