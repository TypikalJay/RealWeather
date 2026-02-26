<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  profile: {
    type: Object,
    default: () => ({ label: '', confidence: 0, reasoning: '' })
  },
  recommendations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['open-dashboard', 'dismiss'])

const topRecommendations = computed(() => props.recommendations.slice(0, 3))
const confidenceWidth = computed(() => {
  const value = Number(props.profile?.confidence ?? 0)
  return `${Math.max(0, Math.min(100, value))}%`
})
</script>

<template>
  <transition name="brief-fade">
    <div v-if="open" class="brief-overlay" role="dialog" aria-modal="true" aria-label="Performance Brief">
      <div class="brief-card">
        <h3 class="brief-title">Performance Brief</h3>
        <p class="brief-profile"><strong>{{ profile.label }}</strong></p>
        <p class="brief-reasoning">{{ profile.reasoning }}</p>

        <div class="brief-list">
          <p
            v-for="(item, index) in topRecommendations"
            :key="'brief-rec-' + index"
            class="brief-item"
          >
            <strong>{{ item.type }}</strong>: {{ item.message }}
          </p>
        </div>

        <div class="brief-confidence">
          <p class="brief-confidence-text">Confidence {{ profile.confidence }}%</p>
          <div class="brief-track">
            <div class="brief-fill" :style="{ width: confidenceWidth }"></div>
          </div>
        </div>

        <div class="brief-actions">
          <button type="button" class="brief-btn brief-btn-primary" @click="emit('open-dashboard')">
            Open Dashboard
          </button>
          <button type="button" class="brief-btn" @click="emit('dismiss')">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.brief-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(4, 12, 24, 0.48);
  backdrop-filter: blur(4px);
}

.brief-card {
  width: min(640px, 100%);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(10, 24, 46, 0.92);
  color: #e9f2ff;
  padding: 18px;
}

.brief-title {
  margin: 0 0 10px;
  font-size: 1.05rem;
}

.brief-profile,
.brief-reasoning,
.brief-item,
.brief-confidence-text {
  margin: 0;
  font-size: 0.92rem;
}

.brief-profile {
  margin-bottom: 6px;
}

.brief-reasoning {
  color: rgba(233, 242, 255, 0.85);
  margin-bottom: 10px;
}

.brief-list {
  display: grid;
  gap: 8px;
  margin-bottom: 10px;
}

.brief-item {
  color: rgba(233, 242, 255, 0.9);
}

.brief-confidence {
  margin-bottom: 14px;
}

.brief-confidence-text {
  margin-bottom: 6px;
  color: rgba(233, 242, 255, 0.86);
}

.brief-track {
  height: 4px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.26);
  overflow: hidden;
}

.brief-fill {
  height: 100%;
  background: rgba(125, 211, 252, 0.58);
  transition: width 300ms ease;
}

.brief-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.brief-btn {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
  color: #e9f2ff;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 0.88rem;
  cursor: pointer;
}

.brief-btn-primary {
  background: rgba(45, 207, 115, 0.24);
  border-color: rgba(45, 207, 115, 0.52);
}

.brief-fade-enter-active,
.brief-fade-leave-active {
  transition: opacity 0.22s ease;
}

.brief-fade-enter-from,
.brief-fade-leave-to {
  opacity: 0;
}
</style>
