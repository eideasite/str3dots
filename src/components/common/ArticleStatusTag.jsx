import { Tag } from 'antd'
import { useLanguage } from '../../context/LanguageContext.jsx'

const statusLabels = { draft: 'Draft', scheduled: 'Scheduled locally', published: 'Published locally' }

export default function ArticleStatusTag({ status }) {
  const { t } = useLanguage()
  const safeStatus = Object.hasOwn(statusLabels, status) ? status : 'draft'
  return <Tag className={`status-tag status-${safeStatus}`} role="status">{t(statusLabels[safeStatus])}</Tag>
}
