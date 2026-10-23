export const getDateLocale = (language) => language === 'ta' ? 'ta-LK' : 'en-US'

const dateFormatterCache = new Map()

export function formatDate(value, options = { dateStyle: 'short' }, locale = 'ta-LK') {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  try {
    const key = JSON.stringify([locale, options])
    let formatter = dateFormatterCache.get(key)
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(locale, options)
      dateFormatterCache.set(key, formatter)
    }
    return formatter.format(date)
  } catch {
    return '—'
  }
}
