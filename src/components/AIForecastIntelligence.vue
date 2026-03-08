<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  weatherData: {
    type: Object,
    default: () => ({})
  }
})

function toHourLabel(raw) {
  if (!raw) return 'later'
  const date = new Date(String(raw).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return 'later'
  return date
    .toLocaleTimeString([], { hour: 'numeric', hour12: true })
    .replace(/\s/g, '')
    .toLowerCase()
}

const parsed = computed(() => {
  const data = props.weatherData || {}
  const current = data.currentWeather || {}
  const hourly = Array.isArray(data.hourlyForecast) ? data.hourlyForecast : []
  const impactScore = Number(data.impactScore?.score ?? 0)

  const temperature = Number(current?.main?.temp ?? 0)
  const humidity = Number(current?.main?.humidity ?? 0)
  const windSpeed = Number(current?.wind?.speed ?? 0)
  const uvIndex = Number(current?.uvi ?? current?.uvIndex ?? 0)
  const condition = String(current?.weather?.[0]?.main || '').toLowerCase()
  const rainChanceNow = Math.round(Number(hourly[0]?.pop ?? 0) * 100)

  return {
    hourly,
    impactScore,
    temperature,
    humidity,
    windSpeed,
    uvIndex,
    condition,
    rainChanceNow
  }
})

const insights = computed(() => {
  const p = parsed.value
  const output = []

  const sweetSlots = p.hourly
    .slice(0, 8)
    .filter((slot) => {
      const temp = Number(slot?.main?.temp ?? p.temperature)
      const rain = Number(slot?.pop ?? 0) * 100
      const wind = Number(slot?.wind?.speed ?? p.windSpeed)
      return temp >= 18 && temp <= 25 && rain < 35 && wind <= 30
    })

  if (sweetSlots.length >= 2) {
    output.push(
      `Today is ideal for outdoor work between ${toHourLabel(sweetSlots[0]?.dt_txt)} and ${toHourLabel(sweetSlots[1]?.dt_txt)} due to mild temperatures and lower wind.`
    )
  } else if (p.temperature >= 18 && p.temperature <= 25) {
    output.push('Current temperatures are in a productivity sweet spot for focused outdoor tasks.')
  }

  const rainSlot = p.hourly.find((slot) => Number(slot?.pop ?? 0) * 100 > 50)
  if (rainSlot) {
    output.push(`Rain risk increases around ${toHourLabel(rainSlot?.dt_txt)}. Plan indoor tasks after that window.`)
  } else if (p.rainChanceNow > 35) {
    output.push('Rain potential is moderate today. Keep flexible indoor alternatives ready.')
  }

  if (p.uvIndex > 7) {
    output.push('UV intensity is high. Use sun protection for any prolonged outdoor work.')
  } else if (p.windSpeed > 30) {
    output.push('Wind speeds are elevated and may disrupt outdoor operations or travel comfort.')
  } else if (p.humidity >= 70) {
    output.push('Humidity is elevated and may reduce comfort. Hydration breaks are recommended.')
  } else if (p.impactScore < 60) {
    output.push('Weather stability is moderate-to-low. Prioritize time-sensitive outdoor tasks earlier.')
  }

  while (output.length < 3) {
    output.push('Conditions remain generally manageable. Keep task plans time-blocked around forecast changes.')
  }

  return output.slice(0, 3)
})
</script>

<template>
  <section class="ai-forecast-card rounded-2xl bg-white/10 backdrop-blur p-6 shadow-lg">
    <div class="card-head">
      <h3>AI Forecast Intelligence</h3>
      <span class="ai-icon" aria-hidden="true">AI</span>
    </div>

    <div v-if="loading" class="shimmer-lines" aria-hidden="true">
      <span class="shimmer-line"></span>
      <span class="shimmer-line"></span>
      <span class="shimmer-line"></span>
    </div>

    <ul v-else class="insight-list">
      <li v-for="(insight, idx) in insights" :key="`insight-${idx}`">{{ insight }}</li>
    </ul>
  </section>
</template>

<style scoped>
.ai-forecast-card {
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-head h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.ai-icon {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  padding: 4px 8px;
  color: rgba(255, 255, 255, 0.9);
}

.insight-list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
}

.insight-list li {
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.45;
  font-size: 14px;
}

.shimmer-lines {
  display: grid;
  gap: 10px;
}

.shimmer-line {
  display: block;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.28) 50%, rgba(255, 255, 255, 0.12) 100%);
  background-size: 220% 100%;
  animation: shimmer 1.2s linear infinite;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
</style>
