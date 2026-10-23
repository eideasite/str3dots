const DOWNLOAD_ENDPOINT = 'https://speed.cloudflare.com/__down'
const DOWNLOAD_BYTES = 2_000_000

function createTestUrl(bytes) {
  const url = new URL(DOWNLOAD_ENDPOINT)
  url.searchParams.set('bytes', String(bytes))
  url.searchParams.set('ja_test', `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  return url.toString()
}

async function fetchSpeedTestSample(bytes, signal) {
  const response = await fetch(createTestUrl(bytes), { signal, cache: 'no-store', credentials: 'omit', mode: 'cors' })
  if (!response.ok) throw new Error(`Speed test source returned ${response.status}.`)
  return response
}

async function measureLatency(signal) {
  const samples = []
  for (let index = 0; index < 3; index += 1) {
    const startedAt = performance.now()
    const response = await fetchSpeedTestSample(0, signal)
    await response.arrayBuffer()
    samples.push(performance.now() - startedAt)
  }
  samples.sort((first, second) => first - second)
  return Math.round(samples[1])
}

async function measureDownload(signal) {
  const startedAt = performance.now()
  const response = await fetchSpeedTestSample(DOWNLOAD_BYTES, signal)

  let bytesReceived = 0
  if (response.body?.getReader) {
    const reader = response.body.getReader()
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        bytesReceived += value.byteLength
      }
    } finally {
      reader.releaseLock()
    }
  } else {
    bytesReceived = (await response.arrayBuffer()).byteLength
  }

  const durationMs = performance.now() - startedAt
  if (!bytesReceived || durationMs <= 0) throw new Error('The speed test source returned no measurable download data.')
  return { downloadMbps: Number(((bytesReceived * 8) / (durationMs * 1000)).toFixed(2)), bytesReceived, durationMs: Math.round(durationMs) }
}

export async function runNetworkSpeedTest(signal) {
  const latencyMs = await measureLatency(signal)
  const download = await measureDownload(signal)
  return { latencyMs, ...download, source: 'Cloudflare', checkedAt: new Date().toISOString() }
}
