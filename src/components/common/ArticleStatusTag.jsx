import { Tag } from 'antd'
import { useLanguage } from '../../context/LanguageContext.jsx'

const statusLabels = { draft: 'Draft', scheduled: 'Scheduled locally', published: 'Published locally' }

export default function ArticleStatusTag({ status }) {
  const { t } = useLanguage()
  return <Tag className={`status-tag status-${status || 'draft'}`} role="status">{t(statusLabels[status] || statusLabels.draft)}</Tag>
}
