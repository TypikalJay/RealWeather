<template>
  <div class="weather-timeline-card">
    <h3>Weather Timeline</h3>
    
    <div class="timeline-content">
      <div class="timeline">
        <div 
          v-for="(event, index) in timelineEvents" 
          :key="index"
          class="timeline-node"
        >
          <div class="timeline-marker">
            <div class="marker-dot"></div>
            <div class="marker-line" v-if="index < timelineEvents.length - 1"></div>
          </div>
          
          <div class="timeline-content-item">
            <div class="timeline-time">{{ event.time }}</div>
            <div class="timeline-condition">
              <span class="condition-icon">{{ event.icon }}</span>
              <span class="condition-text">{{ event.condition }}</span>
            </div>
          </div>
        </div>
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

const timelineEvents = computed(() => {
  if (!props.forecastData || props.forecastData.length === 0) {
    return [
      { time: 'Now', condition: 'No data available', icon: '❓' }
    ]
  }

  const events = []
  const now = new Date()
  
  // Add current condition
  events.push({
    time: 'Now',
    condition: getCurrentCondition(),
    icon: getCurrentIcon()
  })

  // Find significant weather changes in next 12 hours
  const next12Hours = props.forecastData.slice(0, 12)
  let lastCondition = props.currentWeather?.weather?.[0]?.main?.toLowerCase() || 'clear'
  
  for (let i = 3; i < next12Hours.length; i += 3) {
    const hour = next12Hours[i]
    if (!hour) continue
    
    const condition = hour.weather?.[0]?.main?.toLowerCase() || 'clear'
    const rainChance = hour.rain?.chance || 0
    const temp = hour.main?.temp || 0
    
    // Check for significant weather changes
    let eventCondition = ''
    let eventIcon = ''
    
    if (rainChance > 70 && lastCondition !== 'rain') {
      eventCondition = 'Heavy rain'
      eventIcon = '🌧️'
      lastCondition = 'rain'
    } else if (rainChance > 40 && rainChance <= 70 && lastCondition !== 'rain') {
      eventCondition = 'Rain begins'
      eventIcon = '🌦️'
      lastCondition = 'rain'
    } else if (rainChance < 20 && lastCondition === 'rain') {
      eventCondition = 'Rain easing'
      eventIcon = '🌤️'
      lastCondition = 'clear'
    } else if (condition.includes('clear') && lastCondition !== 'clear') {
      eventCondition = 'Clear skies'
      eventIcon = '☀️'
      lastCondition = 'clear'
    } else if (condition.includes('cloud') && lastCondition !== 'cloud') {
      eventCondition = 'Cloudy'
      eventIcon = '☁️'
      lastCondition = 'cloud'
    } else if (condition.includes('storm') || condition.includes('thunder')) {
      eventCondition = 'Storm warning'
      eventIcon = '⛈️'
      lastCondition = 'storm'
    }
    
    if (eventCondition) {
      const eventTime = new Date(now.getTime() + (i * 60 * 60 * 1000))
      const hours = eventTime.getHours()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      
      events.push({
        time: `${displayHours} ${ampm}`,
        condition: eventCondition,
        icon: eventIcon
      })
    }
    
    // Limit to 5 events total
    if (events.length >= 5) break
  }
  
  return events.slice(0, 5)
})

function getCurrentCondition() {
  const condition = props.currentWeather?.weather?.[0]?.main || 'Clear'
  const rainChance = props.currentWeather?.rain?.chance || 0
  
  if (rainChance > 70) return 'Heavy rain'
  if (rainChance > 40) return 'Light rain'
  return condition
}

function getCurrentIcon() {
  const condition = props.currentWeather?.weather?.[0]?.main?.toLowerCase() || 'clear'
  const rainChance = props.currentWeather?.rain?.chance || 0
  
  if (rainChance > 70) return '🌧️'
  if (rainChance > 40) return '🌦️'
  if (condition.includes('clear')) return '☀️'
  if (condition.includes('cloud')) return '☁️'
  if (condition.includes('rain')) return '🌧️'
  if (condition.includes('storm') || condition.includes('thunder')) return '⛈️'
  return '☀️'
}
</script>

<style scoped>
.weather-timeline-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.weather-timeline-card h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-node {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex-shrink: 0;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
  z-index: 2;
}

.marker-line {
  width: 2px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  margin-top: 4px;
}

.timeline-content-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.timeline-time {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.timeline-condition {
  display: flex;
  align-items: center;
  gap: 8px;
}

.condition-icon {
  font-size: 16px;
}

.condition-text {
  font-size: 15px;
  color: white;
  font-weight: 500;
}

@media (max-width: 768px) {
  .timeline {
    gap: 16px;
  }
  
  .timeline-node {
    gap: 12px;
  }
  
  .timeline-time {
    font-size: 13px;
  }
  
  .condition-text {
    font-size: 14px;
  }
  
  .marker-line {
    height: 32px;
  }
  
  .weather-timeline-card h3 {
    font-size: 18px;
  }
}
</style>
