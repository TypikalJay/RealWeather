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
      <h3>7-Day Forecast</h3>
      <div class="forecast-grid">
        <article
          class="forecast-card"
          v-for="(day, index) in dailyForecast"
          :key="'card-' + index"
        >
          <p class="forecast-day">{{ formatDay(day?.dt_txt ?? '') }}</p>
          <div class="icon forecast-icon" v-html="iconSvg(day?.weather?.[0]?.main ?? 'Clear')"></div>
          <p class="forecast-temp">
            {{ toDisplayTemp(day?.main?.temp_max ?? 0) }}&deg; / {{ toDisplayTemp(day?.main?.temp_min ?? 0) }}&deg;
          </p>
        </article>
      </div>
    </section>
  </transition>
</template>

<style scoped>
.forecast-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.forecast-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}
</style>
