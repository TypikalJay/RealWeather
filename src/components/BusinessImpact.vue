<script setup>
import { computed, toRef } from 'vue'
import { useBusinessImpact } from '@/composables/useBusinessImpact'

const props = defineProps({
  weather: {
    type: Object,
    default: null
  }
})

const { score, status, color, advisory } = useBusinessImpact(toRef(props, 'weather'))

const radius = 78
const viewBoxSize = 200
const center = viewBoxSize / 2
const circumference = 2 * Math.PI * radius

const dashOffset = computed(() => circumference - (score.value / 100) * circumference)
const currentDashArray = computed(() => `${(circumference * 0.16).toFixed(2)} ${circumference.toFixed(2)}`)

const glowClass = computed(() => {
  if (color.value === 'emerald') return 'drop-shadow-[0_0_34px_rgba(34,197,94,0.75)]'
  if (color.value === 'yellow') return 'drop-shadow-[0_0_34px_rgba(250,204,21,0.72)]'
  return 'drop-shadow-[0_0_34px_rgba(239,68,68,0.72)]'
})

const haloClass = computed(() => {
  if (color.value === 'emerald') return 'bg-emerald-400/25'
  if (color.value === 'yellow') return 'bg-yellow-400/22'
  return 'bg-red-400/22'
})

const pulseClass = computed(() =>
  score.value >= 90 || score.value <= 40
    ? 'animate-[softPulse_3s_ease-in-out_infinite]'
    : ''
)
</script>

<template>
  <section class="relative">
    <div
      class="relative z-10 backdrop-blur-2xl bg-white/20 border border-white/30 shadow-[0_0_40px_rgba(0,0,0,0.4)] rounded-3xl p-8 text-center flex flex-col items-center"
    >
      <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

      <div class="relative z-10 w-[250px] h-[250px] sm:w-[280px] sm:h-[280px] mb-6" :class="pulseClass">
        <div
          class="absolute inset-0 m-auto w-64 h-64 rounded-full blur-2xl ring-halo-breathe"
          :class="haloClass"
        ></div>
        <svg
          class="relative z-10 w-full h-full -rotate-90 transition-all duration-1000 ease-out ring-breathe"
          :class="glowClass"
          :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`"
        >
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#34d399" />
              <stop offset="100%" stop-color="#10b981" />
            </linearGradient>
          </defs>
          <circle
            :r="radius"
            :cx="center"
            :cy="center"
            fill="transparent"
            stroke="rgba(255,255,255,0.15)"
            stroke-width="20"
          />
          <circle
            :r="radius"
            :cx="center"
            :cy="center"
            fill="transparent"
            stroke="url(#ringGradient)"
            stroke-width="20"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            stroke-linecap="round"
            class="opacity-95 transition-all duration-1000 ease-out"
          />
          <circle
            :r="radius"
            :cx="center"
            :cy="center"
            fill="transparent"
            stroke="rgba(255,255,255,0.95)"
            stroke-width="8"
            :stroke-dasharray="currentDashArray"
            stroke-linecap="round"
            class="ring-current"
          />
        </svg>
      </div>

      <div class="relative z-10 w-full max-w-2xl mx-auto mt-6 bg-slate-100 dark:bg-slate-800 rounded-2xl px-8 py-6 shadow-md">
        <span class="block text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white text-center">
          {{ score }}
        </span>
        <h2 class="text-lg sm:text-xl font-bold mt-3 text-center text-slate-800 dark:text-slate-100">
          {{ status }}
        </h2>
        <p class="text-base mt-3 text-center text-slate-600 dark:text-slate-300">
          {{ advisory }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes softPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

@keyframes ringGlowBreathe {
  0%,
  100% {
    transform: scale(1);
    filter: brightness(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.02);
    filter: brightness(1.15);
    opacity: 1;
  }
}

@keyframes haloBreathe {
  0%,
  100% {
    transform: scale(0.95);
    opacity: 0.55;
  }
  50% {
    transform: scale(1.07);
    opacity: 0.95;
  }
}

@keyframes currentFlow {
  from {
    stroke-dashoffset: 0;
    opacity: 0.25;
  }
  35% {
    opacity: 0.95;
  }
  to {
    stroke-dashoffset: -520;
    opacity: 0.25;
  }
}

.ring-breathe {
  animation: ringGlowBreathe 2.6s ease-in-out infinite;
}

.ring-halo-breathe {
  animation: haloBreathe 2.8s ease-in-out infinite;
}

.ring-current {
  animation: currentFlow 2.2s linear infinite;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.85));
}
</style>
