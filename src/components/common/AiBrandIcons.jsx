import { useId } from 'react'

export function GeminiMark() {
  const gradientId = `gemini-gradient-${useId().replace(/:/g, '')}`

  return (
    <svg className="ai-brand-mark ai-brand-gemini" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f9ab00" />
          <stop offset=".32" stopColor="#ea4335" />
          <stop offset=".68" stopColor="#a142f4" />
          <stop offset="1" stopColor="#4285f4" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradientId})`} d="M24 2c3.7 12.1 9.9 18.3 22 22-12.1 3.7-18.3 9.9-22 22C20.3 33.9 14.1 27.7 2 24 14.1 20.3 20.3 14.1 24 2Z" />
    </svg>
  )
}

export function GoogleMark() {
  return <span className="ai-brand-mark ai-brand-google" aria-hidden="true">G</span>
}
