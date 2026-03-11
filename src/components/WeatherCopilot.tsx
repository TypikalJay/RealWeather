import { computed, defineComponent, h } from 'vue'

type HourlyPoint = {
  dt_txt?: string
  dt?: number
  pop?: number
  main?: {
    temp?: number
    humidity?: number
  }
  wind?: {
    speed?: number
  }
  weather?: Array<{ main?: string }>
}

type WeatherDataInput = {
  currentWeather?: {
    main?: { temp?: number; humidity?: number }
    wind?: { speed?: number }
    weather?: Array<{ main?: string }>
    uvi?: number
    uvIndex?: number
  } | null
  hourlyForecast?: HourlyPoint[]
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function toHour24(slot: HourlyPoint): number {
  if (slot?.dt_txt) {
    const parsed = new Date(String(slot.dt_txt).replace(' ', 'T'))
    if (!Number.isNaN(parsed.getTime())) return parsed.getHours()
  }
  if (slot?.dt) {
    const parsed = new Date(Number(slot.dt) * 1000)
    if (!Number.isNaN(parsed.getTime())) return parsed.getHours()
  }
  return -1
}

export function generateCopilotMessage(weatherData: WeatherDataInput = {}): string {
  const current = weatherData.currentWeather || {}
  const hourly = Array.isArray(weatherData.hourlyForecast) ? weatherData.hourlyForecast : []

  const condition = String(current?.weather?.[0]?.main || '').toLowerCase()
  const uvIndex = toNumber(current?.uvi ?? current?.uvIndex, 0)

  const morningSlots = hourly.filter((slot) => {
    const hour = toHour24(slot)
    return hour >= 6 && hour <= 11
  })
  const middaySlots = hourly.filter((slot) => {
    const hour = toHour24(slot)
    return hour >= 11 && hour <= 15
  })
  const lateSlots = hourly.filter((slot) => {
    const hour = toHour24(slot)
    return hour >= 15 && hour <= 21
  })

  const morningTemp =
    morningSlots.length > 0
      ? morningSlots.reduce((sum, slot) => sum + toNumber(slot?.main?.temp), 0) / morningSlots.length
      : toNumber(current?.main?.temp, 0)
  const middayTempPeak = middaySlots.reduce(
    (max, slot) => Math.max(max, toNumber(slot?.main?.temp, morningTemp)),
    morningTemp
  )
  const lateRainRisk = lateSlots.reduce(
    (max, slot) => Math.max(max, Math.round(toNumber(slot?.pop, 0) * 100)),
    0
  )
  const lateWindPeak = lateSlots.reduce(
    (max, slot) => Math.max(max, toNumber(slot?.wind?.speed, toNumber(current?.wind?.speed, 0))),
    toNumber(current?.wind?.speed, 0)
  )
  const humidity = toNumber(current?.main?.humidity, 0)

  const morningSummary =
    morningTemp >= 18 && morningTemp <= 25
      ? 'Today starts comfortable with mild morning temperatures.'
      : morningTemp > 28
        ? 'Today starts warm early, so pace outdoor work carefully through the morning.'
        : 'Today starts on the cooler side, which is useful for focused outdoor tasks early.'

  let middayInsight = 'Around midday, conditions remain fairly manageable for most plans.'
  if (uvIndex > 7) {
    middayInsight = 'UV levels rise around midday, so sun protection is recommended for extended outdoor activity.'
  } else if (middayTempPeak >= 31 || humidity >= 70) {
    middayInsight = 'Midday comfort may dip from heat or humidity, so shorter active blocks and hydration help.'
  } else if (middayTempPeak >= 18 && middayTempPeak <= 25) {
    middayInsight = 'Midday stays in a productivity-friendly temperature range for consistent outdoor progress.'
  }

  let lateDayForecast = 'Late-day weather looks relatively steady with low disruption risk.'
  if (lateRainRisk > 50) {
    lateDayForecast = 'Rain chances increase later this afternoon, so complete outdoor tasks before that window.'
  } else if (lateWindPeak > 30) {
    lateDayForecast = 'Winds pick up later in the day and may reduce outdoor comfort or setup stability.'
  } else if (lateSlots.length > 0) {
    const lateAvgTemp =
      lateSlots.reduce((sum, slot) => sum + toNumber(slot?.main?.temp, morningTemp), 0) / lateSlots.length
    if (lateAvgTemp <= morningTemp - 3) {
      lateDayForecast = 'Temperatures cool later today, making late afternoon better for outdoor comfort.'
    }
  }

  if (condition.includes('thunder') || condition.includes('storm')) {
    lateDayForecast = 'Unstable storm signals are present, so keep outdoor plans flexible into the late day.'
  }

  const sentenceOne = `${morningSummary.replace(/\.$/, '')} ${middayInsight.charAt(0).toLowerCase()}${middayInsight.slice(1)}`
  const sentenceTwo = lateDayForecast
  return `${sentenceOne.replace(/\s+/g, ' ').trim()} ${sentenceTwo}`.trim()
}

export default defineComponent({
  name: 'WeatherCopilot',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    weatherData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const message = computed(() => generateCopilotMessage((props.weatherData as WeatherDataInput) || {}))

    return () =>
      h(
        'section',
        {
          class:
            'weather-copilot-card relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur p-6 shadow-lg border border-white/15'
        },
        [
          h('div', {
            class:
              'pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-gradient-to-br from-white/25 to-transparent blur-2xl'
          }),
          h('div', { class: 'relative z-10 flex items-start justify-between gap-3' }, [
            h('div', { class: 'min-w-0' }, [
              h('h3', { class: 'm-0 text-[22px] font-semibold text-white' }, 'Weather Copilot'),
              h(
                'p',
                { class: 'mt-1 mb-0 text-xs text-white/75' },
                "AI explanation of today's conditions"
              )
            ]),
            h('span', {
              class:
                'mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse'
            })
          ]),
          props.loading
            ? h(
                'p',
                { class: 'relative z-10 mt-4 mb-0 text-sm leading-relaxed text-white/80' },
                'Generating today’s weather guidance...'
              )
            : h('p', { class: 'relative z-10 mt-4 mb-0 text-sm leading-relaxed text-white/90' }, message.value)
        ]
      )
  }
})
