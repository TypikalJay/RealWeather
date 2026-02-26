<script setup>
defineProps({
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
  windDisplay: {
    type: Function,
    required: true
  },
  visibilityKm: {
    type: Function,
    required: true
  },
  rainChance: {
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

function trendArrow(value) {
  if (value === 'up') return '↑'
  if (value === 'down') return '↓'
  return '→'
}
</script>

<template>
  <article class="current-card w-full max-w-full">
    <div class="card-title">
      Current Weather
      <span v-if="loading" class="loading-indicator" aria-live="polite">
        <span class="loading-spinner" aria-hidden="true"></span>
        Loading...
      </span>
    </div>
    <transition name="fade-error">
      <div v-if="error" class="error-banner" role="alert" aria-live="polite">
        {{ error }}
      </div>
    </transition>
    <div v-if="!error && currentWeather" class="current-layout grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="sky-icon">
        <div
          class="icon main-weather-icon"
          :class="mainWeatherIconClass"
          v-html="iconSvg(weatherIcon)"
        ></div>
      </div>
      <div class="current-meta">
        <p class="temp-big current-temp">
          <transition name="temp-change" mode="out-in">
            <span :key="tempDisplayKey" class="temp-value">
              {{ toDisplayTemp(currentWeather.main.temp) }}&deg;{{ unitSymbol }}
              <small>{{ trendArrow(trendIndicators.temperature) }}</small>
            </span>
          </transition>
        </p>
        <div class="highlight">
          <span>Weather Impact Score</span>
          <strong>{{ impactScore.score }}/100 · {{ impactScore.label }}</strong>
        </div>
        <p class="desc current-condition">{{ capitalize(currentWeather.weather[0].description) }}</p>
        <h2 class="current-location">{{ currentWeather.name }}</h2>
        <p class="meta-line">
          Humidity: {{ currentWeather.main.humidity }}% {{ trendArrow(trendIndicators.humidity) }} |
          Wind: {{ windDisplay(currentWeather.wind.speed) }}
        </p>
        <p class="meta-line">
          Feels like: {{ toDisplayTemp(currentWeather.main.feels_like) }}&deg;{{ unitSymbol }} |
          Pressure: {{ currentWeather.main.pressure }} hPa
        </p>
      </div>
    </div>

    <div v-if="!error && currentWeather" class="highlights mobile-low-priority">
      <div class="highlight">
        <span>Rain chance</span>
        <strong>{{ rainChance(currentWeather) }}%</strong>
      </div>
      <div class="highlight">
        <span>Visibility</span>
        <strong>{{ visibilityKm(currentWeather.visibility) }} km</strong>
      </div>
      <div class="highlight">
        <span>Real feel</span>
        <strong>{{ toDisplayTemp(currentWeather.main.feels_like) }}&deg;{{ unitSymbol }}</strong>
      </div>
    </div>

    <section class="hourly-forecast" v-if="hourlyForecast.length && !error">
      <div class="hourly-title">Next 12 Hours</div>
      <transition name="fade-update" mode="out-in">
        <div class="hourly-scroll" :key="hourlyForecastKey">
          <article
            class="hourly-card"
            v-for="(slot, index) in hourlyForecast"
            :key="'hour-' + index + '-' + slot.dt"
          >
            <p class="hourly-time">{{ formatHour(slot.dt_txt) }}</p>
            <div class="icon" v-html="iconSvg(slot.weather[0].main)"></div>
            <p class="hourly-temp">{{ toDisplayTemp(slot.main.temp) }}&deg;{{ unitSymbol }}</p>
          </article>
        </div>
      </transition>
    </section>

    <section class="hourly-forecast" v-if="activityRecommendations.length && !error">
      <div class="hourly-title">Activity Recommendations</div>
      <div class="forecast-list">
        <article
          class="forecast-row"
          v-for="(item, idx) in activityRecommendations"
          :key="'activity-' + idx"
        >
          <p class="meta-line">{{ item }}</p>
        </article>
      </div>
    </section>
  </article>
</template>
