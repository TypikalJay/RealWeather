<template>
  <div class="ai-forecast-card">
    <h3>AI Forecast Insight</h3>
    
    <div class="insight-content">
      <div class="insight-text">
        {{ generatedInsight }}
      </div>
      
      <div class="recommendation" v-if="recommendation">
        <div class="rec-label">Recommendation:</div>
        <div class="rec-text">{{ recommendation }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  forecastData: {
    type: Array,
    default: () => []
  },
  currentWeather: {
    type: Object,
    default: null
  }
})

const generatedInsight = computed(() => {
  if (!props.forecastData || props.forecastData.length === 0) {
    return 'No forecast data available for AI analysis.'
  }

  // Analyze weather patterns for AI insights
  const hourlyData = props.forecastData.slice(0, 24) // Next 24 hours
  const currentTemp = props.currentWeather?.main?.temp || 0
  const currentRainChance = props.currentWeather?.rain?.chance || 0

  // Rain pattern analysis
  const rainIncreasing = hourlyData.slice(12, 18).some(hour => 
    (hour?.rain?.chance || 0) > currentRainChance
  )
  
  // Temperature trend analysis
  const avgTemp = hourlyData.slice(0, 12).reduce((sum, hour) => 
    sum + (hour?.main?.temp || 0), 0
  , 0) / 12
  
  const futureAvgTemp = hourlyData.slice(12, 24).reduce((sum, hour) => 
    sum + (hour?.main?.temp || 0), 0
  , 0) / 12
  
  const tempRising = futureAvgTemp > avgTemp

  // Generate AI insights based on patterns
  if (rainIncreasing && tempRising) {
    return 'Rain probability increasing after 3PM with rising temperatures expected.'
  } else if (rainIncreasing) {
    return 'Rain probability increasing after 3PM. Outdoor activities may be impacted.'
  } else if (tempRising) {
    return 'Temperature rising this afternoon. Plan for warmer conditions.'
  } else if (currentRainChance > 50) {
    return 'High rain chance detected. Consider indoor alternatives.'
  } else if (currentTemp > 30) {
    return 'Hot conditions expected. Stay hydrated and seek shade.'
  } else if (currentTemp < 5) {
    return 'Cold conditions ahead. Dress warmly and protect exposed skin.'
  } else {
    return 'Weather conditions expected to remain stable. Normal activities recommended.'
  }
})

const recommendation = computed(() => {
  if (!props.forecastData || props.forecastData.length === 0) {
    return null
  }

  const currentRainChance = props.currentWeather?.rain?.chance || 0
  const hourlyData = props.forecastData.slice(0, 24)

  // Check for rain increase after 3PM
  const afternoonRain = hourlyData.slice(12, 18)
  const rainIncreasing = afternoonRain.some(hour => 
    (hour?.rain?.chance || 0) > currentRainChance
  )

  // Generate recommendations based on AI analysis
  if (rainIncreasing) {
    return 'Delay outdoor promotions until tomorrow morning.'
  } else if (currentRainChance > 60) {
    return 'Postpone outdoor activities due to high rain probability.'
  } else if (rainIncreasing && currentRainChance > 30) {
    return 'Carry umbrella and expect wet conditions this afternoon.'
  } else if (currentRainChance > 40) {
    return 'Monitor weather updates for changing conditions.'
  } else {
    return 'Current conditions favorable for planned activities.'
  }
})
</script>

<style scoped>
.ai-forecast-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ai-forecast-card h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.insight-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.insight-text {
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.95);
  flex: 1;
}

.recommendation {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rec-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.rec-text {
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  font-size: 14px;
  color: white;
  font-weight: 500;
}

@media (max-width: 768px) {
  .insight-text {
    font-size: 14px;
    padding: 16px;
  }
  
  .rec-text {
    font-size: 13px;
    padding: 12px 14px;
  }
  
  .ai-forecast-card h3 {
    font-size: 18px;
  }
}
</style>
