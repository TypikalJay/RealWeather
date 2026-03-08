<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const props = defineProps({
  points: {
    type: Array,
    default: () => []
  },
  unitSymbol: {
    type: String,
    default: 'C'
  }
})

const isDarkMode = ref(false)

function checkTheme() {
  isDarkMode.value = document.documentElement.classList.contains('dark')
}

onMounted(() => {
  checkTheme()
  const observer = new MutationObserver(checkTheme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  onUnmounted(() => observer.disconnect())
})

function formatHour(value) {
  if (!value) return ''
  return new Date(value.replace(' ', 'T'))
    .toLocaleTimeString([], { hour: 'numeric', hour12: true })
    .replace(/\s/g, '')
    .toUpperCase()
}

const labels = computed(() => props.points.map((point) => formatHour(point.dt_txt)))

const temperatureValues = computed(() =>
  props.points.map((point) => Number(point?.main?.temp ?? 0))
)

const rainValues = computed(() =>
  props.points.map((point) =>
    Number(point?.rain?.['3h'] ?? 0) + Number(point?.snow?.['3h'] ?? 0)
  )
)

const temperatureChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: `Temperature (deg ${props.unitSymbol})`,
      data: temperatureValues.value,
      borderColor: isDarkMode.value ? '#22c55e' : '#0ea5e9',
      backgroundColor: isDarkMode.value ? 'rgba(34, 197, 94, 0.15)' : 'rgba(14, 165, 233, 0.15)',
      tension: 0.35,
      pointRadius: 2,
      borderWidth: 2
    }
  ]
}))

const rainChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Rain/Snow (mm)',
      data: rainValues.value,
      borderColor: isDarkMode.value ? '#38bdf8' : '#0284c7',
      backgroundColor: isDarkMode.value ? 'rgba(56, 189, 248, 0.16)' : 'rgba(2, 132, 199, 0.16)',
      tension: 0.3,
      pointRadius: 2,
      borderWidth: 2
    }
  ]
}))

const CHART_OPTIONS = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: isDarkMode.value ? '#dbeafe' : '#1f2937'
      }
    }
  },
  scales: {
    x: {
      ticks: { color: isDarkMode.value ? '#bfdbfe' : '#4b5563' },
      grid: { color: isDarkMode.value ? 'rgba(191, 219, 254, 0.14)' : 'rgba(75, 85, 99, 0.14)' }
    },
    y: {
      ticks: { color: isDarkMode.value ? '#bfdbfe' : '#4b5563' },
      grid: { color: isDarkMode.value ? 'rgba(191, 219, 254, 0.14)' : 'rgba(75, 85, 99, 0.14)' }
    }
  }
}))
</script>

<template>
  <section v-if="points.length" class="cards-forecast">
    <h3>24-Hour Trends</h3>
    <div style="height: 220px; margin-bottom: 16px;">
      <Line :data="temperatureChartData" :options="CHART_OPTIONS" />
    </div>
    <div style="height: 220px;">
      <Line :data="rainChartData" :options="CHART_OPTIONS" />
    </div>
  </section>
</template>
