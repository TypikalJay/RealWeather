<script setup>
defineProps({
  insights: {
    type: Array,
    default: () => []
  },
  error: {
    type: String,
    default: null
  }
})

function levelClass(level) {
  if (level === 'severe') return 'insight-severe'
  if (level === 'warning') return 'insight-warning'
  return 'insight-normal'
}
</script>

<template>
  <section class="cards-forecast" v-if="insights.length && !error">
    <h3>Weather Insights</h3>
    <div class="forecast-list">
      <article
        class="forecast-row"
        v-for="(insight, index) in insights"
        :key="'insight-' + index"
        :class="levelClass(insight.level)"
      >
        <p class="meta-line">{{ insight.message }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.insight-normal {
  border-left: 3px solid rgba(45, 212, 191, 0.5);
}

.insight-warning {
  border-left: 3px solid rgba(250, 204, 21, 0.7);
}

.insight-severe {
  border-left: 3px solid rgba(248, 113, 113, 0.85);
  background: rgba(248, 113, 113, 0.08);
}
</style>
