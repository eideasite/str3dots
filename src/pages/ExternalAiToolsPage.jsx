import { useState } from 'react'
import { Button, Card, Modal, Tooltip, Typography } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { GeminiMark, GoogleMark } from '../components/common/AiBrandIcons.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function ExternalAiToolsPage() {
  const { t } = useLanguage()
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <main className="page-wrap external-ai-tools-page">
      <header className="page-heading">
        <div>
          <Typography.Text className="eyebrow">{t('YOUR WRITING')}</Typography.Text>
          <Typography.Title level={1}>{t('External AI tools')}</Typography.Title>
          <Typography.Paragraph type="secondary">{t('These services operate separately from your writing workspace. This app does not send drafts or article content when you open a tool.')}</Typography.Paragraph>
        </div>
      </header>

      <Card className="external-ai-support-card external-ai-tools-card" aria-labelledby="external-ai-tools-heading">
        <div className="external-ai-support-heading-row">
          <Typography.Text id="external-ai-tools-heading" strong><GeminiMark /> {t('Ask with AI')}</Typography.Text>
          <Tooltip title={t('About Google AI and Gemini')}>
            <Button type="text" icon={<InfoCircleOutlined />} aria-label={t('About Google AI and Gemini')} onClick={() => setInfoOpen(true)} />
          </Tooltip>
        </div>
        <div className="external-ai-support-actions">
          <Button className="external-ai-support-link" href="https://www.google.com/ai" target="_blank" rel="noopener noreferrer" icon={<GoogleMark />}>
            {t('Ask Google AI')}
          </Button>
          <Button className="external-ai-support-link" href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer" icon={<GeminiMark />}>
            {t('Ask Gemini')}
          </Button>
        </div>
      </Card>

      <Modal
        className="external-ai-info-modal"
        title={t('About Google AI and Gemini')}
        open={infoOpen}
        onCancel={() => setInfoOpen(false)}
        footer={<Button type="primary" onClick={() => setInfoOpen(false)}>{t('Got it')}</Button>}
        centered
        width={440}
        destroyOnHidden
      >
        <Typography.Paragraph>{t('Use Ask Google AI or Ask Gemini to open those services in a new tab.')}</Typography.Paragraph>
        <Typography.Paragraph type="secondary">{t('Your drafts stay in this writing space. They are not sent when you open either service. Copy and paste only the text you want to share.')}</Typography.Paragraph>
      </Modal>
    </main>
  )
}
