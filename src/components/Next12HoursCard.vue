<template>
  <div class="next-12-hours">
    <h3>Next 12 Hours</h3>
    
    <div class="hours-container">
      <div class="hours-grid">
        <div
          v-for="(hour, index) in hourlyForecast.slice(0, 12)"
          :key="'hour-' + index"
          class="hour-item"
        >
          <div class="hour-time">{{ formatHour(hour.dt_txt) }}</div>
          <div class="hour-icon" v-html="iconSvg(hour.weather?.[0]?.main || 'Clear')"></div>
          <div class="hour-temp">{{ toDisplayTemp(hour.main?.temp ?? 0) }}&deg;</div>
          <div class="hour-rain">{{ Math.round((hour.pop ?? 0) * 100) }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  hourlyForecast: {
    type: Array,
    default: () => []
  },
  formatHour: {
    type: Function,
    required: true
  },
  iconSvg: {
    type: Function,
    required: true
  },
  toDisplayTemp: {
    type: Function,
    required: true
  },
  unitSymbol: {
    type: String,
    default: 'C'
  }
})
</script>

<style scoped>
.next-12-hours {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.next-12-hours h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.hours-container {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
}

.hours-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(60px, 1fr));
  gap: 8px;
  min-width: fit-content;
}

.hour-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  transition: all 0.2s ease;
  min-width: 70px;
}

.hour-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.hour-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 6px;
  font-weight: 500;
}

.hour-icon {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hour-icon svg {
  width: 22px;
  height: 22px;
}

.hour-temp {
  font-size: 13px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.hour-rain {
  font-size: 10px;
  color: rgba(59, 130, 246, 0.9);
  font-weight: 600;
}

/* Scrollbar styling */
.hours-container::-webkit-scrollbar {
  height: 4px;
}

.hours-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.hours-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.hours-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .hours-grid {
    grid-template-columns: repeat(12, minmax(50px, 1fr));
    gap: 6px;
  }
  
  .hour-item {
    padding: 6px 2px;
  }
  
  .hour-time {
    font-size: 10px;
  }
  
  .hour-icon svg {
    width: 16px;
    height: 16px;
  }
  
  .hour-temp {
    font-size: 11px;
  }
  
  .hour-rain {
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .hours-grid {
    grid-template-columns: repeat(12, minmax(45px, 1fr));
    gap: 4px;
  }
  
  .hour-item {
    padding: 4px 2px;
  }
}
</style>
