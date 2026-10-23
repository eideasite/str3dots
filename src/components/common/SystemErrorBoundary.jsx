import { Component } from 'react'
import { notifyAppError } from '../../services/errorNotifications.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

function SystemErrorFallback({ onRetry }) {
  const { t } = useLanguage()
  return <main className="system-error-fallback" role="alert">
    <h1>{t('Something went wrong')}</h1>
    <p>{t('The page encountered an error. Your saved browser data is unchanged.')}</p>
    <button type="button" className="system-error-retry" onClick={onRetry}>{t('Try again')}</button>
  </main>
}

export default class SystemErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    notifyAppError(error?.message || 'This screen could not be displayed.')
  }

  render() {
    if (this.state.hasError) return <SystemErrorFallback onRetry={() => this.setState({ hasError: false })} />
    return this.props.children
  }
}
