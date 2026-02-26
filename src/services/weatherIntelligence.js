function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function rangeDeviation(value, min, max, scale) {
  if (value < min) return (min - value) * scale
  if (value > max) return (value - max) * scale
  return 0
}

function formatHourLabel(value) {
  if (!value || typeof value !== 'string') return 'later today'
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return 'later today'
  return date
    .toLocaleTimeString([], { hour: 'numeric', hour12: true })
    .replace(/\s/g, '')
    .toUpperCase()
}

function getPeakSlot(slots, selector) {
  if (!Array.isArray(slots) || !slots.length) return null
  let maxSlot = slots[0]
  let maxValue = selector(slots[0])
  for (const slot of slots.slice(1)) {
    const value = selector(slot)
    if (value > maxValue) {
      maxValue = value
      maxSlot = slot
    }
  }
  return maxSlot
}

function computeDeviation({ score, temp, humidity, wind, rainProb, severeCount }) {
  const impactDeviation = Math.max(0, 80 - score) * 0.7
  const tempDeviation = rangeDeviation(temp, 18, 26, 3.2)
  const humidityDeviation = rangeDeviation(humidity, 40, 60, 1.6)
  const windDeviation = Math.max(0, wind - 5) * 4.2
  const rainDeviation = rainProb * 35
  const severeDeviation = severeCount * 12

  return clamp(
    impactDeviation + tempDeviation + humidityDeviation + windDeviation + rainDeviation + severeDeviation,
    0,
    100
  )
}

function getProfileLabel({ score, severeCount, comfortTemp, humidity, wind, rainProb, deviation }) {
  if (severeCount > 0 || wind > 14 || rainProb >= 0.75) return 'Environmental Risk Day'
  if (deviation >= 60 || score < 45) return 'Energy-Conservation Day'
  if (score >= 82 && comfortTemp && humidity >= 40 && humidity <= 60 && wind < 7 && rainProb < 0.25) {
    return 'High Momentum Day'
  }
  if (score >= 68 && comfortTemp && wind < 9 && rainProb < 0.4) return 'Deep Focus Day'
  return 'Strategic Planning Day'
}

export function buildProductivityProfile({ normalizedWeather, impactScore, insights }) {
  const current = normalizedWeather?.current || {}
  const hourly = normalizedWeather?.hourlyNext12 || []

  const score = toNumber(impactScore?.score)
  const temp = toNumber(current.main?.temp)
  const humidity = toNumber(current.main?.humidity)
  const wind = toNumber(current.wind?.speed)
  const rainProb = toNumber(hourly[0]?.pop)
  const severeCount = (insights || []).filter((item) => item?.level === 'severe').length
  const comfortTemp = temp >= 18 && temp <= 26

  const deviation = computeDeviation({ score, temp, humidity, wind, rainProb, severeCount })
  const confidence = Math.round(clamp(42 + deviation * 0.56 + severeCount * 6, 35, 98))

  const label = getProfileLabel({
    score,
    severeCount,
    comfortTemp,
    humidity,
    wind,
    rainProb,
    deviation
  })

  let reasoning = 'Conditions are mixed, so output will improve with a deliberate pace and fewer context switches.'
  if (label === 'High Momentum Day') {
    reasoning = 'Conditions support sustained output with minimal environmental friction.'
  } else if (label === 'Deep Focus Day') {
    reasoning = 'Conditions favor concentration if you protect uninterrupted work blocks.'
  } else if (label === 'Strategic Planning Day') {
    reasoning = 'Execution conditions are moderate, so planning and prioritization will return better value.'
  } else if (label === 'Energy-Conservation Day') {
    reasoning = 'Weather friction is elevated, so steady pacing will protect output quality.'
  } else if (label === 'Environmental Risk Day') {
    reasoning = 'Environmental risk is elevated, so resilience should lead the work plan.'
  }

  return { label, confidence, reasoning }
}

export function buildBusinessRecommendations({ normalizedWeather, impactScore, insights }) {
  const current = normalizedWeather?.current || {}
  const hourly = normalizedWeather?.hourlyNext12 || []
  const score = toNumber(impactScore?.score)

  const temp = toNumber(current.main?.temp)
  const feelsLike = toNumber(current.main?.feels_like, temp)
  const humidity = toNumber(current.main?.humidity)
  const wind = toNumber(current.wind?.speed)
  const rainProb = toNumber(hourly[0]?.pop)
  const severe = (insights || []).some((item) => item?.level === 'severe')
  const peakWindSlot = getPeakSlot(hourly, (slot) => toNumber(slot?.wind?.speed))
  const peakRainSlot = getPeakSlot(hourly, (slot) => toNumber(slot?.pop))
  const peakWindTime = formatHourLabel(peakWindSlot?.dt_txt)
  const peakRainTime = formatHourLabel(peakRainSlot?.dt_txt)

  let focus = 'Run two focused blocks early, then reserve the afternoon for coordination and follow-through.'
  if (score >= 80 && rainProb < 0.25 && wind < 8) {
    focus = 'Schedule your most analytical task in the next 3 hours while conditions stay stable.'
  } else if (severe || score < 45) {
    focus = `Narrow scope to essential deliverables and place check-ins around ${peakRainTime} when disruption risk is higher.`
  }

  let energy = 'Use 50-10 work-rest cycles and keep hydration steady to maintain mental clarity.'
  if (feelsLike >= 33 || (temp >= 30 && humidity >= 70)) {
    energy = 'Shorten deep-work sessions to 45-60 minutes and increase hydration cadence to offset heat strain.'
  } else if (temp <= 5) {
    energy = 'Start with lower-load tasks, then move to intensive work after one warm-up cycle.'
  }

  let risk = 'Maintain standard risk controls and review conditions at major schedule transitions.'
  if (rainProb >= 0.5) {
    risk = `Protect travel buffers and shift movement-dependent work indoors ahead of ${peakRainTime}.`
  }
  if (wind > 12) {
    risk = `Avoid exposure-heavy travel near ${peakWindTime} when wind intensity is expected to peak.`
  }
  if (severe) {
    risk = 'Trigger continuity mode for non-essential work and defer avoidable exposure windows.'
  }

  return [
    { type: 'focus', message: focus },
    { type: 'energy', message: energy },
    { type: 'risk', message: risk }
  ]
}

export function buildStrategicAngle({ profile, recommendations }) {
  if (profile?.label === 'High Momentum Day') {
    return 'Conditions support sustained output. Prioritize high-value work before routine tasks.'
  }
  if (profile?.label === 'Deep Focus Day') {
    return 'Use protected focus windows for analytical work. Keep communication batches short and scheduled.'
  }
  if (profile?.label === 'Strategic Planning Day') {
    return 'Treat today as a sequencing day. Clarify priorities now to reduce friction over the next 24-48 hours.'
  }
  if (profile?.label === 'Energy-Conservation Day') {
    return 'Pace output for consistency rather than speed. Reduce context switching and protect recovery intervals.'
  }
  return 'Environmental risk is elevated. Prioritize continuity, tighten buffers, and postpone avoidable exposure.'
}
