<template>
  <div class="demand-forecast-card">
    <h3>Demand Forecast</h3>
    
    <div class="demand-content">
      <div class="demand-grid">
        <!-- Outdoor Activities -->
        <div class="demand-category">
          <div class="category-header">
            <span class="category-icon">🏃</span>
            <span class="category-name">Outdoor Activities</span>
          </div>
          <div class="demand-prediction">
            <span class="demand-arrow">{{ getDemandArrow(outdoorDemand) }}</span>
            <span class="demand-label">{{ getDemandLabel(outdoorDemand) }}</span>
          </div>
        </div>
        
        <!-- Restaurants -->
        <div class="demand-category">
          <div class="category-header">
            <span class="category-icon">🍽</span>
            <span class="category-name">Restaurants</span>
          </div>
          <div class="demand-prediction">
            <span class="demand-arrow">{{ getDemandArrow(restaurantDemand) }}</span>
            <span class="demand-label">{{ getDemandLabel(restaurantDemand) }}</span>
          </div>
        </div>
        
        <!-- Retail -->
        <div class="demand-category">
          <div class="category-header">
            <span class="category-icon">🛍</span>
            <span class="category-name">Retail</span>
          </div>
          <div class="demand-prediction">
            <span class="demand-arrow">{{ getDemandArrow(retailDemand) }}</span>
            <span class="demand-label">{{ getDemandLabel(retailDemand) }}</span>
          </div>
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
  }
})

const outdoorDemand = computed(() => {
  const score = props.impactScore?.score || 0
  const rainChance = props.currentWeather?.rain?.chance || 0
  
  // High impact score and low rain = good for outdoor activities
  if (score >= 70 && rainChance < 30) {
    return 'high'
  } else if (score >= 50 && rainChance < 50) {
    return 'normal'
  } else if (rainChance > 60 || score < 40) {
    return 'low'
  } else {
    return 'normal'
  }
})

const restaurantDemand = computed(() => {
  const score = props.impactScore?.score || 0
  const rainChance = props.currentWeather?.rain?.chance || 0
  
  // Bad weather drives people to restaurants
  if (score < 40 || rainChance > 50) {
    return 'high'
  } else if (score < 60 || rainChance > 30) {
    return 'normal'
  } else {
    return 'low'
  }
})

const retailDemand = computed(() => {
  const score = props.impactScore?.score || 0
  
  // Retail is less weather-sensitive, more stable
  if (score >= 60) {
    return 'normal'
  } else if (score >= 40) {
    return 'low'
  } else {
    return 'normal'
  }
})

function getDemandArrow(demand) {
  if (demand === 'high') return '↑'
  if (demand === 'low') return '↓'
  return '→'
}

function getDemandLabel(demand) {
  switch (demand) {
    case 'high':
      return 'High demand'
    case 'low':
      return 'Low demand'
    case 'normal':
      return 'Normal demand'
    default:
      return 'Normal demand'
  }
}
</script>

<style scoped>
.demand-forecast-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.demand-forecast-card h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.demand-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.demand-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.demand-category {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.demand-category:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.category-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.demand-prediction {
  display: flex;
  align-items: center;
  gap: 8px;
}

.demand-arrow {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.demand-arrow.up {
  color: rgba(34, 197, 94, 0.9);
}

.demand-arrow.down {
  color: rgba(239, 68, 68, 0.9);
}

.demand-arrow.stable {
  color: rgba(255, 255, 255, 0.8);
}

.demand-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 768px) {
  .demand-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .demand-category {
    padding: 16px;
  }
  
  .category-header {
    margin-bottom: 8px;
  }
  
  .demand-forecast-card h3 {
    font-size: 18px;
  }
}
</style>
