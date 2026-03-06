<template>
  <header 
    class="px-6 md:px-10 max-w-[1800px] mx-auto transition-opacity duration-300"
    :class="[paddingTop, marginBottom]"
  >
    <div class="space-y-2 md:space-y-3" :class="innerMaxWidth">
      <!-- Real-time Clock and Weather Info (Conditional - Only for Main Page) -->
      <div 
        v-if="showDateTimeWeather"
        class="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-500 tracking-tight"
        style="font-family: 'Pretendard Variable', 'Pretendard', sans-serif;"
      >
        <span class="shrink-0">{{ formattedDate }}</span>
        <span class="w-[1px] h-2.5 bg-zinc-200 dark:bg-white/20 shrink-0"></span>
        <span class="shrink-0">서울</span>
        <span class="tabular-nums min-w-[64px] md:min-w-[78px]">
          {{ currentTime }}
        </span>
        <template v-if="weather">
          <span class="w-[1px] h-2.5 bg-zinc-200 dark:bg-white/20 shrink-0"></span>
          <span class="shrink-0">{{ weatherEmoji }} {{ weather.temp }}°C</span>
        </template>
      </div>

      <h1 
        class="text-4xl md:text-5xl font-extrabold tracking-tight"
        style="font-family: 'Pretendard Variable', 'Pretendard', sans-serif; font-weight: 800 !important;"
      >
        <span :class="{ 'gradient-text': enableGradient }" class="text-zinc-900 dark:text-white">
          {{ title }}
        </span>
      </h1>
      <p 
        class="text-zinc-600 dark:text-zinc-400 text-base md:text-lg leading-relaxed"
        v-html="description"
      ></p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Props {
  title: string
  description: string
  paddingTop?: string
  marginBottom?: string
  innerMaxWidth?: string
  enableGradient?: boolean
  showDateTimeWeather?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  paddingTop: 'pt-28',
  marginBottom: 'mb-8',
  innerMaxWidth: 'max-w-2xl',
  enableGradient: false,
  showDateTimeWeather: false
})

const weather = ref<{ temp: number; code: number; isDay: boolean } | null>(null)
const now = ref(new Date())
let clockInterval: any = null
let weatherInterval: any = null

// Real-time Clock formatting: 오후 1:45:30
const currentTime = computed(() => {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  }).format(now.value)
})

// Current Date formatting: 2026년 3월 3일 화요일
const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(now.value)
})

const weatherEmoji = computed(() => {
  if (!weather.value) return ''
  const { code, isDay } = weather.value
  
  // WMO Weather interpretation codes (WW)
  // 0: Clear sky
  if (code === 0) return isDay ? '☀️' : '🌙'
  
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  if (code === 1) return isDay ? '🌤️' : '🌙'
  if (code === 2) return isDay ? '⛅' : '☁️'
  if (code === 3) return '☁️'
  
  // 45, 48: Fog and depositing rime fog
  if (code === 45 || code === 48) return '🌫️'
  
  // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
  // 56, 57: Freezing Drizzle: Light and dense intensity
  if (code >= 51 && code <= 57) return '☂️'
  
  // 61, 63, 65: Rain: Slight, moderate and heavy intensity
  // 66, 67: Freezing Rain: Light and heavy intensity
  // 80, 81, 82: Rain showers: Slight, moderate, and violent
  if (code === 61 || code === 80) return '☂️' // Slight rain or showers
  if ((code >= 63 && code <= 67) || (code >= 81 && code <= 82)) return '☔' // Moderate/Heavy rain
  
  // 68, 69: Rain and snow mixed
  // 83, 84: Snow showers mixed with rain
  // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
  // 77: Snow grains
  // 79: Ice pellets
  // 85, 86: Snow showers: Slight and heavy
  if (code === 68 || code === 69 || code === 83 || code === 84) return '🌨️' // Mixed
  if (code >= 71 && code <= 79) return code === 75 ? '❄️' : '🌨️'
  if (code === 85 || code === 86) return '🌨️'
  
  // 95: Thunderstorm: Slight or moderate
  // 96, 99: Thunderstorm with slight and heavy hail
  if (code === 95) return '⛈️'
  if (code === 96 || code === 99) return '🌩️'
  
  return '☁️'
})

const fetchWeather = async () => {
  if (!props.showDateTimeWeather) return
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true')
    const data = await res.json()
    if (data.current_weather) {
      weather.value = {
        temp: Math.round(data.current_weather.temperature),
        code: data.current_weather.weathercode,
        isDay: data.current_weather.is_day === 1
      }
    }
  } catch (e) {
    console.error('Failed to fetch weather:', e)
  }
}

onMounted(() => {
  if (props.showDateTimeWeather) {
    fetchWeather()
    
    // Real-time clock update (every second)
    clockInterval = setInterval(() => {
      now.value = new Date()
    }, 1000)

    // Weather update (every 10 minutes)
    weatherInterval = setInterval(() => {
      fetchWeather()
    }, 10 * 60 * 1000)
  }
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
  if (weatherInterval) clearInterval(weatherInterval)
})
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(
    110deg,
    #6366f1 20%,
    #a855f7 40%,
    #ec4899 60%,
    #a855f7 80%,
    #6366f1 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
</style>
