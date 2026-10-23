export function notifyAppError(message, title = 'Something went wrong') {
  const detail = {
    title: String(title || 'Something went wrong').slice(0, 100),
    message: String(message || 'An unexpected error occurred.').slice(0, 400),
  }
  window.dispatchEvent(new CustomEvent('jeyamohan:app-error', { detail }))
}
