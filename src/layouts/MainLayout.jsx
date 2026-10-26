import { useState } from 'react'
import { Alert, Button, Drawer, Layout, Menu, Popover, Typography } from 'antd'
import { InboxOutlined, BookOutlined, CloseOutlined, FileTextOutlined, InfoCircleOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons'
import AppHeader from '../components/common/AppHeader.jsx'
import { GeminiMark } from '../components/common/AiBrandIcons.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import { useConnectivityStatus } from '../hooks/useConnectivityStatus.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import ConversationFeedback from '../components/common/ConversationFeedback.jsx'

const { Content } = Layout
const navItems = [
  { key: 'compose', icon: <FileTextOutlined />, label: 'Write a Post' },
  { key: 'editor', icon: <FileTextOutlined />, label: 'Article Editor' },
  { key: 'seo', icon: <SettingOutlined />, label: 'SEO Settings' },
  { key: 'published', icon: <FileTextOutlined />, label: 'Published Post' },
  { key: 'articles', icon: <FileTextOutlined />, label: 'Articles Management' },
  { key: 'bookmarks', icon: <BookOutlined />, label: 'Bookmarks' },
  { key: 'archive', icon: <InboxOutlined />, label: 'Archive' },
  { key: 'external-ai-tools', icon: <GeminiMark />, label: 'External AI tools' },
]

export default function MainLayout({ page, focusMode = false, onNavigate, saveStatus, workspaceRecoveryState, onDownloadRecoveryCopy, themeMode, onThemeChange, language, onLanguageChange, profile, onLock, onSignOut, children }) {
  const { t } = useLanguage()
  const { online, showRestored, checkConnection, checkResult, networkEstimate, liveSpeedTest, refreshingEstimate, refreshNetworkEstimate } = useConnectivityStatus()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [networkStatusDismissed, setNetworkStatusDismissed] = useState(false)
  const estimateType = {
    'slow-2g': t('Very slow (slow 2G estimate)'),
    '2g': t('Slow (2G estimate)'),
    '3g': t('Moderate (3G estimate)'),
    '4g': t('Faster (4G-class estimate)'),
  }[networkEstimate.effectiveType]
  const isSlowConnection = ['slow-2g', '2g', '3g'].includes(networkEstimate.effectiveType)
  const networkDetails = [
    estimateType ? { kind: 'connection', label: estimateType } : null,
    networkEstimate.downlink ? { kind: 'downlink', label: `${t('Estimated downlink')} ${networkEstimate.downlink} Mbps` } : null,
    networkEstimate.rtt ? { kind: 'latency', label: `${t('Estimated latency')} ${networkEstimate.rtt} ms` } : null,
  ].filter(Boolean)
  const liveTestMetrics = liveSpeedTest?.status === 'success' ? [
    { kind: 'downlink', label: `${t('Download speed')} ${liveSpeedTest.downloadMbps} Mbps` },
    { kind: 'latency', label: `${t('Latency to test server')} ${liveSpeedTest.latencyMs} ms` },
  ] : []
  const networkStatusSummary = liveSpeedTest?.status === 'success'
    ? t('Live speed test result')
    : liveSpeedTest?.status === 'running'
      ? t('Testing connection...')
      : liveSpeedTest?.status === 'error'
        ? t('Live speed test unavailable')
        : estimateType || t('Network speed estimate unavailable')
  const networkInfoContent = (
    <div className="network-estimate-info">
      {liveSpeedTest?.status === 'error' && (
        <Typography.Text type="warning">{t(liveSpeedTest.message)}</Typography.Text>
      )}
      {liveSpeedTest?.status === 'success'
        ? <span className="network-estimate-metrics">{liveTestMetrics.map(({ kind, label }) => <span key={kind} className={`network-estimate-pill network-estimate-pill-${kind}`}>{label}</span>)}</span>
        : networkDetails.length
          ? <span className="network-estimate-metrics">{networkDetails.map(({ kind, label }) => <span key={kind} className={`network-estimate-pill network-estimate-pill-${kind}`}>{label}</span>)}</span>
          : t('Browser network estimate unavailable.')}
      <Typography.Text type="secondary">
        {liveSpeedTest?.status === 'running'
          ? t('Measuring latency and download speed from Cloudflare. No article text is sent.')
          : liveSpeedTest?.status === 'success'
            ? t('Measured from Cloudflare; a 2 MB sample was downloaded. No article text is sent.')
            : t('Approximate browser estimate. Run a live test using Cloudflare; up to 2 MB is downloaded. No article text is sent.')}
      </Typography.Text>
    </div>
  )
  const selectPage = (key) => {
    onNavigate(key)
    setMobileNavOpen(false)
  }
  const profileBrand = <button type="button" className="sider-brand" aria-label={t('Open profile')} aria-current={page === 'profile' ? 'page' : undefined} onClick={() => { onNavigate('profile'); setMobileNavOpen(false) }}><span className="brand-mark">ஜெ</span><span className="sider-brand-copy"><strong>Jeyamohan</strong><Typography.Text type="secondary">{t('Articles')}</Typography.Text></span></button>
  const menu = <Menu mode="inline" selectedKeys={[page === 'published' ? 'articles' : page]} items={navItems.map((item) => ({ ...item, label: t(item.label) }))} onClick={({ key }) => selectPage(key)} />
  const saveMessage = saveStatus === 'conflict'
    ? t('Another tab changed this workspace. Saving here is paused to protect its newer data.')
    : saveStatus === 'error' ? t('Could not save') : saveStatus === 'saving' ? <LoadingState message={t('Saving draft...')} /> : t('Saved in this browser')
  return (
    <Layout className={`app-layout${focusMode ? ' app-layout-focus' : ''}`}>
      <Layout className="app-main-layout">
        <AppHeader onOpenMenu={() => setMobileNavOpen(true)} themeMode={themeMode} onThemeChange={onThemeChange} language={language} onLanguageChange={onLanguageChange} profile={profile} onNavigate={onNavigate} onLock={onLock} onSignOut={onSignOut} />
        <Content className="app-content">
          {workspaceRecoveryState === 'saved' && <Alert className="workspace-recovery-notice" type="warning" showIcon message={t('A recovery copy of damaged workspace data was preserved in this browser.')} description={t('The app loaded a safe working copy. Download the recovery copy before reviewing or clearing browser data.')} action={<Button onClick={onDownloadRecoveryCopy}>{t('Download recovery copy')}</Button>} />}
          {workspaceRecoveryState === 'blocked' && <Alert className="workspace-recovery-notice" type="error" showIcon message={t('Workspace data could not be saved safely.')} description={t('A recovery copy could not be stored in this browser. Download the original workspace data and do not clear browser data.')} action={<Button onClick={onDownloadRecoveryCopy}>{t('Download recovery data')}</Button>} />}
          {saveStatus === 'conflict' && <Alert className="workspace-recovery-notice" type="warning" showIcon message={t('Another tab changed this workspace.')} description={t('Saving in this tab is paused to protect the newer data. Copy any unsaved text before reloading this page.')} />}
          {!online && <Alert
            className="connectivity-status connectivity-offline"
            banner
            showIcon
            type="warning"
            role="status"
            message={t('You appear to be offline.')}
            description={<div className="connectivity-action-row">
              <span>
                {t('You can keep editing local content. Internet-dependent actions may fail; browser storage determines whether changes save successfully.')}
                {checkResult && <><br /><strong>{t(checkResult)}</strong></>}
              </span>
              <Button className="connectivity-check-button" icon={<ReloadOutlined />} onClick={checkConnection}>{t('Check connection')}</Button>
            </div>}
          />}
          {online && !networkStatusDismissed && <Alert
            className={`connectivity-status network-estimate-status network-estimate-compact${isSlowConnection ? ' network-estimate-slow' : ''}`}
            banner
            showIcon={false}
            type={isSlowConnection ? 'warning' : 'info'}
            role="status"
            message={<div className="network-estimate-compact-row">
              <div className="network-estimate-compact-copy">
                <Typography.Text strong>{t('Network status')}</Typography.Text>
                <Typography.Text type="secondary">{networkStatusSummary}</Typography.Text>
                <Popover content={networkInfoContent} title={t('Network details')} trigger="click" placement="bottomRight" overlayClassName="network-estimate-popover">
                  <Button className="network-estimate-info-button" type="text" icon={<InfoCircleOutlined />} aria-label={t('Network details')} />
                </Popover>
              </div>
              <Button className="connectivity-check-button" size="small" icon={<ReloadOutlined />} loading={refreshingEstimate} disabled={refreshingEstimate} onClick={refreshNetworkEstimate}>{t(refreshingEstimate ? 'Testing connection...' : 'Run speed test')}</Button>
              <Button className="network-estimate-close-button" type="text" icon={<CloseOutlined />} aria-label={t('Close network status')} onClick={() => setNetworkStatusDismissed(true)} />
            </div>}
          />}
          {online && showRestored && <Alert className="connectivity-status connectivity-restored" banner showIcon type="success" role="status" message={t('The browser reports that a connection is available again.')} description={t('This does not confirm that every online service is reachable.')} />}
          {children}
          <ConversationFeedback />
          <footer className="app-footer">
            <span>© {new Date().getFullYear()} Jeyamohan. {t('All rights reserved.')}</span>
            <span>
              {t('Contact:')}{' '}
              <a href="mailto:jeyamohan98@gmail.com">jeyamohan98@gmail.com</a>
            </span>
          </footer>
        </Content>
      </Layout>
      <Drawer title="Jeyamohan Articles" open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} placement="left" width={280}>
        <div className="app-drawer-navigation">
          {profileBrand}
          {menu}
          <div className={`sider-note sider-note-${saveStatus}`} role="status">
            <span className={`storage-indicator ${saveStatus}`} />
            {saveMessage}
          </div>
        </div>
      </Drawer>
    </Layout>
  )
}
