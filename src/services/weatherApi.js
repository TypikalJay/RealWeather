import { buildWeatherCacheKey, readWeatherCache, writeWeatherCache } from '@/utils/weatherCache'

const API_BASE = 'https://api.openweathermap.org/data/2.5'
const CACHE_TTL_MS = 15 * 60 * 1000

function buildApiUrl(path, apiKey, params) {
  const searchParams = new URLSearchParams({
    ...params,
    units: 'metric',
    appid: apiKey
  })
  return `${API_BASE}/${path}?${searchParams.toString()}`
}

async function parseJsonSafe(response) {
  try {
    return await response.json()
  } catch (error) {
    return {}
  }
}

function resolveErrorMessage(response, payload, params) {
  if (response.status === 404) {
    return params.q
      ? 'City not found. Please try another location.'
      : 'Location not found. Please try a different search.'
  }
  return payload?.message || 'Unable to fetch weather data.'
}

export async function fetchWeatherBundle(params, apiKey, options = {}) {
  if (!apiKey) {
    throw new Error('Weather API key is missing. Add VITE_WEATHER_API_KEY to your environment.')
  }

  const cacheKey = buildWeatherCacheKey(params)
  const cached = readWeatherCache(cacheKey, CACHE_TTL_MS)
  if (cached.fresh && cached.data) {
    return { ...cached.data, source: 'cache', servedAt: cached.timestamp ?? Date.now() }
  }

  const currentUrl = buildApiUrl('weather', apiKey, params)
  const forecastUrl = buildApiUrl('forecast', apiKey, params)

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl, { signal: options.signal }),
      fetch(forecastUrl, { signal: options.signal })
    ])

    const [currentData, forecastData] = await Promise.all([
      parseJsonSafe(currentRes),
      parseJsonSafe(forecastRes)
    ])

    if (!currentRes.ok) {
      throw new Error(resolveErrorMessage(currentRes, currentData, params))
    }

    if (!forecastRes.ok) {
      throw new Error(forecastData?.message || 'Unable to fetch forecast data.')
    }

    const bundle = { current: currentData, forecast: forecastData }
    const savedAt = writeWeatherCache(cacheKey, bundle)
    return { ...bundle, source: 'network', servedAt: savedAt ?? Date.now() }
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error
    }

    if (cached.data) {
      console.error('[weather-api] Network failed, using stale cached weather', {
        params,
        error
      })
      return { ...cached.data, source: 'stale-cache', servedAt: cached.timestamp ?? Date.now() }
    }

    throw error
  }
}
