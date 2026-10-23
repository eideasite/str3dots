import { useEffect, useState } from 'react'
import { Button, Input, Modal, Radio, Select, Slider, Space, Switch, Tooltip, Typography } from 'antd'
import { ArrowLeftOutlined, AudioOutlined, BoldOutlined, BulbOutlined, EyeOutlined, FontSizeOutlined, HistoryOutlined, InfoCircleOutlined, MinusOutlined, PlusOutlined, RightOutlined, SettingOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import { useLanguage } from '../../context/LanguageContext.jsx'

const STORAGE_KEY = 'jeyamohan-articles-accessibility-v1'
const FONT_SCALES = [0.9, 0.95, 1, 1.1, 1.2]
const DISPLAY_SCALES = [0.9, 0.95, 1, 1.05, 1.1]
const DEFAULT_SETTINGS = { fontSize: 2, displaySize: 2, boldText: false, outlineText: false, accessibilityMenuShortcut: false, colourCorrection: 'off', colourInversion: false, reduceBlur: false, reduceMotion: false, darkModeType: 'standard', pureBlack: false, timing: 'off', startTime: '22:00', endTime: '06:00' }
const SPEECH_STORAGE_KEY = 'jeyamohan-articles-speech-v1'
const DEFAULT_SPEECH_SETTINGS = { voice: '', language: '', rate: 1, pitch: 1 }

function systemPrefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

function loadSpeechSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SPEECH_STORAGE_KEY) || 'null')
    return { ...DEFAULT_SPEECH_SETTINGS, ...(saved && typeof saved === 'object' ? saved : {}), rate: Number.isFinite(saved?.rate) ? Math.max(0.5, Math.min(2, saved.rate)) : 1, pitch: Number.isFinite(saved?.pitch) ? Math.max(0.5, Math.min(2, saved.pitch)) : 1 }
  } catch {
    return DEFAULT_SPEECH_SETTINGS
  }
}

function isWithinSchedule(startTime, endTime, now = new Date()) {
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }
  const start = toMinutes(startTime)
  const end = toMinutes(endTime)
  const current = now.getHours() * 60 + now.getMinutes()
  if (start === end) return false
  return start < end ? current >= start && current < end : current >= start || current < end
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!saved || typeof saved !== 'object') return { ...DEFAULT_SETTINGS, reduceMotion: systemPrefersReducedMotion() }
    return {
      fontSize: Number.isInteger(saved.fontSize) ? Math.max(0, Math.min(FONT_SCALES.length - 1, saved.fontSize)) : DEFAULT_SETTINGS.fontSize,
      displaySize: Number.isInteger(saved.displaySize) ? Math.max(0, Math.min(DISPLAY_SCALES.length - 1, saved.displaySize)) : DEFAULT_SETTINGS.displaySize,
      boldText: saved.boldText === true,
      outlineText: saved.outlineText === true,
      accessibilityMenuShortcut: saved.accessibilityMenuShortcut === true,
      colourCorrection: ['off', 'grayscale', 'reduced-saturation'].includes(saved.colourCorrection) ? saved.colourCorrection : DEFAULT_SETTINGS.colourCorrection,
      colourInversion: saved.colourInversion === true,
      reduceBlur: saved.reduceBlur === true,
      reduceMotion: typeof saved.reduceMotion === 'boolean' ? saved.reduceMotion : systemPrefersReducedMotion(),
      darkModeType: saved.darkModeType === 'expanded' ? 'expanded' : 'standard',
      pureBlack: saved.pureBlack === true,
      timing: saved.timing === 'schedule' ? 'schedule' : 'off',
      startTime: typeof saved.startTime === 'string' && /^\d{2}:\d{2}$/.test(saved.startTime) ? saved.startTime : DEFAULT_SETTINGS.startTime,
      endTime: typeof saved.endTime === 'string' && /^\d{2}:\d{2}$/.test(saved.endTime) ? saved.endTime : DEFAULT_SETTINGS.endTime,
    }
  } catch {
    return { ...DEFAULT_SETTINGS, reduceMotion: systemPrefersReducedMotion() }
  }
}

export default function AccessibilitySettings({ themeMode, onThemeChange }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState('main')
  const [systemModesInfoOpen, setSystemModesInfoOpen] = useState(false)
  const [appInfoOpen, setAppInfoOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [speechSettings, setSpeechSettings] = useState(loadSpeechSettings)
  const [speechVoices, setSpeechVoices] = useState([])
  const [settings, setSettings] = useState(loadSettings)
  const [settingsSaveStatus, setSettingsSaveStatus] = useState('idle')
  const matchesQuery = (...values) => {
    const query = searchQuery.trim().toLocaleLowerCase()
    return !query || values.some((value) => value.toLocaleLowerCase().includes(query) || t(value).toLocaleLowerCase().includes(query))
  }
  const hasSearchResults = [
    ['Speech and text', 'Text-to-speech', 'Browser speech options', 'Text formatting options', 'Bold and outline text'],
    ['Display', 'Outline text', 'Bold text', 'Display size & text'],
    ['Color contrast', 'Outline text', 'Display > Color contrast'],
    ['Accessibility', 'Text-to-speech output', 'Accessibility Menu', 'Colour and motion'],
  ].some((values) => matchesQuery(...values))

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--app-font-scale', String(FONT_SCALES[settings.fontSize]))
    root.style.setProperty('--app-display-scale', String(DISPLAY_SCALES[settings.displaySize]))
    root.dataset.boldText = String(settings.boldText)
    root.dataset.outlineText = String(settings.outlineText)
    root.dataset.darkMode = settings.darkModeType
    root.dataset.pureBlack = String(settings.pureBlack)
    root.dataset.colourCorrection = settings.colourCorrection
    root.dataset.colourInversion = String(settings.colourInversion)
    root.dataset.reduceBlur = String(settings.reduceBlur)
    root.dataset.reduceMotion = String(settings.reduceMotion)
  }, [settings])

  useEffect(() => {
    if (settings.timing !== 'schedule') return undefined
    const applySchedule = () => onThemeChange(isWithinSchedule(settings.startTime, settings.endTime))
    applySchedule()
    const timer = window.setInterval(applySchedule, 60_000)
    return () => window.clearInterval(timer)
  }, [onThemeChange, settings.endTime, settings.startTime, settings.timing])

  useEffect(() => {
    if (!settings.accessibilityMenuShortcut) return undefined
    const handleShortcut = (event) => {
      if (event.altKey && event.shiftKey && event.code === 'KeyA') {
        event.preventDefault()
        setPage('accessibility-menu')
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [settings.accessibilityMenuShortcut])

  const applySettings = (nextSettings) => {
    setSettings(nextSettings)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings))
      setSettingsSaveStatus('saved')
    } catch {
      setSettingsSaveStatus('error')
    }
  }
  const updateSettings = (patch) => applySettings({ ...settings, ...patch })
  const reset = () => {
    applySettings({ ...DEFAULT_SETTINGS })
    setSpeechSettings({ ...DEFAULT_SPEECH_SETTINGS })
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    onThemeChange(false)
  }
  const openAccessibilityMenu = () => { setPage('accessibility-menu'); setOpen(true) }
  const menuAction = (label, icon, action) => <Button className="accessibility-menu-action" key={label} onClick={action} icon={icon}>{t(label)}</Button>
  const changeLevel = (key, delta, max) => updateSettings({ [key]: Math.max(0, Math.min(max, settings[key] + delta)) })
  const returnToSettings = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    setPage('main')
  }
  const handleModalClose = () => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    if (page === 'main') setOpen(false)
    else setPage('main')
  }
  const speakSample = () => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(t('This is a sample of text to speech.'))
    const selectedVoice = speechVoices.find((voice) => voice.voiceURI === speechSettings.voice)
    utterance.voice = selectedVoice || null
    utterance.lang = speechSettings.language || selectedVoice?.lang || document.documentElement.lang || 'en-US'
    utterance.rate = speechSettings.rate
    utterance.pitch = speechSettings.pitch
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (page !== 'text-to-speech' || !open) window.speechSynthesis?.cancel()
  }, [open, page])

  useEffect(() => {
    try { localStorage.setItem(SPEECH_STORAGE_KEY, JSON.stringify(speechSettings)) } catch { /* Preferences remain active for this session. */ }
  }, [speechSettings])

  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined
    const updateVoices = () => setSpeechVoices(window.speechSynthesis.getVoices())
    updateVoices()
    window.speechSynthesis.addEventListener?.('voiceschanged', updateVoices)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', updateVoices)
  }, [])

  const renderSlider = (label, description, key, max) => (
    <section className="accessibility-setting-card">
      <div className="accessibility-setting-copy"><Typography.Title level={5}>{t(label)}</Typography.Title><Typography.Text type="secondary">{t(description)}</Typography.Text></div>
      <div className="accessibility-slider-row">
        <Button type="text" aria-label={`${t('Decrease')} ${t(label)}`} disabled={settings[key] === 0} icon={<MinusOutlined />} onClick={() => changeLevel(key, -1, max)} />
        <Slider aria-label={t(label)} min={0} max={max} step={1} value={settings[key]} tooltip={{ formatter: () => `${Math.round((key === 'fontSize' ? FONT_SCALES : DISPLAY_SCALES)[settings[key]] * 100)}%` }} onChange={(value) => updateSettings({ [key]: value })} />
        <Button type="text" aria-label={`${t('Increase')} ${t(label)}`} disabled={settings[key] === max} icon={<PlusOutlined />} onClick={() => changeLevel(key, 1, max)} />
      </div>
    </section>
  )

  return <>
    <Tooltip title={t('Accessibility settings')}>
      <Button className="accessibility-settings-trigger" type="text" aria-label={t('Accessibility settings')} icon={<EyeOutlined />} onClick={() => setOpen(true)} />
    </Tooltip>
    {settings.accessibilityMenuShortcut && <Button className="accessibility-menu-shortcut" type="primary" aria-label={t('Open Accessibility Menu')} aria-keyshortcuts="Alt+Shift+A" title={`${t('Open Accessibility Menu')} (Alt+Shift+A)`} icon={<EyeOutlined />} onClick={openAccessibilityMenu} />}
    <Modal className="accessibility-settings-modal" title={page === 'main' ? t('Accessibility settings') : <Space><Button className="highlight-back-button" type="text" aria-label={t('Back')} icon={<ArrowLeftOutlined />} onClick={returnToSettings} /><span>{t(page === 'accessibility-menu' ? 'Accessibility Menu' : page === 'colour-motion' ? 'Colour and motion' : page === 'dark-theme' ? 'Dark theme' : page === 'text-formatting' ? 'Text formatting options' : 'Text-to-speech')}</span></Space>} open={open} onCancel={handleModalClose} footer={null} width={560} destroyOnHidden>
      {page === 'main' ? <>
        <Input.Search className="accessibility-settings-search" aria-label={t('Search accessibility settings')} placeholder={t('Search accessibility settings')} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} allowClear />
        {searchQuery.trim() ? <div className="accessibility-search-results">
          {matchesQuery('Speech and text', 'Text-to-speech', 'Browser speech options', 'Text formatting options', 'Bold and outline text') && <>
          <Typography.Title className="accessibility-section-title" level={5}>{t('Speech and text')}</Typography.Title>
          <div className="accessibility-result-group">
            {matchesQuery('Speech and text', 'Text-to-speech', 'Browser speech options') && <button className="accessibility-result-row" type="button" onClick={() => setPage('text-to-speech')}><span>{t('Text-to-speech')}<small>{t('Browser speech options')}</small></span><RightOutlined /></button>}
            {matchesQuery('Speech and text', 'Text formatting options', 'Bold and outline text') && <button className="accessibility-result-row" type="button" onClick={() => setPage('text-formatting')}><span>{t('Text formatting options')}<small>{t('Bold and outline text')}</small></span><RightOutlined /></button>}
          </div>
          </>}
          {matchesQuery('Display', 'Outline text', 'Bold text', 'Display size & text') && <>
          <Typography.Title className="accessibility-section-title" level={5}>{t('Display')}</Typography.Title>
          <div className="accessibility-result-group">
            {matchesQuery('Display', 'Outline text', 'Display size & text') && <button className="accessibility-result-row" type="button" onClick={() => setPage('text-formatting')}><span>{t('Outline text')}<small>{t('Display size & text')}</small></span><RightOutlined /></button>}
            {matchesQuery('Display', 'Bold text', 'Display size & text') && <button className="accessibility-result-row" type="button" onClick={() => setPage('text-formatting')}><span>{t('Bold text')}<small>{t('Display size & text')}</small></span><RightOutlined /></button>}
          </div>
          </>}
          {matchesQuery('Color contrast', 'Outline text', 'Display > Color contrast') && <>
          <Typography.Title className="accessibility-section-title" level={5}>{t('Color contrast')}</Typography.Title>
          <div className="accessibility-result-group"><button className="accessibility-result-row" type="button" onClick={() => setPage('text-formatting')}><span>{t('Outline text')}<small>{t('Display > Color contrast')}</small></span><RightOutlined /></button></div>
          </>}
          {matchesQuery('Accessibility', 'Text-to-speech output', 'Accessibility Menu', 'Colour and motion') && <>
          <Typography.Title className="accessibility-section-title" level={5}>{t('Accessibility')}</Typography.Title>
          <div className="accessibility-result-group">
            {matchesQuery('Accessibility', 'Text-to-speech output') && <button className="accessibility-result-row" type="button" onClick={() => setPage('text-to-speech')}><span>{t('Text-to-speech output')}<small>{t('Accessibility')}</small></span><RightOutlined /></button>}
            {matchesQuery('Accessibility Menu', 'Accessibility') && <button className="accessibility-result-row" type="button" onClick={() => setPage('accessibility-menu')}><span>{t('Accessibility Menu')}<small>{t('Quickly open accessibility controls for this app.')}</small></span><RightOutlined /></button>}
            {matchesQuery('Colour and motion', 'Accessibility') && <button className="accessibility-result-row" type="button" onClick={() => setPage('colour-motion')}><span>{t('Colour and motion')}<small>{t('Adjust colour, blur, and movement in this app.')}</small></span><RightOutlined /></button>}
          </div>
          </>}
          {!hasSearchResults && <Typography.Text type="secondary">{t('No matching accessibility settings.')}</Typography.Text>}
        </div> : <>
        <Button className="dark-theme-settings-link" onClick={() => setPage('dark-theme')}>
          <span><Typography.Text strong>{t('Dark theme')}</Typography.Text><Typography.Text type="secondary">{t('Use a dark background for comfortable viewing.')}</Typography.Text></span><RightOutlined />
        </Button>
        <Button className="dark-theme-settings-link" onClick={() => setPage('accessibility-menu')}>
          <span><Typography.Text strong>{t('Accessibility Menu')}</Typography.Text><Typography.Text type="secondary">{t('Quickly open accessibility controls for this app.')}</Typography.Text></span><RightOutlined />
        </Button>
        <Button className="dark-theme-settings-link" onClick={() => setPage('colour-motion')}>
          <span><Typography.Text strong>{t('Colour and motion')}</Typography.Text><Typography.Text type="secondary">{t('Adjust colour, blur, and movement in this app.')}</Typography.Text></span><RightOutlined />
        </Button>
        <Typography.Title className="accessibility-section-title" level={5}>{t('Size options')}</Typography.Title>
        {renderSlider('Font size', 'Make text bigger or smaller', 'fontSize', FONT_SCALES.length - 1)}
        {renderSlider('Display size', 'Make everything bigger or smaller', 'displaySize', DISPLAY_SCALES.length - 1)}
        <Typography.Title className="accessibility-section-title" level={5}>{t('Style options')}</Typography.Title>
        <section className="accessibility-setting-card accessibility-toggle-card"><Typography.Text strong>{t('Bold text')}</Typography.Text><Switch checked={settings.boldText} aria-label={t('Bold text')} onChange={(boldText) => updateSettings({ boldText })} /></section>
        <section className="accessibility-setting-card accessibility-toggle-card"><div className="accessibility-setting-copy"><Typography.Text strong>{t('Outline text')}</Typography.Text><Typography.Text type="secondary">{t('Outline is applied to article and primary reading text.')}</Typography.Text></div><Switch checked={settings.outlineText} aria-label={t('Outline text')} onChange={(outlineText) => updateSettings({ outlineText })} /></section>
        <Button className="accessibility-reset-button" icon={<HistoryOutlined />} onClick={reset}>{t('Reset settings')}</Button>
        </>}
      </> : page === 'colour-motion' ? <div className="colour-motion-page">
        <Typography.Title level={4}>{t('Colour and motion')}</Typography.Title>
        <section className="accessibility-setting-card colour-motion-select-card"><div className="accessibility-setting-copy"><Typography.Text strong>{t('Colour filter')}</Typography.Text><Typography.Text type="secondary">{t('Applies a colour filter to this website only.')}</Typography.Text></div><Select aria-label={t('Colour filter')} value={settings.colourCorrection} options={[{ value: 'off', label: t('Off') }, { value: 'grayscale', label: t('Grayscale') }, { value: 'reduced-saturation', label: t('Reduced saturation') }]} onChange={(colourCorrection) => updateSettings({ colourCorrection })} /></section>
        <section className="accessibility-setting-card accessibility-toggle-card"><div className="accessibility-setting-copy"><Typography.Text strong>{t('Colour inversion')}</Typography.Text><Typography.Text type="secondary">{t(settings.colourInversion ? 'On' : 'Off')}</Typography.Text></div><Switch checked={settings.colourInversion} aria-label={t('Colour inversion')} onChange={(colourInversion) => updateSettings({ colourInversion })} /></section>
        <Button className="dark-theme-settings-link" onClick={() => setPage('dark-theme')}><span><Typography.Text strong>{t('Dark theme')}</Typography.Text><Typography.Text type="secondary">{t('Change the theme manually.')}</Typography.Text></span><RightOutlined /></Button>
        <section className="accessibility-setting-card accessibility-toggle-card"><div className="accessibility-setting-copy"><Typography.Text strong>{t('Reduce blur effects')}</Typography.Text><Typography.Text type="secondary">{t('Make backgrounds and panels easier to see')}</Typography.Text></div><Switch checked={settings.reduceBlur} aria-label={t('Reduce blur effects')} onChange={(reduceBlur) => updateSettings({ reduceBlur })} /></section>
        <section className="accessibility-setting-card accessibility-toggle-card"><div className="accessibility-setting-copy"><Typography.Text strong>{t('Remove animations')}</Typography.Text><Typography.Text type="secondary">{t('Reduce movement on the screen')}</Typography.Text></div><Switch checked={settings.reduceMotion} aria-label={t('Remove animations')} onChange={(reduceMotion) => updateSettings({ reduceMotion })} /></section>
        <Typography.Text type="secondary" className="dark-theme-schedule-note"><InfoCircleOutlined /> {t('These preferences affect this website only; they do not change device accessibility settings.')}</Typography.Text>
      </div> : page === 'accessibility-menu' ? <div className="accessibility-menu-page">
        <Typography.Paragraph>{t('Use quick controls to adjust this app. Device controls such as volume, brightness, locking, and screenshots are not available to websites.')}</Typography.Paragraph>
        <div className="accessibility-menu-grid">
          {menuAction('Decrease text size', <MinusOutlined />, () => changeLevel('fontSize', -1, FONT_SCALES.length - 1))}
          {menuAction('Increase text size', <FontSizeOutlined />, () => changeLevel('fontSize', 1, FONT_SCALES.length - 1))}
          {menuAction('Zoom out', <ZoomOutOutlined />, () => changeLevel('displaySize', -1, DISPLAY_SCALES.length - 1))}
          {menuAction('Zoom in', <ZoomInOutlined />, () => changeLevel('displaySize', 1, DISPLAY_SCALES.length - 1))}
          {menuAction(settings.boldText ? 'Turn bold text off' : 'Turn bold text on', <BoldOutlined />, () => updateSettings({ boldText: !settings.boldText }))}
          {menuAction(themeMode === 'dark' ? 'Use light theme' : 'Use dark theme', <BulbOutlined />, () => onThemeChange(themeMode !== 'dark'))}
          {menuAction('Text-to-speech', <AudioOutlined />, () => setPage('text-to-speech'))}
          {menuAction('Colour and motion', <EyeOutlined />, () => setPage('colour-motion'))}
        </div>
        <Typography.Title className="accessibility-section-title" level={5}>{t('Options')}</Typography.Title>
        <section className="accessibility-setting-card accessibility-toggle-card"><div className="accessibility-setting-copy"><Typography.Text strong>{t('Accessibility Menu shortcut')}</Typography.Text><Typography.Text type="secondary">{t(settings.accessibilityMenuShortcut ? 'On' : 'Off')} · Alt+Shift+A</Typography.Text></div><Switch checked={settings.accessibilityMenuShortcut} aria-label={t('Accessibility Menu shortcut')} onChange={(accessibilityMenuShortcut) => updateSettings({ accessibilityMenuShortcut })} /></section>
        <Button className="dark-theme-settings-link" onClick={() => setPage('main')}><span><SettingOutlined /><Typography.Text strong>{t('Settings')}</Typography.Text></span><RightOutlined /></Button>
        <Button className="dark-theme-settings-link" onClick={() => setAppInfoOpen(true)}><span><Typography.Text strong>{t('App info')}</Typography.Text></span><RightOutlined /></Button>
      </div> : page === 'dark-theme' ? <div className="dark-theme-settings-page">
        <Typography.Paragraph>{t('Use a dark background to make this writing space more comfortable. Your theme is saved on this device.')}</Typography.Paragraph>
        <section className="dark-theme-toggle-card"><Typography.Text strong>{t('Use dark theme')}</Typography.Text><Switch checked={themeMode === 'dark'} aria-label={t('Use dark theme')} onChange={onThemeChange} /></section>
        <Typography.Title className="accessibility-section-title" level={5}>{t('Theme style')}</Typography.Title>
        <Radio.Group className="dark-theme-mode-options" value={settings.darkModeType} onChange={(event) => updateSettings({ darkModeType: event.target.value })}>
          <Radio value="standard"><span className="dark-theme-mode-copy"><Typography.Text strong>{t('Standard')}</Typography.Text><Typography.Text type="secondary">{t('Use the app dark theme as designed.')}</Typography.Text></span></Radio>
          <Radio value="expanded"><span className="dark-theme-mode-copy"><Typography.Text strong>{t('Expanded')}</Typography.Text><Typography.Text type="secondary">{t('Use stronger dark surfaces and contrast throughout this app.')}</Typography.Text></span></Radio>
        </Radio.Group>
        <section className="accessibility-setting-card accessibility-toggle-card"><div className="accessibility-setting-copy"><Typography.Text strong>{t('Pure black')}</Typography.Text><Typography.Text type="secondary">{t('Pure black background for dark theme')}</Typography.Text></div><Switch checked={settings.pureBlack} aria-label={t('Pure black')} disabled={themeMode !== 'dark'} onChange={(pureBlack) => updateSettings({ pureBlack })} /></section>
        <Typography.Title className="accessibility-section-title" level={5}>{t('Timing')}</Typography.Title>
        <Radio.Group className="dark-theme-timing-options" value={settings.timing} onChange={(event) => updateSettings({ timing: event.target.value })}>
          <Radio value="off"><span className="dark-theme-mode-copy"><Typography.Text strong>{t('Off')}</Typography.Text><Typography.Text type="secondary">{t('Change the theme manually.')}</Typography.Text></span></Radio>
          <Radio value="schedule"><span className="dark-theme-mode-copy"><Typography.Text strong>{t('Schedule')}</Typography.Text><Typography.Text type="secondary">{t('Turns on at custom time')}</Typography.Text></span></Radio>
        </Radio.Group>
        <section className="dark-theme-time-options">
          <label className="accessibility-setting-card"><span><Typography.Text strong>{t('Start time')}</Typography.Text><Typography.Text type="secondary">{settings.startTime}</Typography.Text></span><input aria-label={t('Start time')} type="time" value={settings.startTime} onChange={(event) => updateSettings({ startTime: event.target.value })} /></label>
          <label className="accessibility-setting-card"><span><Typography.Text strong>{t('End time')}</Typography.Text><Typography.Text type="secondary">{settings.endTime}</Typography.Text></span><input aria-label={t('End time')} type="time" value={settings.endTime} onChange={(event) => updateSettings({ endTime: event.target.value })} /></label>
        </section>
        <Typography.Text type="secondary" className="dark-theme-schedule-note"><InfoCircleOutlined /> {t('The schedule follows this device local time while this app is open.')}</Typography.Text>
        <div className="dark-theme-modes-info"><InfoCircleOutlined /><span>{t('Device modes can also turn on dark theme.')}</span><Button type="link" className="dark-theme-modes-link" onClick={() => setSystemModesInfoOpen(true)}>{t('About device modes')}</Button></div>
      </div> : page === 'text-formatting' ? <div className="text-format-settings-page">
        <section className="accessibility-setting-card accessibility-toggle-card"><div className="accessibility-setting-copy"><Typography.Text strong>{t('Outline text')}</Typography.Text><Typography.Text type="secondary">{t('Outline is applied to article and primary reading text.')}</Typography.Text></div><Switch checked={settings.outlineText} aria-label={t('Outline text')} onChange={(outlineText) => updateSettings({ outlineText })} /></section>
        <section className="accessibility-setting-card accessibility-toggle-card"><div className="accessibility-setting-copy"><Typography.Text strong>{t('Bold text')}</Typography.Text><Typography.Text type="secondary">{t('Make text easier to distinguish.')}</Typography.Text></div><Switch checked={settings.boldText} aria-label={t('Bold text')} onChange={(boldText) => updateSettings({ boldText })} /></section>
      </div> : <div className="text-to-speech-settings-page">
        <Typography.Title level={4}>{t('Text-to-speech output')}</Typography.Title>
        <Typography.Paragraph>{t('Speech uses voices available in this browser or device. TalkBack and system verbosity are managed in device settings.')}</Typography.Paragraph>
        {'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined' ? <>
          <section className="accessibility-setting-card speech-select-card"><Typography.Text strong>{t('Preferred voice')}</Typography.Text><Select aria-label={t('Preferred voice')} value={speechSettings.voice || undefined} placeholder={t('Use system voice')} options={speechVoices.map((voice) => ({ value: voice.voiceURI, label: `${voice.name} (${voice.lang})` }))} onChange={(voice) => setSpeechSettings((current) => ({ ...current, voice }))} allowClear /><Select aria-label={t('Language')} value={speechSettings.language || undefined} placeholder={t('Use system language')} options={[...new Set(speechVoices.map((voice) => voice.lang))].map((language) => ({ value: language, label: language }))} onChange={(language) => setSpeechSettings((current) => ({ ...current, language }))} allowClear /></section>
          <section className="accessibility-setting-card speech-slider-card"><Typography.Title level={5}>{t('Speech rate')}</Typography.Title><Typography.Text type="secondary">{t('Speed at which the text is spoken')}</Typography.Text><Slider aria-label={t('Speech rate')} min={0.5} max={2} step={0.1} value={speechSettings.rate} onChange={(rate) => setSpeechSettings((current) => ({ ...current, rate }))} /></section>
          <section className="accessibility-setting-card speech-slider-card"><Typography.Title level={5}>{t('Pitch')}</Typography.Title><Typography.Text type="secondary">{t('Affects the tone of the synthesized speech')}</Typography.Text><Slider aria-label={t('Pitch')} min={0.5} max={2} step={0.1} value={speechSettings.pitch} onChange={(pitch) => setSpeechSettings((current) => ({ ...current, pitch }))} /></section>
          <div className="speech-action-row"><Button className="speech-play-button" onClick={speakSample} disabled={speaking} aria-label={t('Play')}>{t(speaking ? 'Speaking...' : 'Play')}</Button><Button className="speech-reset-button" onClick={() => { window.speechSynthesis.cancel(); setSpeaking(false); setSpeechSettings(DEFAULT_SPEECH_SETTINGS) }} aria-label={t('Reset')}>{t('Reset')}</Button></div>
          {speaking && <Button onClick={() => { window.speechSynthesis.cancel(); setSpeaking(false) }}>{t('Stop')}</Button>}
        </> : <Typography.Text type="secondary">{t('Text-to-speech is not supported by this browser.')}</Typography.Text>}
      </div>}
      {page !== 'text-to-speech' && <Typography.Text className="accessibility-save-status" type={settingsSaveStatus === 'error' ? 'danger' : 'secondary'} role="status" aria-live="polite">{t(settingsSaveStatus === 'error' ? 'Preferences apply for this session but could not be saved.' : settingsSaveStatus === 'saved' ? 'Accessibility preferences saved in this browser.' : 'Changes apply immediately.')}</Typography.Text>}
    </Modal>
    <Modal title={t('About device modes')} open={systemModesInfoOpen} onCancel={() => setSystemModesInfoOpen(false)} onOk={() => setSystemModesInfoOpen(false)} okText={t('Close')} cancelButtonProps={{ style: { display: 'none' } }}>
      <Typography.Paragraph>{t('This website cannot read or change device modes. Its custom schedule follows this browser local time while the app is open.')}</Typography.Paragraph>
    </Modal>
    <Modal title={t('App info')} open={appInfoOpen} onCancel={() => setAppInfoOpen(false)} onOk={() => setAppInfoOpen(false)} okText={t('Close')} cancelButtonProps={{ style: { display: 'none' } }}>
      <Typography.Paragraph>{t('Accessibility Menu quick controls work inside this writing app only. Your preferences are saved in this browser.')}</Typography.Paragraph>
    </Modal>
  </>
}
