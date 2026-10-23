import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { hasWorkspaceWriteConflict, saveWorkspace } from '../services/articleStorage.js'

export function useDraft(workspace) {
  // The initial workspace is also persisted by the debounced effect below.
  // Keep the indicator honest until that first write succeeds.
  const [saveStatus, setSaveStatus] = useState('saving')
  const latestWorkspace = useRef(workspace)

  useLayoutEffect(() => {
    latestWorkspace.current = workspace
  }, [workspace])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = saveWorkspace(workspace)
      setSaveStatus(saved ? 'saved' : hasWorkspaceWriteConflict() ? 'conflict' : 'error')
    }, 350)
    return () => window.clearTimeout(timer)
  }, [workspace])

  useEffect(() => {
    const flushPendingSave = () => {
      saveWorkspace(latestWorkspace.current)
    }
    window.addEventListener('pagehide', flushPendingSave)
    return () => window.removeEventListener('pagehide', flushPendingSave)
  }, [])

  const saveNow = () => {
    const saved = saveWorkspace(latestWorkspace.current)
    setSaveStatus(saved ? 'saved' : hasWorkspaceWriteConflict() ? 'conflict' : 'error')
    return saved
  }
  return { saveStatus, setSaveStatus, saveNow }
}

