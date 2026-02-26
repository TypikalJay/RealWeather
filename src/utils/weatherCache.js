const CACHE_PREFIX = 'weather-cache:'

function safeParse(value) {
  try {
    return JSON.parse(value)
  } catch (error) {
    return null
  }
}

export function buildWeatherCacheKey(params = {}) {
  const normalized = Object.entries(params)
    .filter(([, value]) => value != null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${String(value).trim().toLowerCase()}`)
    .join('|')

  return `${CACHE_PREFIX}${normalized || 'default'}`
}

export function readWeatherCache(cacheKey, maxAgeMs) {
  try {
    const raw = localStorage.getItem(cacheKey)
    if (!raw) return { data: null, fresh: false }

    const parsed = safeParse(raw)
    if (!parsed || typeof parsed !== 'object') return { data: null, fresh: false }

    const timestamp = Number(parsed.timestamp ?? 0)
    const data = parsed.data ?? null
    if (!data) return { data: null, fresh: false }

    const age = Date.now() - timestamp
    return {
      data,
      timestamp,
      fresh: age >= 0 && age <= maxAgeMs
    }
  } catch (error) {
    console.error('[weather-cache] Failed to read cache', { cacheKey, error })
    return { data: null, fresh: false }
  }
}

export function writeWeatherCache(cacheKey, data) {
  try {
    const timestamp = Date.now()
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        timestamp,
        data
      })
    )
    return timestamp
  } catch (error) {
    console.error('[weather-cache] Failed to write cache', { cacheKey, error })
    return null
  }
}
