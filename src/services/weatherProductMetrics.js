function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function trendFromDelta(delta, epsilon = 0.6) {
  if (delta > epsilon) return 'up'
  if (delta < -epsilon) return 'down'
  return 'flat'
}

export function calculateImpactScore(normalizedWeather) {
  const current = normalizedWeather?.current
  const hourly = normalizedWeather?.hourlyNext12 || []

  if (!current) {
    return { score: 0, label: 'Severe' }
  }

  const temp = toNumber(current.main?.temp)
  const feelsLike = toNumber(current.main?.feels_like, temp)
  const humidity = toNumber(current.main?.humidity)
  const windSpeed = toNumber(current.wind?.speed)
  const rainProb = toNumber(hourly[0]?.pop)
  const condition = String(current.weather?.[0]?.main || '')

  let score = 100

  // Temperature comfort penalty (18-26C ideal)
  if (temp < 18) score -= clamp((18 - temp) * 3, 0, 30)
  if (temp > 26) score -= clamp((temp - 26) * 3, 0, 30)

  // Humidity comfort penalty (40-60 ideal)
  if (humidity < 40) score -= clamp((40 - humidity) * 0.7, 0, 14)
  if (humidity > 60) score -= clamp((humidity - 60) * 0.7, 0, 20)

  // Wind severity
  if (windSpeed > 12) score -= 24
  else if (windSpeed > 8) score -= 14
  else if (windSpeed > 5) score -= 7

  // Rain probability
  score -= clamp(rainProb * 28, 0, 28)

  // Extreme conditions
  if (feelsLike > 35 || temp > 35) score -= 22
  if (feelsLike < 0 || temp < 0) score -= 22
  if (condition === 'Thunderstorm') score -= 30

  score = Math.round(clamp(score, 0, 100))

  let label = 'Severe'
  if (score >= 85) label = 'Excellent'
  else if (score >= 70) label = 'Comfortable'
  else if (score >= 50) label = 'Moderate'
  else if (score >= 30) label = 'Poor'

  return { score, label }
}

export function generateActivityRecommendations(normalizedWeather, insights = []) {
  const current = normalizedWeather?.current
  const hourly = normalizedWeather?.hourlyNext12 || []

  if (!current) return ['Search for a city to get activity recommendations.']

  const recommendations = []
  const temp = toNumber(current.main?.temp)
  const feelsLike = toNumber(current.main?.feels_like, temp)
  const humidity = toNumber(current.main?.humidity)
  const windSpeed = toNumber(current.wind?.speed)
  const rainProb = toNumber(hourly[0]?.pop)
  const severeInsight = insights.some((item) => item?.level === 'severe')

  if (temp >= 18 && temp <= 26 && windSpeed < 7 && rainProb < 0.25) {
    recommendations.push('Great day for outdoor workouts.')
  }

  if (rainProb >= 0.4 || toNumber(current.rain?.['1h']) > 0) {
    recommendations.push('Carry an umbrella.')
    recommendations.push('Better for indoor activities.')
  }

  if (windSpeed > 10) {
    recommendations.push('Avoid cycling due to wind.')
  }

  if (feelsLike >= 33 || (temp >= 30 && humidity >= 70)) {
    recommendations.push('High dehydration risk.')
  }

  if (severeInsight) {
    recommendations.push('Follow weather alerts before planning travel.')
  }

  if (!recommendations.length) {
    recommendations.push('Conditions are balanced for most outdoor plans.')
  }

  return Array.from(new Set(recommendations)).slice(0, 5)
}

export function computeTrendIndicators(normalizedWeather) {
  const daily = normalizedWeather?.dailySummaries || []
  const slots = normalizedWeather?.forecast || []

  let temperature = 'flat'
  if (daily.length >= 2) {
    const todayAvg = (toNumber(daily[0].minTemp) + toNumber(daily[0].maxTemp)) / 2
    const tomorrowAvg = (toNumber(daily[1].minTemp) + toNumber(daily[1].maxTemp)) / 2
    temperature = trendFromDelta(tomorrowAvg - todayAvg)
  }

  const groupedHumidity = new Map()
  for (const slot of slots) {
    const key = String(slot.dt_txt || '').slice(0, 10)
    if (!key) continue
    if (!groupedHumidity.has(key)) groupedHumidity.set(key, [])
    groupedHumidity.get(key).push(toNumber(slot.main?.humidity))
  }

  const humidityDays = Array.from(groupedHumidity.values()).slice(0, 2)
  let humidity = 'flat'
  if (humidityDays.length >= 2) {
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / Math.max(arr.length, 1)
    humidity = trendFromDelta(avg(humidityDays[1]) - avg(humidityDays[0]))
  }

  return { temperature, humidity }
}
