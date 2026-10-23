import { useState } from 'react'
import { Button, Card, Segmented, Typography } from 'antd'
import { FileAddOutlined } from '@ant-design/icons'
import ArticleList from '../components/articles/ArticleList.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const { Title, Text, Paragraph } = Typography
const filters = [
  { label: 'All', value: 'all' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Scheduled articles', value: 'scheduled' },
  { label: 'Published articles', value: 'published' },
]

export default function ArticlesManagementPage({ articles, onCreate, onOpen, onAction, pinnedIds, onTogglePin }) {
  const [filter, setFilter] = useState('all')
  const { t } = useLanguage()
  return (
    <div className="page-wrap">
      <div className="page-heading page-heading-row">
        <div><Text className="eyebrow">{t('Your writing')}</Text><Title level={2}>{t('Articles')}</Title><Paragraph>{t('Manage drafts and locally published articles.')}</Paragraph></div>
        <Button type="primary" icon={<FileAddOutlined />} onClick={onCreate}>{t('New article')}</Button>
      </div>
      <Card className="surface-card list-card">
        <div className="list-toolbar"><Segmented options={filters.map((item) => ({ ...item, label: t(item.label) }))} value={filter} onChange={setFilter} /></div>
        <ArticleList articles={articles} filter={filter} onOpen={onOpen} onAction={onAction} pinnedIds={pinnedIds} onTogglePin={onTogglePin} />
      </Card>
    </div>
  )
}
