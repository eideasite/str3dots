import { useState } from 'react'
import { Button, Dropdown, Input, Popover, Space, Tooltip, Typography } from 'antd'
import {
  AlignLeftOutlined,
  ArrowLeftOutlined,
  BoldOutlined,
  CodeOutlined,
  DownOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PictureOutlined,
  CommentOutlined,
  RobotOutlined,
  UnorderedListOutlined,
  UnderlineOutlined,
} from '@ant-design/icons'
import { useLanguage } from '../../context/LanguageContext.jsx'

const formatItems = [
  { key: 'paragraph', label: 'Paragraph' },
  { key: 'heading1', label: 'Heading 1' },
  { key: 'heading2', label: 'Heading 2' },
  { key: 'heading3', label: 'Subheading' },
]

const formatActions = [
  { key: 'bold', label: 'Bold', icon: <BoldOutlined /> },
  { key: 'italic', label: 'Italic', icon: <ItalicOutlined /> },
  { key: 'underline', label: 'Underline', icon: <UnderlineOutlined /> },
  { key: 'bullet', label: 'Bulleted list', icon: <UnorderedListOutlined /> },
  { key: 'number', label: 'Numbered list', icon: <OrderedListOutlined /> },
  { key: 'quote', label: 'Quote', icon: <CommentOutlined /> },
  { key: 'codeblock', label: 'Code block', icon: <CodeOutlined /> },
  { key: 'rule', label: 'Horizontal line', icon: <AlignLeftOutlined /> },
  { key: 'link', label: 'Insert link', icon: <LinkOutlined /> },
  { key: 'image', label: 'Insert image reference', icon: <PictureOutlined /> },
]

const toggleFormatKeys = new Set(['bold', 'italic', 'underline', 'bullet', 'number', 'quote', 'codeblock'])
const referenceFormatKeys = new Set(['link', 'image'])

export function EditorFormatToolbar({ onFormat, activeFormats = {} }) {
  const { t } = useLanguage()
  const [activePopover, setActivePopover] = useState(null)
  const [url, setUrl] = useState('')
  const insertReference = (kind) => {
    if (!url.trim()) return
    onFormat(kind, url.trim())
    setUrl('')
    setActivePopover(null)
  }

  return (
    <div className="editor-format-toolbar" role="toolbar" aria-label={t('Article formatting')}>
      <Dropdown menu={{ items: formatItems.map((item) => ({ ...item, label: t(item.label) })), selectedKeys: activeFormats.block ? [activeFormats.block] : [], onClick: ({ key }) => onFormat(key) }} trigger={['click']}>
        <Button className="format-style-button" aria-label={t('Choose text style')} onMouseDown={(event) => event.preventDefault()}>
          {t(formatItems.find((item) => item.key === activeFormats.block)?.label || 'Style')} <DownOutlined />
        </Button>
      </Dropdown>
      <div className="format-size-controls" role="group" aria-label={t('Selected text size')}>
        <Tooltip title={t('Decrease selected text size')}>
          <Button className="format-size-button" aria-label={t('Decrease selected text size')} disabled={!activeFormats.hasSelection || activeFormats.fontSize === 0} onMouseDown={(event) => event.preventDefault()} onClick={() => onFormat('fontDecrease')}>
            <span aria-hidden="true">A−</span>
          </Button>
        </Tooltip>
        <Tooltip title={t('Increase selected text size')}>
          <Button className="format-size-button" aria-label={t('Increase selected text size')} disabled={!activeFormats.hasSelection || activeFormats.fontSize === 4} onMouseDown={(event) => event.preventDefault()} onClick={() => onFormat('fontIncrease')}>
            <span aria-hidden="true">A+</span>
          </Button>
        </Tooltip>
      </div>
      {formatActions.map(({ key, label, icon }) => {
        const isToggle = toggleFormatKeys.has(key)
        const isActive = isToggle && activeFormats[key] === true
        const action = (
          <Button
            className={`format-icon-button${isActive ? ' is-active' : ''}`}
            aria-label={t(label)}
            aria-pressed={isToggle ? isActive : undefined}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (referenceFormatKeys.has(key)) {
                setUrl('')
                setActivePopover(key)
                return
              }

              onFormat(key)
            }}
          >
            {icon}
          </Button>
        )
        if (referenceFormatKeys.has(key)) {
          const referenceLabel = key === 'link' ? 'Insert link' : 'Insert image'
          const inputPlaceholder = key === 'link' ? 'https://...' : t('Image URL')

          return (
            <Popover
              key={key}
              title={t(referenceLabel)}
              open={activePopover === key}
              onOpenChange={(open) => setActivePopover(open ? key : null)}
              content={(
                <Space direction="vertical" size="small" className="reference-popover">
                  <Input
                    autoFocus
                    placeholder={inputPlaceholder}
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    onPressEnter={() => insertReference(key)}
                  />
                  <Button
                    type="primary"
                    block
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertReference(key)}
                  >
                    {t('Insert')}
                  </Button>
                </Space>
              )}
              trigger="click"
              placement="right"
            >
              <span className="format-popover-trigger"><Tooltip title={label} placement="left">{action}</Tooltip></span>
            </Popover>
          )
        }
        return <Tooltip key={key} title={t(label)} placement="left">{action}</Tooltip>
      })}
      <Typography.Text className="format-help">{t('Select text, then choose a format.')}</Typography.Text>
    </div>
  )
}

export default function EditorToolbar({ focusMode = false, onToggleFocus, onBackHome, onAskGemini }) {
  const { t } = useLanguage()

  return (
    <div className="editor-flow-toolbar">
      <div className="editor-flow-copy">
        <Typography.Text className="eyebrow">{t('Writing workspace')}</Typography.Text>
        <Typography.Title level={2}>{t('Article Editor')}</Typography.Title>
        <Typography.Paragraph>{t('Write and edit your article. Your draft is saved in this browser.')}</Typography.Paragraph>
      </div>
      <div className="editor-flow-actions">
        <Button type="text" className="editor-back-home-button" icon={<ArrowLeftOutlined />} onClick={onBackHome}>{t('Back')}</Button>
        <Button className="editor-gemini-button" icon={<RobotOutlined />} onClick={onAskGemini}>{t('Ask Gemini')}</Button>
        <Tooltip title={t(focusMode ? 'Exit focus mode' : 'Focus mode')}>
          <Button className="editor-focus-toggle" type={focusMode ? 'primary' : 'default'} icon={focusMode ? <FullscreenExitOutlined /> : <FullscreenOutlined />} aria-label={t(focusMode ? 'Exit focus mode' : 'Focus mode')} aria-pressed={focusMode} onClick={onToggleFocus} />
        </Tooltip>
      </div>
    </div>
  )
}

