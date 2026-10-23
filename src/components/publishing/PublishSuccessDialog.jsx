import { Button, Modal, Result } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { getArticleTitle } from '../../utils/article.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function PublishSuccessDialog({ open, article, onClose, onView }) {
  const { t } = useLanguage()
  return (
    <Modal open={open} onCancel={onClose} footer={null} closable={false} centered>
      <Result
        icon={<CheckCircleOutlined />}
        title={t('Published in this browser')}
        subTitle={t('“{title}” was marked as published in this browser. It has not been published on the internet.').replace('{title}', getArticleTitle(article))}
        extra={<Button type="primary" onClick={onView}>{t('View published post')}</Button>}
      />
    </Modal>
  )
}
