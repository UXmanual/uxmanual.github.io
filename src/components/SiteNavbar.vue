<template>
  <nav 
    class="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-xl transition-transform duration-300 ease-out"
    :style="{ transform: `translateY(${navTranslateY}px)` }"
  >
    <div class="site-nav-container px-6 md:px-10 flex justify-between items-center w-full">
      <router-link to="/" class="flex items-center gap-3 text-lg font-black uppercase tracking-normal text-zinc-900 dark:text-white transition-colors">
        Todays News
      </router-link>
      
      <div class="flex items-center gap-4 md:gap-8">
        <div class="flex gap-4 md:gap-8 text-sm font-semibold">
          <router-link 
            to="/" 
            class="transition-colors"
            :class="route.path === '/' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'"
          >
            Trends
          </router-link>
          <router-link 
            to="/community" 
            class="transition-colors"
            :class="route.path === '/community' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'"
          >
            Community
          </router-link>
        </div>
        
        <!-- Theme Toggle -->
        <button @click="toggleTheme" class="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-300" aria-label="Toggle Theme">
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.757 7.757l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
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
  const currentScrollY = window.scrollY
  const delta = currentScrollY - lastScrollY.value
  
  if (currentScrollY < 56 && delta >= 0) {
    navTranslateY.value = -currentScrollY
  } else {
    isNaturalScroll.value = false
    if (delta > 8) {
      navTranslateY.value = -70 
    } else if (delta < -15) {
      navTranslateY.value = 0
    }
    
    if (currentScrollY <= 0) {
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
