import { Card, Typography } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import ArticleList from '../components/articles/ArticleList.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const { Title, Text, Paragraph } = Typography

export default function ArchivePage({ articles, onOpen, onAction, pinnedIds = [] }) {
  const { t } = useLanguage()
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <Text className="eyebrow"><InboxOutlined /> {t('Your library')}</Text>
        <Title level={2}>{t('Archive')}</Title>
        <Paragraph>{t('Archived articles are kept here until you restore them.')}</Paragraph>
      </div>
      <Card className="surface-card list-card">
        <ArticleList articles={articles} filter="all" onOpen={onOpen} onAction={onAction} pinnedIds={pinnedIds} emptyDescription={t('No archived articles yet')} />
      </Card>
    </div>
  )
}
