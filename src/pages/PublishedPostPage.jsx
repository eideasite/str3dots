import { Alert, Button, Card, Space, Typography } from 'antd'
import { ArrowLeftOutlined, EditOutlined, FilePdfOutlined, ShareAltOutlined } from '@ant-design/icons'
import ArticleStatusTag from '../components/common/ArticleStatusTag.jsx'
import { getArticleTitle, getReadingMinutes, getWordCount } from '../utils/article.js'
import { formatDate } from '../utils/formatDate.js'
import { richTextToHtml } from '../utils/richText.js'
import { useLanguage } from '../context/LanguageContext.jsx'

const { Title, Text, Paragraph } = Typography

export default function PublishedPostPage({ article, onBack, onEdit, onShare, onDownloadPdf }) {
  const { t, language } = useLanguage()
  if (!article) return null
  return (
    <div className="page-wrap published-page">
      <div className="page-heading page-heading-row">
        <div><Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack}>{t('Back to articles')}</Button><div className="published-heading-tags"><ArticleStatusTag status={article.status} /><Text type="secondary">{getWordCount(article.body)} {t('words')} · {getReadingMinutes(article.body)} {t('min read')}</Text></div><Title level={1}>{getArticleTitle(article)}</Title></div>
        <Space wrap><Button icon={<FilePdfOutlined />} onClick={onDownloadPdf}>{t('Save as PDF')}</Button><Button icon={<EditOutlined />} onClick={onEdit}>{t('Edit article')}</Button><Button icon={<ShareAltOutlined />} onClick={onShare}>{t('Share')}</Button></Space>
      </div>
      <Alert className="local-notice" showIcon type="warning" message={t('Local published preview')} description={t('This page shows the locally saved status in this browser only. It is not a page published on the internet.')} />
      <Card className="surface-card published-card">
        {article.seoDescription && <Paragraph className="published-description">{article.seoDescription}</Paragraph>}
        <div className="published-body" dangerouslySetInnerHTML={{ __html: richTextToHtml(article.body || '') }} />
        <div className="published-meta"><Text type="secondary">{article.publishedAt ? `${t('Published locally at')}: ${formatDate(article.publishedAt, { dateStyle: 'medium', timeStyle: 'short' }, language === 'ta' ? 'ta-LK' : 'en-US')}` : t('Not yet published')}</Text>{article.slug && <Text type="secondary">{t('Local URL slug')}: /articles/{article.slug}</Text>}</div>
      </Card>
    </div>
  )
}
