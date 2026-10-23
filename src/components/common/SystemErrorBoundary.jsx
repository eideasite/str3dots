import { Component } from 'react'
import { notifyAppError } from '../../services/errorNotifications.js'

export default class SystemErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    notifyAppError(error?.message || 'This screen could not be displayed.')
  }

  render() {
    if (this.state.hasError) {
      return <main className="system-error-fallback" role="alert">
        <h1>Something went wrong</h1>
        <p>The page encountered an error. Your saved browser data is unchanged.</p>
        <button type="button" className="system-error-retry" onClick={() => this.setState({ hasError: false })}>Try again</button>
      </main>
    }
    return this.props.children
  }
}
