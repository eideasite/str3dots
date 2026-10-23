export function publishLocally(now = new Date().toISOString()) {
  return { status: 'published', publishedAt: now, scheduledAt: null }
}

export function scheduleLocally(scheduledAt) {
  return { status: 'scheduled', scheduledAt, publishedAt: null }
}

export function waitForPostingMinimum(startedAt, minimumMs = 3000) {
  const remaining = Math.max(0, minimumMs - (Date.now() - startedAt))
  return new Promise((resolve) => setTimeout(resolve, remaining))
}

