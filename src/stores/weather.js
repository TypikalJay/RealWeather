import { defineStore } from 'pinia'

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    currentWeather: null,
    forecast: []
  }),

  actions: {
    async fetchWeather(city) {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY

      try {
        // --- CURRENT WEATHER
        const currentRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        )

        const currentData = await currentRes.json()

        if (!currentRes.ok) {
          throw new Error(currentData.message || 'City not found')
        }

        this.currentWeather = currentData

        // --- FORECAST
        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
        )

        const forecastData = await forecastRes.json()

        if (!forecastRes.ok) {
          throw new Error(forecastData.message || 'Forecast error')
        }

        // OpenWeather gives data every 3 hours → 8 entries = 1 day
        this.forecast = forecastData.list.filter((_, index) => index % 8 === 0)

      } catch (error) {
        alert(error.message)
        console.error('Weather fetch error:', error)
      }
    }
  }
})