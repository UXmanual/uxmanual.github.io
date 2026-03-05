<template>
  <nav 
    class="fixed top-0 left-0 right-0 z-50 bg-zinc-50/90 dark:bg-[#131313]/90 backdrop-blur-xl transition-transform duration-0"
    :style="{ transform: `translateY(${navTranslateY}px)` }"
  >
    <div class="site-nav-container px-6 md:px-10 flex justify-between items-center w-full">
      <router-link to="/" class="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white transition-colors group">
        <img src="/favicon.svg" alt="Logo" class="w-6 h-6 rounded-md" />
        <span>Todays News</span>
      </router-link>
      
      <div class="flex items-center gap-4 md:gap-8">
        <div class="flex gap-4 md:gap-8 text-sm font-semibold">
          <router-link 
            to="/" 
            class="transition-colors"
            :class="route.path === '/' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'"
          >
            Trends
          </router-link>
          <router-link 
            to="/feed" 
            class="transition-colors"
            :class="route.path === '/feed' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'"
          >
            Feed
          </router-link>
        </div>
        
        <!-- Theme Toggle -->
        <button 
          @click="toggleTheme" 
          class="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 transition-all duration-300 hover:scale-105 active:scale-95 group/theme flex items-center justify-center border border-transparent dark:border-white/5"
          aria-label="Toggle Theme"
        >
          <!-- Sun Icon (Show when dark - to switch to light) -->
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-[18px] h-[18px] transition-transform duration-500 group-hover/theme:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="17.78" x2="5.64" y2="16.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <!-- Moon Icon (Show when light - to switch to dark) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-[18px] h-[18px] transition-transform duration-500 group-hover/theme:-rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isDark = ref(true)

// Navigation logic moved to component for global consistency
const navTranslateY = ref(0)
const lastScrollY = ref(0)
const isNaturalScroll = ref(true)

const handleScroll = () => {
  const currentScrollY = Math.max(0, window.scrollY)
  const delta = currentScrollY - lastScrollY.value
  
  // 1. Top Area Buffer (0-10px): Prevent jittering during momentum scroll / overscroll
  if (currentScrollY < 10) {
    navTranslateY.value = 0
  } 
  // 2. Natural Scroll sync (Initial scroll away phase)
  else if (currentScrollY < 56 && delta >= 0) {
    navTranslateY.value = -currentScrollY
  } 
  // 3. Beyond top reveal/hide logic
  else {
    if (delta > 8) {
      navTranslateY.value = -71 // Fully hide (+1px buffer)
    } else if (delta < -15) {
      navTranslateY.value = 0
    }
    
    // Safety: If we reach near the top, ensure we snap back smoothly
    if (currentScrollY <= 2) {
      navTranslateY.value = 0
    }
  }
  
  // Sync with global CSS variable for other components (like sticky tabs)
  document.documentElement.style.setProperty('--nav-y', `${navTranslateY.value}px`)
  
  lastScrollY.value = currentScrollY
}

const updateThemeClass = (dark: boolean) => {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  updateThemeClass(isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  }
  updateThemeClass(isDark.value)
  
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(isDark, (newVal) => {
  updateThemeClass(newVal)
})
</script>

<style scoped>
.site-nav-container {
  padding-block: calc(0.25rem * 3);
}

</style>
