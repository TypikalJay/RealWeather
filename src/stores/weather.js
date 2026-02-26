import { defineStore } from 'pinia'

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    currentWeather: null,
    forecast: [],
    hourlyForecast: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchWeather(city) {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY

      try {
        this.loading = true
        this.error = null

        const currentRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        )

        const currentData = await currentRes.json()

        if (!currentRes.ok) {
          if (currentRes.status === 404) {
            throw new Error('City not found. Please try another location.')
          }
          throw new Error(currentData.message || 'Unable to fetch weather data.')
        }

        this.currentWeather = currentData

        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
        )

        const forecastData = await forecastRes.json()

        if (!forecastRes.ok) {
          throw new Error(forecastData.message || 'Unable to fetch forecast data.')
        }

        this.forecast = forecastData.list.filter((_, index) => index % 8 === 0)
        this.hourlyForecast = forecastData.list.slice(0, 4)
      } catch (error) {
        if (error instanceof TypeError) {
          this.error = 'Network error. Check your connection and try again.'
        } else {
          this.error = error.message || 'Something went wrong while fetching weather data.'
        }
        console.error('Weather fetch error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchWeatherByCoords(lat, lon) {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY

      try {
        this.loading = true
        this.error = null

        const currentRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        )

        const currentData = await currentRes.json()

        if (!currentRes.ok) {
          if (currentRes.status === 404) {
            throw new Error('Location not found. Please try a different search.')
          }
          throw new Error(currentData.message || 'Unable to fetch location weather.')
        }

        this.currentWeather = currentData

        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        )

        const forecastData = await forecastRes.json()

        if (!forecastRes.ok) {
          throw new Error(forecastData.message || 'Unable to fetch forecast data.')
        }

        this.forecast = forecastData.list.filter((_, index) => index % 8 === 0)
        this.hourlyForecast = forecastData.list.slice(0, 4)
      } catch (error) {
        if (error instanceof TypeError) {
          this.error = 'Network error. Check your connection and try again.'
        } else {
          this.error = error.message || 'Something went wrong while fetching weather data.'
        }
        console.error('Weather fetch by coordinates error:', error)
      } finally {
        this.loading = false
      }
    }
  }
})
