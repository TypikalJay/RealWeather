import { computed, defineComponent, h } from 'vue'
import { generateDailySummary } from '@/utils/forecastIntelligence'

export default defineComponent({
  name: 'DailyWeatherSummary',
  props: {
    summary: {
      type: String,
      default: ''
    },
    weatherData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const text = computed(() => {
      if (props.summary && props.summary.trim()) return props.summary.trim()
      return generateDailySummary((props.weatherData as Record<string, unknown>) || {})
    })

    return () =>
      h('p', { class: 'daily-weather-summary' }, text.value)
  }
})
