import { Card, Input, Typography } from 'antd'
import { getArticleTitle } from '../../utils/article.js'
import { richTextToPlainText } from '../../utils/richText.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

const { Title, Text, Paragraph } = Typography
const slugify = (value) => (typeof value === 'string' ? value : '').toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/gu, '')

export default function SEOSettingsForm({ article, onChange }) {
  const { t } = useLanguage()
  const previewTitle = article.seoTitle || getArticleTitle(article)
  const previewDescription = article.seoDescription || richTextToPlainText(article.body).slice(0, 155) || t('Article description appears here.')
  return (
    <>
      <Card className="surface-card form-card">
        <label className="field-label" htmlFor="seo-title">{t('SEO title')}</label>
        <Input id="seo-title" size="large" maxLength={70} showCount value={article.seoTitle} onChange={(event) => onChange({ seoTitle: event.target.value })} placeholder={t('Search title for this article')} />
        <label className="field-label" htmlFor="seo-description">{t('SEO description')}</label>
        <Input.TextArea id="seo-description" rows={3} maxLength={180} showCount value={article.seoDescription} onChange={(event) => onChange({ seoDescription: event.target.value })} placeholder={t('Short search description')} />
        <label className="field-label" htmlFor="seo-slug">{t('URL slug')}</label>
        <Input id="seo-slug" addonBefore="/articles/" value={article.slug} onChange={(event) => onChange({ slug: slugify(event.target.value) })} placeholder={slugify(article.title) || 'article-name'} />
      </Card>
      <Card className="surface-card preview-card">
        <Text type="secondary">{t('Preview')}</Text>
        <div className="seo-preview"><Text className="preview-url">{t('Local preview')} · /articles/{article.slug || slugify(article.title) || 'article-name'}</Text><Title level={4}>{previewTitle}</Title><Paragraph>{previewDescription}</Paragraph></div>
      </Card>
    </>
  )
}
