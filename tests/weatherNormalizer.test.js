import { describe, expect, it } from 'vitest'
import { normalizeWeather } from '@/services/weatherNormalizer'

describe('normalizeWeather', () => {
  it('normalizes current weather and forecast safely', () => {
    const rawCurrent = {
      dt: 100,
      name: 'Test City',
      main: { temp: 28, feels_like: 30, humidity: 82, pressure: 1006 },
      wind: { speed: 5.2 },
      weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }]
    }

    const rawForecast = {
      list: [
        {
          dt: 101,
          dt_txt: '2026-02-26 12:00:00',
          main: { temp: 29, feels_like: 31, temp_min: 27, temp_max: 30, humidity: 80, pressure: 1005 },
          wind: { speed: 6 },
          pop: 0.6,
          rain: { '3h': 1.5 },
          weather: [{ main: 'Rain', description: 'moderate rain', icon: '10d' }]
        }
      ]
    }

    const normalized = normalizeWeather(rawCurrent, rawForecast)

    expect(normalized.current.name).toBe('Test City')
    expect(normalized.current.main.temp).toBe(28)
    expect(normalized.current.rain['1h']).toBeNull()
    expect(normalized.forecast).toHaveLength(1)
    expect(normalized.hourlyNext12).toHaveLength(1)
    expect(normalized.dailySummaries).toHaveLength(1)
    expect(normalized.dailySummaries[0].dominantCondition).toBe('Rain')
    expect(normalized.dailySummaries[0].totalRainfall).toBe(1.5)
  })

  it('handles missing optional fields without crashing', () => {
    const normalized = normalizeWeather({}, { list: [{}] })
    expect(normalized.current.weather[0].main).toBe('Clear')
    expect(normalized.forecast[0].rain['3h']).toBeNull()
    expect(normalized.forecast[0].snow['3h']).toBeNull()
  })
})
