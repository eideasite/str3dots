import { useMemo } from 'react'
import { Button, Space, Tooltip, Typography } from 'antd'
import ArticleStatusTag from '../common/ArticleStatusTag.jsx'
import ArticleActionsMenu from './ArticleActionsMenu.jsx'
import { BookFilled, BookOutlined, FileTextOutlined, PushpinFilled, PushpinOutlined, StarFilled, StarOutlined } from '@ant-design/icons'
import { getArticleExcerpt, getArticleTitle } from '../../utils/article.js'
import { formatDate, getDateLocale } from '../../utils/formatDate.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

const { Title, Text, Paragraph } = Typography

export default function ArticleCard({ article, onOpen, onAction, isBookmarked, isShortcut, isPinned, onToggleBookmark, onToggleShortcut, onTogglePin, displayTitle, compact = false }) {
  const { t, language } = useLanguage()
  const pinLabel = t(isPinned ? 'Unpin article' : 'Pin article')
  const bookmarkLabel = t(isBookmarked ? 'Remove bookmark' : 'Bookmark article')
  const shortcutLabel = t(isShortcut ? 'Remove home shortcut' : 'Add to Home Shortcuts')
  const title = displayTitle || getArticleTitle(article)
  const excerpt = useMemo(() => getArticleExcerpt(article.body), [article.body])
  const updatedDate = useMemo(
    () => formatDate(article.updatedAt, undefined, getDateLocale(language)),
    [article.updatedAt, language],
  )
  const openLabel = t(article.status === 'published' ? 'View article' : 'Open article')
  const articleOpenLabel = `${openLabel}: ${title}`

  return (
    <article className={`article-row${compact ? ' article-row-compact' : ''}`}>
      <Button
        type="text"
        className="article-row-main"
        aria-label={articleOpenLabel}
        onClick={() => onOpen(article)}
      >
        <div className="article-row-title">
          <Title level={5}>{title}</Title>
          <ArticleStatusTag status={article.status} />
        </div>
        <Paragraph ellipsis={{ rows: 2 }} type="secondary">
          {excerpt || t('Article body has not been added yet.')}
        </Paragraph>
        <Text className="article-row-date" type="secondary">
          {t('Updated:')} {updatedDate}
        </Text>
      </Button>
      <Space className="article-row-actions" wrap>
        {onTogglePin && (
          <Tooltip title={pinLabel} placement="top">
            <Button
              className="article-action-button article-action-pin"
              type={isPinned ? 'primary' : 'default'}
              icon={isPinned ? <PushpinFilled /> : <PushpinOutlined />}
              aria-label={pinLabel}
              aria-pressed={isPinned}
              onClick={() => onTogglePin(article)}
            >
              {compact ? null : t(isPinned ? 'Pinned' : 'Pin')}
            </Button>
          </Tooltip>
        )}
        {onToggleBookmark && (
          <Tooltip title={bookmarkLabel} placement="top">
            <Button
              className="article-action-button article-action-bookmark"
              type={isBookmarked ? 'primary' : 'default'}
              icon={isBookmarked ? <BookFilled /> : <BookOutlined />}
              aria-label={bookmarkLabel}
              aria-pressed={isBookmarked}
              onClick={() => onToggleBookmark(article)}
            >
              {compact ? null : t(isBookmarked ? 'Bookmarked' : 'Bookmark')}
            </Button>
          </Tooltip>
        )}
        {onToggleShortcut && (
          <Tooltip title={shortcutLabel} placement="top">
            <Button
              className="article-action-button article-action-shortcut"
              type={isShortcut ? 'primary' : 'default'}
              icon={isShortcut ? <StarFilled /> : <StarOutlined />}
              aria-label={shortcutLabel}
              aria-pressed={isShortcut}
              onClick={() => onToggleShortcut(article)}
            >
              {compact ? null : t(isShortcut ? 'In shortcuts' : 'Add shortcut')}
            </Button>
          </Tooltip>
        )}
        <Tooltip title={openLabel} placement="top">
          <Button
            className="article-action-button article-action-open"
            icon={compact ? <FileTextOutlined /> : null}
            aria-label={articleOpenLabel}
            onClick={() => onOpen(article)}
          >
            {compact ? null : openLabel}
          </Button>
        </Tooltip>
        {onAction && <ArticleActionsMenu article={article} onAction={onAction} />}
      </Space>
    </article>
  )
}
