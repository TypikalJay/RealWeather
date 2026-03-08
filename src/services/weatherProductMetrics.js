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
  const humidity = toNumber(current.main?.humidity)
  const windSpeed = toNumber(current.wind?.speed)
  const rainChance = toNumber(current.rain?.chance || 0) * 100
  const visibility = toNumber(current.main?.visibility) / 1000 // Convert to km
  const condition = String(current.weather?.[0]?.main || '').toLowerCase()

  // Start with perfect score
  let score = 100

  // Rain penalty
  score -= rainChance * 0.4

  // Temperature comfort penalty (22°C ideal)
  score -= Math.abs(temp - 22) * 1.5

  // Wind penalty
  if (windSpeed > 20) {
    score -= 10
  }

  // Visibility penalty
  if (visibility < 5) {
    score -= 15
  }

  // Storm condition penalty
  if (condition.includes('storm') || condition.includes('thunder') || condition.includes('snow')) {
    score -= 25
  }

  // Clamp result between 0 and 100
  score = Math.round(clamp(score, 0, 100))

  // Generate label
  let label = 'Severe'
  if (score >= 80) label = 'Excellent'
  else if (score >= 60) label = 'Good'
  else if (score >= 40) label = 'Moderate'
  else if (score >= 20) label = 'Poor'
  else label = 'Severe'

  // Generate explanation
  let explanation = ''
  if (rainChance > 40) {
    explanation = 'High rain probability may reduce outdoor activity.'
  } else if (windSpeed > 20) {
    explanation = 'Strong winds may affect outdoor plans.'
  } else if (Math.abs(temp - 22) > 8) {
    explanation = 'Temperature conditions may be uncomfortable.'
  } else if (visibility < 5) {
    explanation = 'Poor visibility may impact travel.'
  } else if (condition.includes('storm') || condition.includes('thunder')) {
    explanation = 'Storm conditions require safety precautions.'
  } else {
    explanation = 'Weather conditions are suitable for most activities.'
  }

  return { score, label, explanation }
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
