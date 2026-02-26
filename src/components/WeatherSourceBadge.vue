<script setup>
import { computed } from 'vue'

const props = defineProps({
  source: {
    type: String,
    default: null
  },
  timestamp: {
    type: Number,
    default: null
  }
})

const label = computed(() => {
  if (props.source === 'cache') return 'Cached Data'
  if (props.source === 'stale-cache') return 'Stale Cached Data (Offline Mode)'
  return 'Live Data'
})

const details = computed(() => {
  if (!props.timestamp) return ''
  if (props.source === 'cache' || props.source === 'stale-cache') {
    return `Showing cached data from ${new Date(props.timestamp).toLocaleString()}`
  }
  return `Updated ${new Date(props.timestamp).toLocaleString()}`
})
</script>

<template>
  <div class="recent-searches" v-if="source">
    <span class="recent-chip">{{ label }}</span>
    <span class="recent-chip" v-if="details">{{ details }}</span>
  </div>
</template>
