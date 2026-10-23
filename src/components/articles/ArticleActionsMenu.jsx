import { Button, Dropdown } from 'antd'
import { InboxOutlined, CalendarOutlined, DeleteOutlined, EditOutlined, GlobalOutlined, MoreOutlined, SendOutlined, ShareAltOutlined, UndoOutlined } from '@ant-design/icons'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function ArticleActionsMenu({ article, onAction }) {
  const { t } = useLanguage()
  const isPublished = article.status === 'published'
  const items = [
    article.archived
      ? { key: 'unarchive', icon: <UndoOutlined />, label: t('Restore from archive') }
      : { key: 'archive', icon: <InboxOutlined />, label: t('Archive article') },
    { key: 'edit', icon: <EditOutlined />, label: t('Edit article') },
    { key: 'seo', icon: <GlobalOutlined />, label: t('SEO settings') },
    { key: 'share', icon: <ShareAltOutlined />, label: t(isPublished ? 'Share' : 'Share / publish') },
    ...(!isPublished ? [{ key: 'schedule', icon: <CalendarOutlined />, label: t('Schedule article') }] : []),
    ...(!isPublished ? [{ key: 'publish', icon: <SendOutlined />, label: t('Publish locally') }] : []),
    ...(article.status === 'draft' ? [{ key: 'discard', danger: true, icon: <DeleteOutlined />, label: t('Discard draft') }] : []),
  ]
  const handleMenuClick = ({ key, domEvent }) => {
    domEvent.stopPropagation()
    onAction(article, key)
  }

  return (
    <Dropdown trigger={['click']} menu={{ items, onClick: handleMenuClick }}>
      <Button aria-label={t('Article actions')} type="text" icon={<MoreOutlined />} onClick={(event) => event.stopPropagation()} />
    </Dropdown>
  )
}
