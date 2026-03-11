export type InsightType = 'productivity' | 'warning' | 'comfort'

export interface ForecastInsight {
  type: InsightType
  text: string
}

export interface ForecastIntelligenceResult {
  summary: string
  insights: [ForecastInsight, ForecastInsight, ForecastInsight]
}

export interface ForecastHourlyPoint {
  dt_txt?: string
  dt?: number
  pop?: number
  main?: {
    temp?: number
    humidity?: number
  }
  wind?: {
    speed?: number
  }
  weather?: Array<{
    main?: string
  }>
}

export interface ForecastIntelligenceInput {
  temperature?: number
  precipitationProbability?: number
  windSpeed?: number
  humidity?: number
  uvIndex?: number
  condition?: string
  hourlyForecast?: ForecastHourlyPoint[]
}

function toHourLabel(raw?: string | number): string {
  if (!raw) return 'later'
  const date =
    typeof raw === 'number'
      ? new Date(raw * 1000)
      : new Date(String(raw).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return 'later'
  return date
    .toLocaleTimeString([], { hour: 'numeric', hour12: true })
    .replace(/\s/g, '')
    .toLowerCase()
}

function toPercent(pop?: number): number {
  const value = Number(pop ?? 0)
  return value <= 1 ? Math.round(value * 100) : Math.round(value)
}

function toNum(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function generateDailySummary(
  weatherData: ForecastIntelligenceInput = {}
): string {
  const hourly = Array.isArray(weatherData.hourlyForecast)
    ? weatherData.hourlyForecast
    : []
  const temp = toNum(weatherData.temperature)
  const uv = toNum(weatherData.uvIndex)
  const wind = toNum(weatherData.windSpeed)
  const rainNow = toNum(weatherData.precipitationProbability)
  const lateSlots = hourly.slice(3)
  const lateRainMax = lateSlots.reduce(
    (max, slot) => Math.max(max, toPercent(slot?.pop)),
    rainNow
  )
  const windyLater = lateSlots.some((slot) => toNum(slot?.wind?.speed) > 30) || wind > 30

  if (lateRainMax > 50 && temp >= 18 && temp <= 25) {
    return 'A comfortable morning with increasing rain chances later today.'
  }
  if (temp >= 18 && temp <= 25 && uv > 7) {
    return 'Mild and productive conditions dominate today, with elevated UV around midday.'
  }
  if (temp > 26 && uv > 7) {
    return 'Warm and sunny conditions dominate today with elevated UV exposure.'
  }
  if (windyLater || wind > 30) {
    return 'Breezy to windy conditions may reduce outdoor comfort as the day progresses.'
  }
  if (lateRainMax > 50) {
    return 'Conditions are manageable early, but rain risk increases later in the day.'
  }
  if (temp < 14) {
    return 'Cool temperatures are expected today, so outdoor comfort may be lower than usual.'
  }

  return 'Stable weather is expected today with mostly manageable conditions for planned activities.'
}

export function generateForecastInsights(
  weatherData: ForecastIntelligenceInput = {}
): ForecastIntelligenceResult {
  const hourly = Array.isArray(weatherData.hourlyForecast)
    ? weatherData.hourlyForecast
    : []

  const temp = toNum(weatherData.temperature)
  const humidity = toNum(weatherData.humidity)
  const wind = toNum(weatherData.windSpeed)
  const uv = toNum(weatherData.uvIndex)
  const condition = String(weatherData.condition || '').toLowerCase()
  const rainNow = toNum(weatherData.precipitationProbability)
  let bestWindow: { start: string; end: string } | null = null
  let bestScore = -Infinity
  const windowSize = Math.min(4, Math.max(3, hourly.length >= 4 ? 4 : 3))

  for (let i = 0; i <= hourly.length - windowSize; i++) {
    const window = hourly.slice(i, i + windowSize)
    const avgTemp =
      window.reduce((sum, slot) => sum + toNum(slot?.main?.temp, temp), 0) /
      window.length
    const avgRain =
      window.reduce((sum, slot) => sum + toPercent(slot?.pop), 0) / window.length
    const avgWind =
      window.reduce((sum, slot) => sum + toNum(slot?.wind?.speed, wind), 0) /
      window.length

    const withinSweetSpot =
      avgTemp >= 18 && avgTemp <= 25 && avgRain < 30 && avgWind <= 30
    if (!withinSweetSpot) continue

    const score = 100 - Math.abs(avgTemp - 22) * 2 - avgRain - avgWind * 0.25
    if (score > bestScore) {
      bestScore = score
      bestWindow = {
        start: toHourLabel(window[0]?.dt_txt || window[0]?.dt),
        end: toHourLabel(window[window.length - 1]?.dt_txt || window[window.length - 1]?.dt)
      }
    }
  }

  const productivityText = bestWindow
    ? `Productivity window: ${bestWindow.start}-${bestWindow.end} offers the best outdoor focus period with balanced temperature and low rain risk.`
    : temp >= 18 && temp <= 25 && rainNow < 30
      ? 'Productivity window: Current conditions are favorable for outdoor work; prioritize high-value tasks in the next few hours.'
      : 'Productivity window: Conditions are mixed, so front-load essential outdoor tasks into the driest available hours.'

  const firstRainRiskSlot = hourly.find((slot) => toPercent(slot?.pop) > 50)
  const windySlot = hourly.find((slot) => toNum(slot?.wind?.speed) > 30)
  const severeCondition =
    condition.includes('thunder') ||
    condition.includes('storm') ||
    condition.includes('snow')

  let warningText =
    'Weather disruption warning: No major disruption signal right now; continue with normal plan sequencing.'
  if (firstRainRiskSlot || rainNow > 50) {
    const atTime = firstRainRiskSlot
      ? ` around ${toHourLabel(firstRainRiskSlot.dt_txt || firstRainRiskSlot.dt)}`
      : ''
    warningText = `Weather disruption warning: Rain probability exceeds 50%${atTime}. Complete outdoor tasks earlier and shift indoor work later.`
  } else if (uv > 7) {
    warningText =
      'Weather disruption warning: UV index is high (>7). Reduce unprotected midday exposure and schedule shade breaks.'
  } else if (windySlot || wind > 30) {
    warningText =
      'Weather disruption warning: Wind speed is above 30 km/h. Expect outdoor instability and secure light equipment.'
  } else if (severeCondition) {
    warningText =
      'Weather disruption warning: Unstable weather pattern detected. Keep contingency time for sudden condition shifts.'
  }

  let comfortText =
    'Comfort insight: Overall comfort is moderate, with no strong thermal stress signal at the moment.'
  if (humidity >= 70) {
    comfortText =
      'Comfort insight: Humidity is elevated and may reduce comfort; hydration and shorter outdoor intervals are recommended.'
  } else if (uv > 7) {
    comfortText =
      'Comfort insight: Strong UV can increase heat strain; wear sun protection if active outdoors.'
  } else if (temp > 30) {
    comfortText =
      'Comfort insight: Temperatures are high, so plan cooling breaks and avoid peak exertion periods.'
  } else if (temp < 10) {
    comfortText =
      'Comfort insight: Cool conditions may impact comfort and dexterity; layered clothing is recommended.'
  } else if (humidity <= 35) {
    comfortText =
      'Comfort insight: Air is relatively dry; hydration helps maintain focus for longer activity blocks.'
  }

  return {
    summary: generateDailySummary(weatherData),
    insights: [
      { type: 'productivity', text: productivityText },
      { type: 'warning', text: warningText },
      { type: 'comfort', text: comfortText }
    ]
  }
}
