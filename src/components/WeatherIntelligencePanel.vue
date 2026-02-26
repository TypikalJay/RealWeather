<script setup>
import { computed } from 'vue'

const props = defineProps({
  profile: {
    type: Object,
    default: () => ({ label: 'Strategic Day', confidence: 0, reasoning: '' })
  },
  strategicAngle: {
    type: String,
    default: ''
  },
  recommendations: {
    type: Array,
    default: () => []
  },
  error: {
    type: String,
    default: null
  }
})

const confidenceWidth = computed(() => {
  const value = Number(props.profile?.confidence ?? 0)
  return `${Math.max(0, Math.min(100, value))}%`
})

const meterClass = computed(() =>
  props.profile?.label === 'Environmental Risk Day'
    ? 'meter-fill meter-severe'
    : 'meter-fill'
)
</script>

<template>
  <section class="cards-forecast" v-if="!error">
    <h3>Productivity Intelligence</h3>
    <div class="forecast-list">
      <article class="forecast-row">
        <p class="meta-line"><strong>{{ profile.label }}</strong></p>
      </article>
      <article class="forecast-row">
        <p class="meta-line">{{ profile.reasoning }}</p>
      </article>
      <article class="forecast-row" v-if="strategicAngle">
        <p class="meta-line">{{ strategicAngle }}</p>
      </article>
      <article
        class="forecast-row"
        v-for="(item, index) in recommendations"
        :key="'biz-rec-' + index"
      >
        <p class="meta-line"><strong>{{ item.type }}</strong>: {{ item.message }}</p>
      </article>
      <article class="forecast-row">
        <div class="confidence-wrap">
          <p class="meta-line confidence-text">Confidence {{ profile.confidence }}%</p>
          <div class="confidence-track">
            <div :class="meterClass" :style="{ width: confidenceWidth }"></div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.confidence-wrap {
  width: 100%;
}

.confidence-text {
  margin: 0 0 8px;
}

.confidence-track {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.28);
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: rgba(125, 211, 252, 0.58);
  transition: width 320ms ease;
}

.meter-severe {
  background: rgba(248, 113, 113, 0.68);
}
</style>
