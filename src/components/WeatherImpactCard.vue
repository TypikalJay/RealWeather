<template>
  <div class="weather-impact-card">
    <h3>Weather Impact Score</h3>
    
    <div class="impact-content">
      <!-- Top: Impact Score Circle -->
      <div class="score-ring">
        <svg class="ring-svg" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            stroke-width="8"
          />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            :stroke="ringColor"
            stroke-width="8"
            stroke-linecap="round"
            transform="rotate(-90 100 100)"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            class="ring-progress"
          />
          <text x="100" y="110" text-anchor="middle" class="ring-score">
            {{ impactScore?.score ?? 0 }}
          </text>
        </svg>
      </div>
      
      <!-- Middle: Score Number and Description -->
      <div class="score-label">
        <div class="score-number">{{ impactScore?.score ?? 0 }}</div>
        <div class="score-text">{{ impactScore?.label || 'Unknown' }}</div>
        <div class="score-conditions">{{ impactScore?.explanation || 'Weather conditions are being assessed.' }}</div>
      </div>
    </div>
    
    <!-- Bottom: Impact Factor Grid -->
    <div class="impact-factors">
      <div class="factors-title">Impact Factors</div>
      <div class="factors-grid">
        <div class="factor-chip">
          <span class="factor-label">Rain</span>
          <span class="factor-value">{{ currentWeather?.rain?.['3h'] || currentWeather?.rain?.['1h'] || '0.0' }} mm</span>
        </div>
        <div class="factor-chip">
          <span class="factor-label">Wind</span>
          <span class="factor-value">{{ currentWeather?.wind?.speed || 0 }} km/h</span>
        </div>
        <div class="factor-chip">
          <span class="factor-label">Temp</span>
          <span class="factor-value">{{ Math.round(currentWeather?.main?.temp || 0) }}&deg;{{ unitSymbol }}</span>
        </div>
        <div class="factor-chip">
          <span class="factor-label">Pressure</span>
          <span class="factor-value">{{ currentWeather?.main?.pressure && currentWeather?.main?.pressure > 0 ? currentWeather?.main?.pressure : 'N/A' }} hPa</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  impactScore: {
    type: Object,
    default: () => ({ score: 0, label: 'Unknown' })
  },
  currentWeather: {
    type: Object,
    default: null
  },
  trendIndicators: {
    type: Object,
    default: () => ({})
  },
  unitSymbol: {
    type: String,
    default: 'C'
  }
})

const circumference = 2 * Math.PI * 70
const dashOffset = computed(() => {
  const score = props.impactScore?.score ?? 0
  return circumference - (score / 100) * circumference
})

const ringColor = computed(() => {
  const score = props.impactScore?.score ?? 0
  if (score >= 85) return '#10b981' // green
  if (score >= 70) return '#3b82f6' // blue
  if (score >= 50) return '#f59e0b' // yellow
  if (score >= 30) return '#f97316' // orange
  return '#ef4444' // red
})

const recommendationText = computed(() => {
  return props.impactScore?.explanation || 'Weather conditions are being assessed.'
})
</script>

<style scoped>
.weather-impact-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.weather-impact-card h3 {
  margin: 0 0 20px 0;
  font-size: 22px;
  font-weight: 600;
  color: white;
}

.impact-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

/* Top: Impact Score Circle */
.score-ring {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.ring-svg {
  width: 140px;
  height: 140px;
}

.ring-progress {
  transition: stroke-dashoffset 0.5s ease;
}

.ring-score {
  font-size: 28px;
  font-weight: 700;
  fill: white;
}

/* Middle: Score Number and Description */
.score-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
}

.score-number {
  font-size: 42px;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 4px;
}

.score-text {
  font-size: 18px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.score-conditions {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  max-width: 280px;
  line-height: 1.4;
}

/* Bottom: Impact Factor Grid */
.impact-factors {
  display: flex;
  flex-direction: column;
}

.factors-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
}

.factors-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.factor-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  transition: all 0.2s ease;
  height: 100px;
}

.factor-chip:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.factor-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.factor-value {
  font-size: 16px;
  font-weight: 600;
  color: white;
  line-height: 1;
}

@media (max-width: 768px) {
  .impact-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .score-display {
    justify-content: center;
  }
  
  .indicators {
    align-items: center;
  }
  
  .ring-svg {
    width: 120px;
    height: 120px;
  }
}
</style>
