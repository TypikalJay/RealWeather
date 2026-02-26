<script setup>
defineProps({
  dailyForecast: {
    type: Array,
    default: () => []
  },
  weatherUpdateKey: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: null
  },
  formatDay: {
    type: Function,
    required: true
  },
  iconSvg: {
    type: Function,
    required: true
  },
  capitalize: {
    type: Function,
    required: true
  },
  toDisplayTemp: {
    type: Function,
    required: true
  },
  unitSymbol: {
    type: String,
    default: 'C'
  }
})
</script>

<template>
  <transition name="weather-swap" mode="out-in">
    <section class="cards-forecast" v-if="dailyForecast.length && !error" :key="'cards-' + weatherUpdateKey">
      <h3>5-Day Forecast</h3>
      <div class="forecast-list">
        <article
          class="forecast-row"
          v-for="(day, index) in dailyForecast"
          :key="'row-' + index"
        >
          <p class="forecast-day">{{ formatDay(day.dt_txt) }}</p>
          <div class="icon forecast-icon" v-html="iconSvg(day.weather[0].main)"></div>
          <p class="forecast-desc">{{ capitalize(day.weather[0].description) }}</p>
          <p class="forecast-temp">
            {{ toDisplayTemp(day.main.temp_max) }}&deg; / {{ toDisplayTemp(day.main.temp_min) }}&deg;
          </p>
        </article>
      </div>
    </section>
  </transition>
</template>
