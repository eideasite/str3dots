import { Alert, Button, Card, Typography } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import SEOSettingsForm from '../components/seo/SEOSettingsForm.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const { Title, Text, Paragraph } = Typography

export default function SEOSettingsPage({ article, onChange, onBack, onContinue }) {
  const { t } = useLanguage()
  if (!article) return <div className="page-wrap"><Card className="surface-card"><Paragraph>{t('Open a draft from Articles Management or create a new article.')}</Paragraph><Button onClick={onBack}>{t('Back to articles')}</Button></Card></div>
  return (
    <div className="page-wrap narrow-page">
      <div className="page-heading"><Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack}>{t('Back')}</Button><Text className="eyebrow">{t('Article settings')}</Text><Title level={2}>{t('SEO Settings')}</Title><Paragraph>{t('These details are saved with the article in this browser.')}</Paragraph></div>
      <Alert className="local-notice" showIcon type="info" message={t('Local search preview')} description={t('This data is local to your article and is not sent to a search engine.')} />
      <SEOSettingsForm article={article} onChange={onChange} />
      <div className="form-actions"><Button type="primary" icon={<ArrowRightOutlined />} onClick={onContinue}>{t('Continue to Share Article')}</Button></div>
    </div>
  )
}
