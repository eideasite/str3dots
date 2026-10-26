import { useState } from 'react'
import { Button, message } from 'antd'
import { CloseOutlined, DislikeOutlined, LikeOutlined } from '@ant-design/icons'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function ConversationFeedback() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(true)
  const [messageApi, contextHolder] = message.useMessage()

  const submitFeedback = () => {
    messageApi.success(t('Thanks for your feedback'), 3)
    setVisible(false)
  }

  return <>
    {contextHolder}
    {visible && <section className="conversation-feedback" aria-label={t('Feedback')}>
      <span className="conversation-feedback-prompt">{t('Is this app helpful so far?')}</span>
      <Button type="text" icon={<LikeOutlined />} aria-label={t('Yes, this app is helpful')} onClick={submitFeedback} />
      <Button type="text" icon={<DislikeOutlined />} aria-label={t('No, this app is not helpful')} onClick={submitFeedback} />
      <Button type="text" icon={<CloseOutlined />} aria-label={t('Dismiss feedback')} onClick={() => setVisible(false)} />
    </section>}
  </>
}
