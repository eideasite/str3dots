import { useEffect, useRef, useState } from 'react'
import { runNetworkSpeedTest } from '../services/networkSpeedTest.js'

function readBrowserOnlineState() {
  return typeof navigator === 'undefined' || navigator.onLine !== false
}

function readNetworkEstimate() {
  const connection = typeof navigator === 'undefined' ? null : navigator.connection
  if (!connection) return { supported: false, effectiveType: '', downlink: null, rtt: null, type: '' }
  return {
    supported: true,
    effectiveType: ['slow-2g', '2g', '3g', '4g'].includes(connection.effectiveType) ? connection.effectiveType : '',
    downlink: Number.isFinite(connection.downlink) && connection.downlink > 0 ? connection.downlink : null,
    rtt: Number.isFinite(connection.rtt) && connection.rtt > 0 ? connection.rtt : null,
    type: typeof connection.type === 'string' && connection.type !== 'unknown' ? connection.type : '',
  }
}

export function useConnectivityStatus() {
  const [online, setOnline] = useState(readBrowserOnlineState)
  const [showRestored, setShowRestored] = useState(false)
  const [checkResult, setCheckResult] = useState('')
  const [networkEstimate, setNetworkEstimate] = useState(readNetworkEstimate)
  const [liveSpeedTest, setLiveSpeedTest] = useState(null)
  const onlineRef = useRef(online)
  const restoreTimer = useRef(null)
  const refreshTimer = useRef(null)
  const refreshController = useRef(null)
  const [refreshingEstimate, setRefreshingEstimate] = useState(false)

  const checkConnection = () => {
    const browserReportsOnline = readBrowserOnlineState()
    setNetworkEstimate(readNetworkEstimate())
    onlineRef.current = browserReportsOnline
    setOnline(browserReportsOnline)
    setShowRestored(browserReportsOnline)
    setCheckResult(browserReportsOnline
      ? 'The browser reports a connection. Some online services may still be unavailable.'
      : 'The browser still reports no connection. Check your network, then try again.')
    window.clearTimeout(restoreTimer.current)
    if (browserReportsOnline) {
      restoreTimer.current = window.setTimeout(() => setShowRestored(false), 5000)
    }
    return browserReportsOnline
  }

  const updateNetworkEstimate = () => setNetworkEstimate(readNetworkEstimate())
  const refreshNetworkEstimate = async () => {
    if (refreshController.current) return
    const controller = new AbortController()
    refreshController.current = controller
    setRefreshingEstimate(true)
    setLiveSpeedTest({ status: 'running' })
    updateNetworkEstimate()
    refreshTimer.current = window.setTimeout(() => controller.abort(), 20_000)
    try {
      const result = await runNetworkSpeedTest(controller.signal)
      setLiveSpeedTest({ status: 'success', ...result })
    } catch {
      setLiveSpeedTest({ status: 'error', message: controller.signal.aborted
        ? 'The speed test timed out. Check your connection and try again.'
        : 'Could not reach the speed test source. Browser estimates are still available.' })
    } finally {
      window.clearTimeout(refreshTimer.current)
      refreshTimer.current = null
      refreshController.current = null
      setRefreshingEstimate(false)
    }
  }

  useEffect(() => {
    const handleOffline = () => {
      if (!onlineRef.current) return
      onlineRef.current = false
      setOnline(false)
      setShowRestored(false)
      setCheckResult('')
      setNetworkEstimate(readNetworkEstimate())
      window.clearTimeout(restoreTimer.current)
    }
    const handleOnline = () => {
      if (onlineRef.current) return
      onlineRef.current = true
      setOnline(true)
      setShowRestored(true)
      setCheckResult('')
      setNetworkEstimate(readNetworkEstimate())
      window.clearTimeout(restoreTimer.current)
      restoreTimer.current = window.setTimeout(() => setShowRestored(false), 5000)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    const connection = typeof navigator === 'undefined' ? null : navigator.connection
    connection?.addEventListener?.('change', updateNetworkEstimate)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      connection?.removeEventListener?.('change', updateNetworkEstimate)
      window.clearTimeout(restoreTimer.current)
      window.clearTimeout(refreshTimer.current)
      refreshController.current?.abort()
    }
  }, [])

  return { online, showRestored, checkConnection, checkResult, networkEstimate, liveSpeedTest, refreshingEstimate, refreshNetworkEstimate }
}
