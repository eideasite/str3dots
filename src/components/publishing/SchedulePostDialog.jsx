import { useState } from 'react'
import { Alert, Button, DatePicker, Modal, Space, Spin, Typography, message } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { getArticleTitle } from '../../utils/article.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

const { Paragraph, Text } = Typography

export default function SchedulePostDialog({ open, article, onClose, onSchedule, loading = false }) {
  const [scheduledAt, setScheduledAt] = useState(null)
  const { t, language } = useLanguage()
  const submit = () => {
    if (!scheduledAt || scheduledAt.toDate() <= new Date()) {
      message.warning(t('Choose a future date and time'))
      return
    }
    Promise.resolve(onSchedule(scheduledAt.toDate().toISOString())).then((saved) => {
      if (saved !== false) setScheduledAt(null)
    })
  }
  const close = () => { setScheduledAt(null); onClose() }
  return (
    <Modal title={t('Schedule post')} open={open} onCancel={close} footer={null} closable={!loading} maskClosable={!loading} keyboard={!loading} destroyOnHidden>
      <Spin spinning={loading} tip={t('Scheduling...')}>
      <Paragraph className="dialog-article-title">{getArticleTitle(article)}</Paragraph>
      <Alert showIcon type="warning" message={t('Local schedule only')} description={t('The selected time is saved in this browser. Automatic publishing will not happen; no external service is connected.')} />
      <label className="field-label" htmlFor="schedule-date">{t('Choose date and time')}</label>
      <DatePicker id="schedule-date" className="schedule-picker" showTime={{ format: 'HH:mm' }} format="DD/MM/YYYY HH:mm" value={scheduledAt} onChange={setScheduledAt} disabled={loading} disabledDate={(date) => date && date.toDate() < new Date(new Date().setHours(0, 0, 0, 0))} />
      <Space className="dialog-actions">
        <Button onClick={close} disabled={loading}>{t('Cancel')}</Button>
        <Button type="primary" icon={<CalendarOutlined />} loading={loading} disabled={loading} onClick={submit}>{t('Schedule locally')}</Button>
      </Space>
      {article?.scheduledAt && <Text type="secondary">{t('Previous schedule')}: {new Date(article.scheduledAt).toLocaleString(language === 'ta' ? 'ta-LK' : 'en-US')}</Text>}
      </Spin>
    </Modal>
  )
}
