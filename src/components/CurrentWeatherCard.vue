<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: Boolean,
  error: {
    type: String,
    default: null
  },
  currentWeather: {
    type: Object,
    default: null
  },
  mainWeatherIconClass: {
    type: String,
    default: ''
  },
  weatherIcon: {
    type: String,
    default: 'Clear'
  },
  tempDisplayKey: {
    type: String,
    default: ''
  },
  unitSymbol: {
    type: String,
    default: 'C'
  },
  hourlyForecast: {
    type: Array,
    default: () => []
  },
  impactScore: {
    type: Object,
    default: () => ({ score: 0, label: 'Severe' })
  },
  trendIndicators: {
    type: Object,
    default: () => ({ temperature: 'flat', humidity: 'flat' })
  },
  activityRecommendations: {
    type: Array,
    default: () => []
  },
  hourlyForecastKey: {
    type: String,
    default: ''
  },
  toDisplayTemp: {
    type: Function,
    required: true
  },
  capitalize: {
    type: Function,
    required: true
  },
  formatHour: {
    type: Function,
    required: true
  },
  iconSvg: {
    type: Function,
    required: true
  }
})

const windDisplay = computed(() => {
  if (!props.currentWeather?.wind?.speed) return 'N/A'
  return `${props.currentWeather.wind.speed} km/h` 
})

const visibilityKm = computed(() => {
  const visibility = props.currentWeather?.main?.visibility
  if (!visibility) return 'N/A'
  return Math.round(visibility / 1000)
})

const rainChance = computed(() => {
  const chance = props.currentWeather?.rain?.chance
  return chance !== undefined ? `${Math.round(chance)}%` : 'N/A'
})

const humidity = computed(() => {
  const humidity = props.currentWeather?.main?.humidity
  return humidity !== undefined && humidity !== null ? `${humidity}%` : 'N/A'
})

const pressure = computed(() => {
  const pressure = props.currentWeather?.main?.pressure
  return pressure !== undefined && pressure !== null && pressure > 0 ? `${pressure} hPa` : 'N/A'
})

const weatherGlowClass = computed(() => {
  const main = (props.currentWeather?.weather?.[0]?.main || '').toLowerCase()
  if (main.includes('rain') || main.includes('drizzle')) return 'rain'
  if (main.includes('clear')) return 'clear'
  if (main.includes('thunderstorm') || main.includes('storm') || main.includes('squall') || main.includes('tornado')) return 'storm'
  return ''
})

function trendArrow(value) {
  if (value === 'up') return '↑'
  if (value === 'down') return '↓'
  return '→'
}
</script>

<template>
  <div class="current-weather-card" :class="weatherGlowClass">
    <h3>Current Weather</h3>
    
    <div class="weather-content">
      <!-- Main Section: Icon, Temperature, Condition, Coordinates -->
      <div class="weather-main">
        <div class="weather-icon">
          <div 
            class="icon main-weather-icon"
            :class="mainWeatherIconClass"
            v-html="iconSvg(weatherIcon)"
          ></div>
        </div>
        
        <div class="temperature-info">
          <div class="temp-display">
            {{ toDisplayTemp(currentWeather?.main?.temp ?? 0) }}&deg;{{ unitSymbol }}
            <span class="trend-arrow">{{ trendArrow(trendIndicators.temperature) }}</span>
          </div>
          <div class="location-info">
            <div class="city-name">{{ currentWeather?.name ?? 'Unknown' }}</div>
            <div class="coordinates">
              {{ currentWeather?.coord?.lat?.toFixed(2) ?? '0.00' }}, {{ currentWeather?.coord?.lon?.toFixed(2) ?? '0.00' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Humidity</span>
          <span class="stat-value">{{ humidity }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Wind Speed</span>
          <span class="stat-value">{{ windDisplay }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Feels Like</span>
          <span class="stat-value">{{ toDisplayTemp(currentWeather?.main?.feels_like ?? currentWeather?.main?.temp ?? 0) }}&deg;{{ unitSymbol }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Pressure</span>
          <span class="stat-value">{{ pressure }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.current-weather-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  transition: box-shadow 0.3s ease;
}

.current-weather-card.rain {
  box-shadow: 0 0 40px rgba(0, 150, 255, 0.25);
}

.current-weather-card.clear {
  box-shadow: 0 0 40px rgba(255, 200, 80, 0.25);
}

.current-weather-card.storm {
  box-shadow: 0 0 40px rgba(168, 85, 247, 0.22), 0 0 56px rgba(239, 68, 68, 0.18);
}

.current-weather-card h3 {
  margin: 0 0 20px 0;
  font-size: 22px;
  font-weight: 600;
  color: white;
}

.weather-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  gap: 20px;
}

.weather-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.weather-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
}

.weather-icon .icon {
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weather-icon :deep(.main-weather-icon svg) {
  width: 315px;
  height: 237px;
  display: block;
  margin: 0 auto;
}

.temperature-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
  margin-top: 1em;
  text-align: center;
}

.temp-display {
  font-size: 44px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  line-height: 1;
  letter-spacing: 0.5px;
}

.trend-arrow {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.city-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  opacity: 0.8;
}

.coordinates {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

@media (max-width: 768px) {
  .weather-icon .icon {
    width: 72px;
    height: 72px;
  }

  .weather-icon :deep(.main-weather-icon svg) {
    width: 180px;
    height: 135px;
  }
  
  .temp-display {
    font-size: 28px;
  }
  
  .city-name {
    font-size: 18px;
  }
  
  .stats-grid {
    gap: 8px;
  }
}
</style>
