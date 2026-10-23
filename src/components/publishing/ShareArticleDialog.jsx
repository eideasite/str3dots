import { notifyAppError } from '../../services/errorNotifications.js'
import { Alert, Button, Modal, Space, Spin, Typography, message } from 'antd'
import { CalendarOutlined, CopyOutlined, DownloadOutlined, FilePdfOutlined, SendOutlined } from '@ant-design/icons'
import { getArticleTitle } from '../../utils/article.js'
import { downloadArticle } from '../../utils/downloadArticle.js'
import { richTextToPlainText } from '../../utils/richText.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

const { Paragraph, Text } = Typography

export default function ShareArticleDialog({ open, article, onClose, onPublishLocal, onSchedule, onDownloadPdf, loading = false }) {
  const { t } = useLanguage()
  const copyText = async () => {
    const content = `${getArticleTitle(article)}\n\n${richTextToPlainText(article.body || '')}`
    try {
      await navigator.clipboard.writeText(content)
      message.success(t('Article text copied'))
    } catch {
      notifyAppError(t('Could not copy in this browser'))
    }
  }
  return (
    <Modal title={t(article?.status === 'published' ? 'Share article' : 'Share / publish')} open={open} onCancel={onClose} footer={null} closable={!loading} maskClosable={!loading} keyboard={!loading} destroyOnHidden>
      <Spin spinning={loading} tip={t('Posting...')}>
      <Paragraph className="dialog-article-title">{getArticleTitle(article)}</Paragraph>
      <Alert showIcon type="info" message={t('External publishing is not connected')} description={t('This app does not publish to social media. You can copy or download the text, or record a local published status in this browser.')} />
      <Space wrap className="dialog-actions">
        <Button icon={<CopyOutlined />} onClick={copyText}>{t('Copy text')}</Button>
        <Button icon={<DownloadOutlined />} onClick={() => downloadArticle(article)}>{t('Download .txt')}</Button>
        <Button icon={<FilePdfOutlined />} disabled={loading} onClick={onDownloadPdf}>{t('Save as PDF')}</Button>
        {article?.status !== 'published' && <Button icon={<CalendarOutlined />} onClick={onSchedule}>{t('Schedule (optional)')}</Button>}
        {article?.status !== 'published' && <Button type="primary" icon={<SendOutlined />} loading={loading} disabled={loading} onClick={onPublishLocal}>{t('Publish locally')}</Button>}
      </Space>
      <Text type="secondary" className="dialog-footnote">{t('Publishing here only changes the local status in this browser.')}</Text>
      </Spin>
    </Modal>
  )
}
