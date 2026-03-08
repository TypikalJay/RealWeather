<template>
  <div class="weather-insights">
    <h3>Weather Insights</h3>
    
    <div class="insights-content">
      <div 
        v-for="insight in displayInsights" 
        :key="insight.message"
        class="insight-item"
        :class="insight.level || 'normal'"
      >
        <div class="insight-icon">
          <span v-if="insight.level === 'severe'">⚠️</span>
          <span v-else-if="insight.level === 'warning'">⚡</span>
          <span v-else-if="insight.type === 'weather-alert'">🌧️</span>
          <span v-else>💡</span>
        </div>
        <div class="insight-text">
          <p>{{ insight.message }}</p>
        </div>
      </div>
      
      <div v-if="!displayInsights.length" class="no-insights">
        <p>No weather insights available at this time.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  insights: {
    type: Array,
    default: () => []
  },
  currentWeather: {
    type: Object,
    default: null
  }
})

const displayInsights = computed(() => {
  const allInsights = [...props.insights]
  
  // Add additional insights based on current weather
  if (props.currentWeather) {
    const temp = props.currentWeather.main?.temp
    const humidity = props.currentWeather.main?.humidity
    const windSpeed = props.currentWeather.wind?.speed
    const condition = props.currentWeather.weather?.[0]?.main
    
    // Temperature insights
    if (temp > 35) {
      allInsights.push({
        message: 'Extreme heat detected. Stay hydrated and avoid prolonged outdoor exposure.',
        level: 'severe'
      })
    } else if (temp < 0) {
      allInsights.push({
        message: 'Freezing conditions. Bundle up and watch for icy surfaces.',
        level: 'warning'
      })
    } else if (temp >= 25 && temp <= 28) {
      allInsights.push({
        message: 'Pleasant temperature range. Great conditions for outdoor activities.',
        level: 'normal'
      })
    }
    
    // Humidity insights
    if (humidity > 80) {
      allInsights.push({
        message: 'Very high humidity may make temperatures feel warmer than actual.',
        level: 'normal'
      })
    } else if (humidity < 30) {
      allInsights.push({
        message: 'Low humidity conditions. Consider moisturizing and staying hydrated.',
        level: 'normal'
      })
    }
    
    // Wind insights
    if (windSpeed > 20) {
      allInsights.push({
        message: 'Strong winds detected. Secure loose objects and exercise caution outdoors.',
        level: 'warning'
      })
    }
    
    // Condition insights
    if (condition === 'Clear') {
      allInsights.push({
        message: 'Clear skies expected. Excellent visibility and good solar conditions.',
        level: 'normal'
      })
    } else if (condition === 'Clouds') {
      allInsights.push({
        message: 'Cloudy conditions provide natural shade and moderate temperatures.',
        level: 'normal'
      })
    }
  }
  
  // Return top 2 insights
  return allInsights.slice(0, 2)
})
</script>

<style scoped>
.weather-insights {
  display: flex;
  flex-direction: column;
}

.weather-insights h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.insights-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.insight-item:hover {
  background: rgba(255, 255, 255, 0.12);
}

.insight-item.severe {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.08);
}

.insight-item.warning {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.08);
}

.insight-item.normal {
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(59, 130, 246, 0.08);
}

.insight-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.insight-text {
  flex: 1;
}

.insight-text p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.5;
  font-weight: 400;
}

.no-insights {
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

@media (max-width: 768px) {
  .insights-content {
    gap: 10px;
  }
  
  .insight-item {
    padding: 10px;
    gap: 10px;
  }
  
  .insight-icon {
    width: 20px;
    height: 20px;
    font-size: 14px;
  }
  
  .insight-text p {
    font-size: 13px;
  }
}
</style>
