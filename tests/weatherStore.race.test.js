import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/weatherApi', () => ({
  fetchWeatherBundle: vi.fn()
}))

import { fetchWeatherBundle } from '@/services/weatherApi'
import { useWeatherStore } from '@/stores/weather'

function bundleForCity(name, dt) {
  return {
    source: 'network',
    servedAt: Date.now(),
    current: {
      dt,
      name,
      main: { temp: 20, feels_like: 20, humidity: 50, pressure: 1000 },
      wind: { speed: 3, deg: 0 },
      weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
    },
    forecast: {
      list: [
        {
          dt: dt + 1,
          dt_txt: '2026-02-26 12:00:00',
          main: { temp: 20, feels_like: 20, temp_min: 18, temp_max: 22, humidity: 50, pressure: 1000 },
          wind: { speed: 3, deg: 0 },
          pop: 0,
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
        }
      ]
    }
  }
}

describe('weather store race guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('keeps latest request result and ignores stale response', async () => {
    fetchWeatherBundle.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve(bundleForCity('Old City', 1)), 40))
    )
    fetchWeatherBundle.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve(bundleForCity('New City', 2)), 5))
    )

    const store = useWeatherStore()

    await Promise.allSettled([
      store.fetchWeatherByParams({ q: 'old' }),
      store.fetchWeatherByParams({ q: 'new' })
    ])

    expect(store.currentWeather?.name).toBe('New City')
  })

  it('handles abort errors silently without setting failure state', async () => {
    fetchWeatherBundle.mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }))

    const store = useWeatherStore()
    await store.fetchWeatherByParams({ q: 'city-a' })

    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })
})
