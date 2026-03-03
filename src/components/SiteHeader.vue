<template>
  <header 
    class="px-6 md:px-10 max-w-[1800px] mx-auto transition-opacity duration-300"
    :class="[paddingTop, marginBottom]"
  >
    <div class="space-y-2 md:space-y-3" :class="innerMaxWidth">
      <!-- Date and Weather Info (Simple Sub-header) -->
      <div 
        class="flex items-center gap-3 text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-500 tracking-tight"
        style="font-family: 'Pretendard Variable', 'Pretendard', sans-serif;"
      >
        <span>{{ formattedDate }}</span>
        <span v-if="weather" class="flex items-center gap-1.5 transition-opacity duration-500">
          <span class="w-[1px] h-3 bg-zinc-200 dark:bg-white/10"></span>
          <span>{{ weatherEmoji }} {{ weather.temp }}°C</span>
        </span>
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
import { ref, onMounted, computed } from 'vue'

interface Props {
  title: string
  description: string
  paddingTop?: string
  marginBottom?: string
  innerMaxWidth?: string
  enableGradient?: boolean
}

withDefaults(defineProps<Props>(), {
  paddingTop: 'pt-28',
  marginBottom: 'mb-8',
  innerMaxWidth: 'max-w-2xl',
  enableGradient: false
})

const weather = ref<{ temp: number; code: number } | null>(null)

// Current Date formatting: 2026년 3월 3일 화요일
const formattedDate = computed(() => {
  const now = new Date()
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(now)
})

const weatherEmoji = computed(() => {
  if (!weather.value) return ''
  const code = weather.value.code
  if (code === 0) return '☀️' // Clear
  if (code >= 1 && code <= 3) return '🌤️' // Partly cloudy
  if (code >= 45 && code <= 48) return '🌫️' // Fog
  if (code >= 51 && code <= 67) return '🌧️' // Rain
  if (code >= 71 && code <= 77) return '❄️' // Snow
  if (code >= 80 && code <= 82) return '🌦️' // Rain showers
  if (code >= 95) return '⛈️' // Thunderstorm
  return '☁️'
})

const fetchWeather = async () => {
  try {
    // Fetching Seoul weather using Open-Meteo API
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true')
    const data = await res.json()
    if (data.current_weather) {
      weather.value = {
        temp: Math.round(data.current_weather.temperature),
        code: data.current_weather.weathercode
      }
    }
  } catch (e) {
    console.error('Failed to fetch weather:', e)
  }
}

onMounted(() => {
  fetchWeather()
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
