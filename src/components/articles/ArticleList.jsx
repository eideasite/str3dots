import { Empty } from 'antd'
import ArticleCard from './ArticleCard.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function ArticleList({
  articles,
  filter,
  onOpen,
  onAction,
  bookmarkedIds = [],
  shortcutIds = [],
  pinnedIds = [],
  onToggleBookmark,
  onToggleShortcut,
  onTogglePin,
  emptyDescription,
  articleSampleNumbers,
  compact = false,
}) {
  const { t } = useLanguage()
  const visible = articles.filter((article) => filter === 'all' || article.status === filter)
  if (!visible.length) {
    return (
      <Empty
        className="list-empty"
        description={emptyDescription || t(filter === 'all' ? 'No articles yet' : 'No articles in this category')}
      />
    )
  }

  const bookmarkedSet = new Set(bookmarkedIds)
  const shortcutSet = new Set(shortcutIds)
  const pinnedSet = new Set(pinnedIds)
  const sampleNumbers = articleSampleNumbers || articles.reduce((numbers, article) => {
    if (!(typeof article.title === 'string' && article.title.trim())) {
      numbers.set(article.id, numbers.size + 1)
    }
    return numbers
  }, new Map())

  return (
    <div className={`article-list${compact ? ' article-list-compact' : ''}`}>
      {visible.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onOpen={onOpen}
          onAction={onAction}
          isBookmarked={bookmarkedSet.has(article.id)}
          isShortcut={shortcutSet.has(article.id)}
          isPinned={pinnedSet.has(article.id)}
          onToggleBookmark={onToggleBookmark}
          onToggleShortcut={onToggleShortcut}
          onTogglePin={onTogglePin}
          displayTitle={typeof article.title === 'string' && article.title.trim() ? undefined : `Article Sample ${sampleNumbers.get(article.id) || 1}`}
          compact={compact}
        />
      ))}
    </div>
  )
}
