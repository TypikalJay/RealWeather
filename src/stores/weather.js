import { defineStore } from 'pinia'
import { fetchWeatherBundle } from '@/services/weatherApi'
import { normalizeWeather } from '@/services/weatherNormalizer'
import { generateWeatherInsights } from '@/services/weatherInsights'
import {
  calculateImpactScore,
  computeTrendIndicators,
  generateActivityRecommendations
} from '@/services/weatherProductMetrics'
import {
  buildBusinessRecommendations,
  buildProductivityProfile,
  buildStrategicAngle
} from '@/services/weatherIntelligence'

let activeRequestId = 0
let activeController = null

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    currentWeather: null,
    forecast: [],
    hourlyForecast: [],
    hourlyTrend: [],
    insights: [],
    impactScore: {
      score: 0,
      label: 'Severe'
    },
    activityRecommendations: [],
    trendIndicators: {
      temperature: 'flat',
      humidity: 'flat'
    },
    productivityProfile: {
      label: 'Strategic Day',
      confidence: 0,
      reasoning: ''
    },
    businessRecommendations: [],
    strategicAngle: '',
    loading: false,
    error: null,
    lastSource: null,
    lastUpdatedAt: null
  }),

  actions: {
    async fetchWeatherByParams(params) {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY
      const requestId = ++activeRequestId

      if (activeController) {
        activeController.abort()
      }
      activeController = new AbortController()

      this.loading = true
      this.error = null

      try {
        const bundle = await fetchWeatherBundle(params, apiKey, {
          signal: activeController.signal
        })

        if (requestId !== activeRequestId) {
          return
        }

        const normalized = normalizeWeather(bundle.current, bundle.forecast)

        this.currentWeather = normalized.current
        this.forecast = normalized.dailySummaries
        this.hourlyForecast = normalized.hourlyNext12
        this.hourlyTrend = normalized.hourlyNext24
        this.insights = generateWeatherInsights(normalized)
        this.impactScore = calculateImpactScore(normalized)
        this.trendIndicators = computeTrendIndicators(normalized)
        this.activityRecommendations = generateActivityRecommendations(normalized, this.insights)
        this.productivityProfile = buildProductivityProfile({
          normalizedWeather: normalized,
          impactScore: this.impactScore,
          insights: this.insights
        })
        this.businessRecommendations = buildBusinessRecommendations({
          normalizedWeather: normalized,
          impactScore: this.impactScore,
          insights: this.insights
        })
        this.strategicAngle = buildStrategicAngle({
          profile: this.productivityProfile,
          recommendations: this.businessRecommendations
        })
        this.lastSource = bundle.source || 'network'
        this.lastUpdatedAt = bundle.servedAt ?? Date.now()
      } catch (error) {
        if (error?.name === 'AbortError') {
          return
        }

        if (requestId !== activeRequestId) {
          return
        }

        if (error instanceof TypeError) {
          this.error = 'Network error. Check your connection and try again.'
        } else {
          this.error = error?.message || 'Something went wrong while fetching weather data.'
        }

        console.error('[weather-store] fetch failed', {
          params,
          message: error?.message,
          error
        })
      } finally {
        if (requestId === activeRequestId) {
          this.loading = false
        }
      }
    },

    async fetchWeather(city) {
      return this.fetchWeatherByParams({ q: city })
    },

    async fetchWeatherByCoords(lat, lon) {
      return this.fetchWeatherByParams({ lat: String(lat), lon: String(lon) })
    }
  }
})
