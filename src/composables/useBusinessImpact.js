import { computed, unref } from 'vue'

export function useBusinessImpact(weatherSource) {
  const normalized = computed(() => {
    const weather = unref(weatherSource)
    if (!weather) return null

    return {
      temperature: Number(weather.temperature ?? 0),
      rainProbability: Number(weather.rainProbability ?? 0),
      windSpeed: Number(weather.windSpeed ?? 0),
      humidity: Number(weather.humidity ?? 0)
    }
  })

  const score = computed(() => {
    const weather = normalized.value
    if (!weather) return 100

    let result = 100

    if (weather.rainProbability > 70) {
      result -= 40
    } else if (weather.rainProbability >= 40) {
      result -= 25
    }

    if (weather.windSpeed > 25) result -= 15
    if (weather.temperature > 38) result -= 20
    if (weather.temperature < 20) result -= 10
    if (weather.humidity > 85) result -= 10

    return Math.max(0, Math.min(100, result))
  })

  const status = computed(() => {
    if (score.value >= 70) return 'Good Selling Day'
    if (score.value >= 40) return 'Moderate Risk'
    return 'High Weather Risk'
  })

  const color = computed(() => {
    if (score.value >= 70) return 'emerald'
    if (score.value >= 40) return 'yellow'
    return 'red'
  })

  const advisory = computed(() => {
    if (score.value >= 70) {
      return 'Weather is favorable. Keep promotions active and plan for strong customer flow.'
    }
    if (score.value >= 40) {
      return 'Some weather friction is expected. Use flexible staffing and targeted offers.'
    }
    return 'High disruption risk. Prioritize delivery, adjust staffing, and protect conversions.'
  })

  return {
    score,
    status,
    color,
    advisory
  }
}
