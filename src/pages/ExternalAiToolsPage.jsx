import { useState } from 'react'
import { Button, Card, Input, message, Modal, Tooltip, Typography } from 'antd'
import { ArrowUpOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { GeminiMark, GoogleMark } from '../components/common/AiBrandIcons.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function ExternalAiToolsPage() {
  const { t } = useLanguage()
  const [infoOpen, setInfoOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [expanded, setExpanded] = useState(false)

  const buildToolUrl = (service, value) => {
    if (service === 'gemini') return 'https://gemini.google.com/app'
    const url = new URL('https://www.google.com/ai')
    url.searchParams.set('q', value.trim())
    return url.toString()
  }

  const copyPrompt = async (value) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return
    }

    const helper = document.createElement('textarea')
    helper.value = value
    helper.setAttribute('readonly', '')
    helper.style.position = 'fixed'
    helper.style.opacity = '0'
    document.body.append(helper)
    helper.select()
    const copied = document.execCommand('copy')
    helper.remove()
    if (!copied) throw new Error('Clipboard access is unavailable')
  }

  const prepareGeminiPrompt = (value) => {
    copyPrompt(value)
      .then(() => message.success(t('Prompt copied to your clipboard. Paste it into Gemini to get a response.')))
      .catch(() => message.warning(t('Could not copy the prompt. Copy it here and paste it into Gemini.')))
  }

  const openTool = (service) => {
    const value = prompt.trim()
    if (!value) {
      message.warning(t('Enter a prompt to continue.'))
      return
    }

    const tab = window.open(buildToolUrl(service, value), '_blank')
    if (tab) tab.opener = null
    else message.warning(t('Your browser blocked the new tab. Allow pop-ups and try again.'))
    if (service === 'gemini') prepareGeminiPrompt(value)
  }

  const openBothTools = (event) => {
    event.preventDefault()
    const value = prompt.trim()
    if (!value) {
      message.warning(t('Enter a prompt to continue.'))
      return
    }

    // Open both windows during the user gesture so browsers are less likely to block them.
    const googleTab = window.open(buildToolUrl('google', value), '_blank')
    const geminiTab = window.open(buildToolUrl('gemini', value), '_blank')
    if (googleTab) googleTab.opener = null
    if (geminiTab) geminiTab.opener = null
    if (!googleTab || !geminiTab) message.warning(t('Your browser blocked one or more tabs. Allow pop-ups and try again.'))
    prepareGeminiPrompt(value)
  }

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
        <Typography.Paragraph className="external-ai-prompt-hint" type="secondary">
          {t('Google AI opens with your prompt. Gemini opens separately with the prompt copied for you to paste.')}
        </Typography.Paragraph>
        <form className={`external-ai-prompt-form ${expanded ? 'is-expanded' : ''}`} onSubmit={openBothTools}>
          <div className="external-ai-composer">
            <Button
              className="external-ai-expand-button"
              type="text"
              icon={<PlusOutlined />}
              aria-label={t(expanded ? 'Use a single-line prompt' : 'Expand prompt editor')}
              aria-expanded={expanded}
              onClick={() => setExpanded((current) => !current)}
            />
            {expanded ? (
              <Input.TextArea
                className="external-ai-prompt-input"
                aria-label={t('Your prompt')}
                placeholder={t('What would you like to ask?')}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                autoSize={{ minRows: 2, maxRows: 7 }}
                maxLength={2000}
              />
            ) : (
              <Input
                className="external-ai-prompt-input"
                aria-label={t('Your prompt')}
                placeholder={t('What would you like to ask?')}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onPressEnter={openBothTools}
                maxLength={2000}
              />
            )}
            <Tooltip title={t('Open this prompt in both services')}>
              <Button
                className="external-ai-send-button"
                type="primary"
                htmlType="submit"
                shape="circle"
                icon={<ArrowUpOutlined />}
                aria-label={t('Open both with this prompt')}
                disabled={!prompt.trim()}
              />
            </Tooltip>
          </div>
          <div className="external-ai-prompt-footer">
            <Typography.Text type="secondary">{t(expanded ? 'Click the arrow to open both tabs.' : 'Press Enter to open both tabs.')}</Typography.Text>
            <Typography.Text type="secondary">{prompt.length}/2000</Typography.Text>
          </div>
          <div className="external-ai-support-actions">
            <Button className="external-ai-support-link" htmlType="button" icon={<GoogleMark />} onClick={() => openTool('google')}>
              {t('Ask Google AI')}
            </Button>
            <Button className="external-ai-support-link" htmlType="button" icon={<GeminiMark />} onClick={() => openTool('gemini')}>
              {t('Ask Gemini')}
            </Button>
          </div>
        </form>
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
        <Typography.Paragraph>{t('Google AI accepts the prompt in its search link. Gemini does not support prompt-prefill links, so this app copies your prompt and opens Gemini for you to paste it.')}</Typography.Paragraph>
        <Typography.Paragraph type="secondary">{t('Only the prompt you type here is shared. Your drafts and article content are not sent.')}</Typography.Paragraph>
      </Modal>
    </main>
  )
}
