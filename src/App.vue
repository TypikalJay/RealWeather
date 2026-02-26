<template>
  <div class="app">
    <div class="sky-bg">
      <span class="haze haze-1"></span>
      <span class="haze haze-2"></span>
      <span class="haze haze-3"></span>
      <span
        class="bg-cloud"
        v-for="n in 9"
        :key="'bg-cloud-' + n"
        :style="{ '--i': n }"
      ></span>
    </div>

    <div class="weather-shell">
      <header class="app-head">
        <div class="brand">
          <div class="brand-mark">GW</div>
          <div>
            <h1>Weather Dashboard</h1>
            <p>Live conditions and forecast</p>
          </div>
        </div>
      </header>

      <section class="controls">
        <input
          class="search"
          type="text"
          placeholder="Enter city name (search worldwide)..."
          v-model="cityInput"
          @keyup.enter="getWeather"
        />
        <button class="search-btn" @click="getWeather">Search</button>
        <div class="unit-toggle" aria-label="Temperature unit toggle">
          <button
            type="button"
            class="unit-btn"
            :class="{ active: useCelsius }"
            @click="useCelsius = true"
          >
            deg C
          </button>
          <button
            type="button"
            class="unit-btn"
            :class="{ active: !useCelsius }"
            @click="useCelsius = false"
          >
            deg F
          </button>
        </div>
      </section>

      <section v-if="!weatherStore.currentWeather" class="empty-card">
        <div class="sky-icon">
          <div class="sun"></div>
          <div class="cloud c1"></div>
          <div class="cloud c2"></div>
          <div class="rain">
            <span
              class="drop"
              v-for="n in 8"
              :key="'empty-drop-' + n"
              :style="{ '--i': n }"
            ></span>
          </div>
        </div>
        <div>
          <h2>Search for a city</h2>
          <p>Current weather, key metrics, and a 5-day hybrid forecast will appear here.</p>
        </div>
      </section>

      <section v-else class="main-grid">
        <article class="current-card">
          <div class="card-title">Current Weather</div>
          <div class="current-layout">
            <div class="sky-icon">
              <div class="sun"></div>
              <div class="cloud c1"></div>
              <div class="cloud c2"></div>
              <div class="rain" v-if="showRain(weatherStore.currentWeather.weather[0].main)">
                <span
                  class="drop"
                  v-for="n in 10"
                  :key="'hero-drop-' + n"
                  :style="{ '--i': n }"
                ></span>
              </div>
            </div>
            <div class="current-meta">
              <h2>{{ weatherStore.currentWeather.name }}</h2>
              <p class="desc">{{ capitalize(weatherStore.currentWeather.weather[0].description) }}</p>
              <p class="temp-big">
                {{ toDisplayTemp(weatherStore.currentWeather.main.temp) }}&deg;{{ unitSymbol }}
              </p>
              <p class="meta-line">
                Humidity: {{ weatherStore.currentWeather.main.humidity }}% |
                Wind: {{ windDisplay(weatherStore.currentWeather.wind.speed) }}
              </p>
              <p class="meta-line">
                Feels like: {{ toDisplayTemp(weatherStore.currentWeather.main.feels_like) }}&deg;{{ unitSymbol }} |
                Pressure: {{ weatherStore.currentWeather.main.pressure }} hPa
              </p>
            </div>
          </div>

          <div class="highlights">
            <div class="highlight">
              <span>Rain chance</span>
              <strong>{{ rainChance(weatherStore.currentWeather) }}%</strong>
            </div>
            <div class="highlight">
              <span>Visibility</span>
              <strong>{{ visibilityKm(weatherStore.currentWeather.visibility) }} km</strong>
            </div>
            <div class="highlight">
              <span>Real feel</span>
              <strong>{{ toDisplayTemp(weatherStore.currentWeather.main.feels_like) }}&deg;{{ unitSymbol }}</strong>
            </div>
          </div>
        </article>

        <aside class="side-forecast" v-if="dailyForecast.length">
          <div class="card-title">Daily Forecast</div>
          <div
            class="side-row"
            v-for="(day, index) in dailyForecast"
            :key="'side-' + index"
          >
            <span class="side-day">{{ formatDay(day.dt_txt) }}</span>
            <div class="icon" v-html="iconSvg(day.weather[0].main)"></div>
            <span class="side-desc">{{ capitalize(day.weather[0].description) }}</span>
            <span class="side-temp">
              {{ toDisplayTemp(day.main.temp_max) }}&deg; / {{ toDisplayTemp(day.main.temp_min) }}&deg;
            </span>
          </div>
        </aside>
      </section>

      <section class="cards-forecast" v-if="dailyForecast.length">
        <h3>5-Day Forecast</h3>
        <div class="cards-grid">
          <article
            class="day-card"
            v-for="(day, index) in dailyForecast"
            :key="'card-' + index"
          >
            <p class="day-name">{{ formatDay(day.dt_txt) }}</p>
            <p class="day-date">{{ formatDate(day.dt_txt) }}</p>
            <div class="icon" v-html="iconSvg(day.weather[0].main)"></div>
            <p class="card-temp">{{ toDisplayTemp(day.main.temp) }}&deg;{{ unitSymbol }}</p>
            <p class="card-desc">{{ capitalize(day.weather[0].description) }}</p>
            <p class="card-rain">Rain {{ popPercent(day) }}%</p>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useWeatherStore } from '@/stores/weather'

const cityInput = ref('')
const weatherStore = useWeatherStore()
const useCelsius = ref(true)

const unitSymbol = computed(() => (useCelsius.value ? 'C' : 'F'))

const dailyForecast = computed(() => {
  const groups = new Map()
  for (const slot of weatherStore.forecast) {
    const key = slot.dt_txt.slice(0, 10)
    if (!groups.has(key)) groups.set(key, slot)
  }
  return Array.from(groups.values()).slice(0, 5)
})

function getWeather() {
  if (cityInput.value.trim()) {
    weatherStore.fetchWeather(cityInput.value)
    cityInput.value = ''
  }
}

function toDate(value) {
  return new Date(value.replace(' ', 'T'))
}

function formatDay(value) {
  return toDate(value).toLocaleDateString([], { weekday: 'short' })
}

function formatDate(value) {
  return toDate(value).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function toDisplayTemp(celsiusValue) {
  if (useCelsius.value) return Math.round(celsiusValue)
  return Math.round((celsiusValue * 9) / 5 + 32)
}

function windDisplay(speedMs) {
  if (useCelsius.value) return `${Math.round(speedMs * 3.6)} km/h`
  return `${Math.round(speedMs * 2.237)} mph`
}

function visibilityKm(visibilityMeters) {
  return (visibilityMeters / 1000).toFixed(1)
}

function popPercent(slot) {
  return Math.round((slot.pop ?? 0) * 100)
}

function rainChance(currentWeather) {
  const rainVolume = currentWeather.rain?.['1h']
  if (rainVolume != null) {
    return Math.min(100, Math.round(rainVolume * 20))
  }
  return popPercent(weatherStore.forecast[0] || {})
}

function showRain(main) {
  return ['Rain', 'Drizzle', 'Thunderstorm'].includes(main)
}

function iconSvg(main) {
  const sun = `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="sun-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffe59a" />
          <stop offset="100%" stop-color="#ffb100" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="12" fill="url(#sun-grad)" />
      ${Array.from({ length: 8 })
        .map((_, i) => {
          const angle = (i * Math.PI) / 4
          const x1 = 32 + Math.cos(angle) * 18
          const y1 = 32 + Math.sin(angle) * 18
          const x2 = 32 + Math.cos(angle) * 26
          const y2 = 32 + Math.sin(angle) * 26
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffd166" stroke-width="3" stroke-linecap="round" />`
        })
        .join('')}
    </svg>
  `

  const cloud = `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 44h26a10 10 0 0 0 0-20 14 14 0 0 0-27-3A11 11 0 0 0 20 44Z" fill="#dbe7ff" />
    </svg>
  `

  const rain = `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 38h26a10 10 0 0 0 0-20 14 14 0 0 0-27-3A11 11 0 0 0 20 38Z" fill="#dbe7ff" />
      <path d="M22 46l-4 8" stroke="#4fc3f7" stroke-width="3" stroke-linecap="round" />
      <path d="M34 46l-4 8" stroke="#4fc3f7" stroke-width="3" stroke-linecap="round" />
      <path d="M46 46l-4 8" stroke="#4fc3f7" stroke-width="3" stroke-linecap="round" />
    </svg>
  `

  const snow = `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 38h26a10 10 0 0 0 0-20 14 14 0 0 0-27-3A11 11 0 0 0 20 38Z" fill="#dbe7ff" />
      <circle cx="24" cy="50" r="2" fill="#bde0ff" />
      <circle cx="34" cy="50" r="2" fill="#bde0ff" />
      <circle cx="44" cy="50" r="2" fill="#bde0ff" />
    </svg>
  `

  const storm = `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 36h26a10 10 0 0 0 0-20 14 14 0 0 0-27-3A11 11 0 0 0 20 36Z" fill="#dbe7ff" />
      <path d="M34 38l-6 10h6l-6 10" stroke="#ffd166" stroke-width="3" fill="none" />
    </svg>
  `

  const fog = `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 38h26a10 10 0 0 0 0-20 14 14 0 0 0-27-3A11 11 0 0 0 20 38Z" fill="#dbe7ff" />
      <path d="M18 46h30" stroke="#cbd5f5" stroke-width="3" stroke-linecap="round" />
      <path d="M22 52h26" stroke="#cbd5f5" stroke-width="3" stroke-linecap="round" />
    </svg>
  `

  const map = {
    Clear: sun,
    Clouds: cloud,
    Rain: rain,
    Drizzle: rain,
    Thunderstorm: storm,
    Snow: snow,
    Mist: fog,
    Smoke: fog,
    Haze: fog,
    Fog: fog
  }

  return map[main] || sun
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;500;700;800&display=swap');

* {
  box-sizing: border-box;
}

.app {
  --text: #f5fbff;
  --muted: rgba(238, 246, 255, 0.88);
  --glass: rgba(5, 18, 44, 0.78);
  --glass-2: rgba(10, 28, 57, 0.82);
  --line: rgba(255, 255, 255, 0.22);
  --accent: #27c063;
  --btn: #23314f;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  color: var(--text);
  font-family: 'Manrope', sans-serif;
  padding: 22px;
  display: grid;
  place-items: center;
}

.sky-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 15% 18%, rgba(255, 195, 133, 0.55), transparent 36%),
    radial-gradient(circle at 64% 20%, rgba(255, 183, 128, 0.48), transparent 34%),
    linear-gradient(160deg, #1f7fca 0%, #1390da 32%, #1d95db 58%, #0d65ae 100%);
  z-index: 0;
}

.haze {
  position: absolute;
  border-radius: 50%;
  filter: blur(45px);
  opacity: 0.5;
  animation: drift 12s ease-in-out infinite;
}

.haze-1 {
  width: 320px;
  height: 180px;
  background: rgba(255, 255, 255, 0.55);
  top: 10%;
  left: 8%;
}

.haze-2 {
  width: 360px;
  height: 200px;
  background: rgba(255, 230, 190, 0.4);
  top: 28%;
  right: 10%;
  animation-delay: -4s;
}

.haze-3 {
  width: 320px;
  height: 180px;
  background: rgba(255, 255, 255, 0.4);
  bottom: 12%;
  left: 42%;
  animation-delay: -8s;
}

.bg-cloud {
  position: absolute;
  width: 160px;
  height: 70px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.35);
  top: calc(8% + (var(--i) * 9%));
  left: calc(-220px - (var(--i) * 35px));
  animation: fly 50s linear infinite;
  animation-delay: calc(var(--i) * -5s);
}

.bg-cloud::before,
.bg-cloud::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.35);
}

.bg-cloud::before {
  width: 84px;
  height: 84px;
  top: -28px;
  left: 22px;
}

.bg-cloud::after {
  width: 96px;
  height: 96px;
  top: -20px;
  right: 20px;
}

.weather-shell {
  position: relative;
  z-index: 1;
  width: min(1160px, 100%);
  padding: 20px;
  border-radius: 26px;
  background: rgba(6, 16, 34, 0.62);
  border: 1px solid var(--line);
  backdrop-filter: blur(8px);
  box-shadow: 0 30px 70px rgba(5, 17, 35, 0.36);
  animation: rise 0.55s ease;
}

.app-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(145deg, #2a8fe0, #2ed67e);
  display: grid;
  place-items: center;
  font-weight: 800;
}

.brand h1 {
  margin: 0;
  font-size: 1.25rem;
}

.brand p {
  margin: 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.controls {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.search {
  padding: 14px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: var(--glass-2);
  color: #fff;
  font-size: 1rem;
  outline: none;
}

.search::placeholder {
  color: rgba(255, 255, 255, 0.82);
}

.search-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.unit-toggle {
  display: inline-flex;
  background: rgba(0, 0, 0, 0.26);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 4px;
  gap: 4px;
}

.unit-btn {
  border: none;
  background: transparent;
  border-radius: 999px;
  color: #eef6ff;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 700;
}

.unit-btn.active {
  background: #2dcf73;
  color: #fff;
}

.empty-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px;
  border-radius: 22px;
  background: var(--glass);
  border: 1px solid var(--line);
}

.empty-card h2 {
  margin: 0 0 6px;
}

.empty-card p {
  margin: 0;
  color: var(--muted);
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  margin-bottom: 18px;
}

.current-card,
.side-forecast,
.cards-forecast {
  background: var(--glass);
  border: 1px solid var(--line);
  border-radius: 22px;
  padding: 18px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.current-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 12px;
}

.current-meta h2 {
  margin: 0 0 4px;
  font-size: 2rem;
}

.desc {
  margin: 0;
  color: var(--muted);
}

.temp-big {
  margin: 8px 0;
  font-size: 3.2rem;
  font-weight: 800;
}

.meta-line {
  margin: 4px 0;
  color: #eaf3ff;
}

.highlights {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.highlight {
  background: rgba(17, 44, 84, 0.5);
  border-radius: 14px;
  padding: 10px;
  display: grid;
  gap: 4px;
}

.highlight span {
  color: var(--muted);
  font-size: 0.82rem;
}

.highlight strong {
  font-size: 1.05rem;
}

.side-forecast {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.side-row {
  display: grid;
  grid-template-columns: 42px 34px 1fr auto;
  gap: 8px;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
}

.side-row:last-child {
  border-bottom: none;
}

.side-day {
  font-weight: 700;
}

.side-desc,
.side-temp {
  color: #edf4ff;
  font-size: 0.82rem;
}

.cards-forecast h3 {
  margin: 0 0 12px;
  font-size: 2rem;
  text-align: center;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.day-card {
  background: rgba(24, 52, 91, 0.65);
  border-radius: 16px;
  padding: 14px;
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 5px;
  transition: transform 0.2s ease;
}

.day-card:hover {
  transform: translateY(-3px);
}

.day-name {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.day-date,
.card-desc,
.card-rain {
  margin: 0;
  color: #edf4ff;
  font-size: 0.9rem;
}

.card-temp {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
}

.icon svg {
  width: 34px;
  height: 34px;
}

.sky-icon {
  width: 180px;
  height: 135px;
  position: relative;
}

.sun {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fff3b0, #ffb703 70%);
  position: absolute;
  top: 12px;
  right: 18px;
  box-shadow: 0 0 20px rgba(255, 183, 3, 0.65);
  animation: pulse 4s ease-in-out infinite;
}

.cloud {
  position: absolute;
  width: 96px;
  height: 42px;
  background: #dbe7ff;
  border-radius: 999px;
  top: 44px;
  left: 10px;
  box-shadow: 34px -12px 0 0 #dbe7ff;
  animation: float 6s ease-in-out infinite;
}

.cloud.c2 {
  width: 76px;
  height: 34px;
  top: 66px;
  left: 44px;
  opacity: 0.82;
  animation-delay: -2s;
}

.rain {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.drop {
  position: absolute;
  width: 3px;
  height: 11px;
  background: #4fc3f7;
  border-radius: 999px;
  left: calc(8px + (var(--i) * 13px));
  top: 84px;
  animation: fall 1.25s linear infinite;
  animation-delay: calc(var(--i) * -0.14s);
  opacity: 0.7;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(8px);
  }
}

@keyframes fall {
  0% {
    transform: translateY(0);
    opacity: 0.65;
  }
  100% {
    transform: translateY(18px);
    opacity: 0;
  }
}

@keyframes fly {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(100vw + 520px));
  }
}

@keyframes drift {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(14px);
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1080px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .app {
    padding: 14px;
  }

  .controls {
    grid-template-columns: 1fr;
  }

  .current-layout {
    grid-template-columns: 1fr;
  }

  .sky-icon {
    margin: 0 auto;
  }

  .highlights {
    grid-template-columns: 1fr;
  }

  .cards-grid {
    grid-template-columns: 1fr 1fr;
  }

  .cards-forecast h3 {
    font-size: 1.6rem;
  }
}

@media (max-width: 520px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .side-row {
    grid-template-columns: 35px 32px 1fr;
  }

  .side-temp {
    grid-column: 3;
  }
}
</style>
