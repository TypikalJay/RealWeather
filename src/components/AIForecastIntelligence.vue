<script setup>
import { computed } from 'vue'
import { generateForecastInsights } from '@/utils/forecastIntelligence'
import DailyWeatherSummary from '@/components/DailyWeatherSummary.tsx'

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

const intelligence = computed(() => {
  const data = props.weatherData || {}
  const current = data.currentWeather || {}
  const hourly = Array.isArray(data.hourlyForecast) ? data.hourlyForecast : []
  const input = {
    temperature: Number(current?.main?.temp ?? 0),
    precipitationProbability: Math.round(Number(hourly[0]?.pop ?? 0) * 100),
    windSpeed: Number(current?.wind?.speed ?? 0),
    humidity: Number(current?.main?.humidity ?? 0),
    uvIndex: Number(current?.uvi ?? current?.uvIndex ?? 0),
    condition: String(current?.weather?.[0]?.main || ''),
    hourlyForecast: hourly
  }

  return generateForecastInsights(input)
})
</script>

<template>
  <section class="ai-forecast-card rounded-2xl bg-white/10 backdrop-blur p-6 shadow-lg">
    <div class="card-head">
      <h3><span class="brain">AI</span> AI Forecast Intelligence</h3>
      <span class="ai-icon" aria-hidden="true">AI</span>
    </div>

    <div v-if="loading" class="shimmer-lines" aria-hidden="true">
      <span class="shimmer-line"></span>
      <span class="shimmer-line"></span>
      <span class="shimmer-line"></span>
      <span class="shimmer-line"></span>
    </div>

    <template v-else>
      <DailyWeatherSummary
        :summary="intelligence.summary"
        :weather-data="weatherData"
      />
      <p class="insights-title">Insights:</p>
      <ul class="insight-list">
        <li v-for="insight in intelligence.insights" :key="insight.type">
          {{ insight.text }}
        </li>
      </ul>
    </template>
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
  font-size: 21px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.brain {
  font-size: 10px;
  letter-spacing: 0.08em;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  padding: 3px 7px;
  opacity: 0.9;
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

:deep(.daily-weather-summary) {
  margin: 0 0 10px 0;
  color: rgba(255, 255, 255, 0.96);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.45;
}

.insights-title {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.insight-list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 12px;
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
