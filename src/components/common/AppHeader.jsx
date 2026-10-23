import { Button, Dropdown, Input, Layout, message, Modal, Select, Switch, Tooltip, Typography } from 'antd'
import { DownOutlined, GlobalOutlined, LockOutlined, LogoutOutlined, MenuOutlined, MoonOutlined, SettingOutlined, SunOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext.jsx'
import AccessibilitySettings from './AccessibilitySettings.jsx'
import ProfileAvatar from './ProfileAvatar.jsx'

const { Header } = Layout

export default function AppHeader({ onOpenMenu, themeMode, onThemeChange, language, onLanguageChange, profile, onNavigate, onLock, onSignOut }) {
  const isDark = themeMode === 'dark'
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [searchPromptOpen, setSearchPromptOpen] = useState(false)
  const submitSearch = (value) => {
    const query = (typeof value === 'string' ? value : searchQuery).trim()
    if (!query) {
      message.warning({ content: t('Enter a search query'), key: 'google-search-empty' })
      return
    }
    if (searchPromptOpen) return
    setSubmittedSearch(query)
    setSearchPromptOpen(true)
  }
  const googleAIUrl = new URL('https://www.google.com/ai')
  const googleSearchUrl = new URL('https://www.google.com/search')
  if (submittedSearch) {
    googleAIUrl.searchParams.set('q', submittedSearch)
    googleSearchUrl.searchParams.set('q', submittedSearch)
  }
  const accountMenu = {
    items: [
      { key: 'account-settings', icon: <SettingOutlined />, label: t('Change account settings') },
      { type: 'divider' },
      { key: 'lock', icon: <LockOutlined />, label: t('Lock') },
      { key: 'sign-out', icon: <LogoutOutlined />, label: t('Sign out'), danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'account-settings') onNavigate('profile')
      if (key === 'lock') onLock()
      if (key === 'sign-out') onSignOut()
    },
  }
  return (
    <Header className="app-header">
      <div className="mobile-brand"><Button type="text" aria-label={t('Open navigation')} icon={<MenuOutlined />} onClick={onOpenMenu} /><span className="brand-mark">{'\u0b9c\u0bc6'}</span><strong>Jeyamohan Articles</strong></div>
      <form className="google-ai-search" role="search" aria-label={t('Search Google AI')} onSubmit={(event) => { event.preventDefault(); submitSearch(searchQuery) }}>
        <Input className="google-ai-search-input" aria-label={t('Search Google AI')} placeholder={t('Search Google AI')} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
        <Button className="google-ai-search-submit" htmlType="submit"><span className="google-ai-mark" aria-hidden="true">G</span>{t('Google AI')}</Button>
      </form>
      <div className="header-tools">
        <Typography.Text className="header-note">{t('Personal writing space')}</Typography.Text>
        <AccessibilitySettings themeMode={themeMode} onThemeChange={onThemeChange} />
        <Select
          className="language-select"
          aria-label={t('Choose language')}
          value={language}
          onChange={onLanguageChange}
          options={[{ value: 'ta', label: 'தமிழ்' }, { value: 'en', label: 'English' }]}
          suffixIcon={<GlobalOutlined />}
          popupMatchSelectWidth={false}
        />
        <Tooltip title={t(isDark ? 'Switch to light mode' : 'Switch to night mode')}>
          <Switch
            className="theme-mode-switch"
            checked={isDark}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            aria-label={t(isDark ? 'Switch to light mode' : 'Switch to night mode')}
            onChange={onThemeChange}
          />
        </Tooltip>
        <Dropdown menu={accountMenu} trigger={['click']} placement="bottomRight">
          <Button className="account-menu-trigger" type="text" aria-label={t('Open account menu')}>
            <ProfileAvatar profile={profile} size={32} className="account-menu-avatar" /><DownOutlined />
          </Button>
        </Dropdown>
      </div>
      <Modal
        className="google-ai-personal-intelligence"
        title={t('Open Google AI')}
        open={searchPromptOpen}
        onCancel={() => setSearchPromptOpen(false)}
        footer={null}
        centered
        width={480}
        destroyOnHidden
      >
        <p className="google-ai-personal-copy">
          {t('Only your submitted search text is sent. Google AI opens in a new tab. If no tab opens, use Google Search in this tab. Article drafts and saved content are not included.')}
        </p>
        <div className="google-ai-personal-actions">
          <Button onClick={() => setSearchPromptOpen(false)}>{t('Cancel')}</Button>
          <Button className="google-ai-fallback" href={googleSearchUrl.toString()}>{t('Fallback: Open Google Search in this tab')}</Button>
          <Button className="google-ai-continue" type="primary" href={googleAIUrl.toString()} target="_blank" rel="noopener noreferrer">{t('Open Google AI in a new tab')}</Button>
        </div>
      </Modal>
    </Header>
  )
}
