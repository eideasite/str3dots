import { Button, Dropdown } from 'antd'
import { InboxOutlined, CalendarOutlined, DeleteOutlined, EditOutlined, GlobalOutlined, MoreOutlined, SendOutlined, ShareAltOutlined, UndoOutlined } from '@ant-design/icons'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function ArticleActionsMenu({ article, onAction }) {
  const { t } = useLanguage()
  const items = [
    article.archived
      ? { key: 'unarchive', icon: <UndoOutlined />, label: t('Restore from archive') }
      : { key: 'archive', icon: <InboxOutlined />, label: t('Archive article') },
    { key: 'edit', icon: <EditOutlined />, label: t('Edit article') },
    { key: 'seo', icon: <GlobalOutlined />, label: t('SEO settings') },
    { key: 'share', icon: <ShareAltOutlined />, label: t(article.status === 'published' ? 'Share' : 'Share / publish') },
    ...(article.status !== 'published' ? [{ key: 'schedule', icon: <CalendarOutlined />, label: t('Schedule article') }] : []),
    ...(article.status !== 'published' ? [{ key: 'publish', icon: <SendOutlined />, label: t('Publish locally') }] : []),
    ...(article.status === 'draft' ? [{ key: 'discard', danger: true, icon: <DeleteOutlined />, label: t('Discard draft') }] : []),
  ]
  return (
    <Dropdown trigger={['click']} menu={{ items, onClick: ({ key, domEvent }) => { domEvent.stopPropagation(); onAction(article, key) } }}>
      <Button aria-label={t('Article actions')} type="text" icon={<MoreOutlined />} onClick={(event) => event.stopPropagation()} />
    </Dropdown>
  )
}
