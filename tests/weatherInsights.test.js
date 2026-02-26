import { describe, expect, it } from 'vitest'
import { generateWeatherInsights } from '@/services/weatherInsights'

describe('generateWeatherInsights', () => {
  it('returns severe alerts for thunderstorm and extreme conditions', () => {
    const normalized = {
      current: {
        weather: [{ main: 'Thunderstorm' }],
        main: { temp: 36, feels_like: 39, humidity: 88 },
        wind: { speed: 13 },
        rain: { '1h': 2 }
      },
      hourlyNext24: [
        { pop: 0.7, rain: { '3h': 4 }, snow: { '3h': 0 } }
      ],
      dailySummaries: [
        { minTemp: 28, maxTemp: 38 },
        { minTemp: 18, maxTemp: 24 }
      ]
    }

    const insights = generateWeatherInsights(normalized)
    expect(insights.some((item) => item.level === 'severe')).toBe(true)
    expect(insights.some((item) => item.message.includes('Thunderstorm'))).toBe(true)
  })

  it('returns stable normal insight when weather is mild', () => {
    const normalized = {
      current: {
        weather: [{ main: 'Clear' }],
        main: { temp: 24, feels_like: 24, humidity: 45 },
        wind: { speed: 3 },
        rain: { '1h': 0 }
      },
      hourlyNext24: [],
      dailySummaries: []
    }

    const insights = generateWeatherInsights(normalized)
    expect(insights[0].level).toBe('normal')
  })
})
