export function formatDate(value, options = { dateStyle: 'short' }, locale = 'ta-LK') {
  if (!value || Number.isNaN(new Date(value).getTime())) return '—'
  return new Intl.DateTimeFormat(locale, options).format(new Date(value))
}
