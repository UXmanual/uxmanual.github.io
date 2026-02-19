<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-[#0a0a0c] text-zinc-900 dark:text-white transition-colors duration-500 selection:bg-indigo-500/30">
    <!-- Navbar -->
    <nav class="fixed top-0 w-full px-6 md:px-10 py-5 flex justify-between items-center z-50 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 transition-colors duration-500">
      <router-link to="/" class="flex items-center gap-3 text-lg font-bold tracking-tighter text-zinc-900 dark:text-white transition-colors">
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
        UXManual
      </router-link>
      
      <div class="flex items-center gap-4 md:gap-8">
        <div class="hidden md:flex gap-8 text-sm font-semibold text-zinc-500">
          <a href="#" class="text-zinc-900 dark:text-white">Explore Project</a>
          <a href="#" class="hover:text-zinc-900 dark:hover:text-white transition-colors">Digital Lab</a>
        </div>
        
        <!-- Theme Toggle Button -->
        <button @click="toggleTheme" class="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-300" aria-label="Toggle Theme">
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.757 7.757l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </nav>

    <!-- Header -->
    <header class="pt-40 px-6 md:px-10 max-w-[1600px] mx-auto mb-10">
      <h1 class="text-5xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-white">Design Portfolio</h1>
      <p class="text-zinc-600 dark:text-zinc-400 text-lg">미드저니 벤치마킹 스타일의 메이슨리 그리드 및 다중 테마가 적용된 디자인 아카이브입니다.</p>
    </header>

    <!-- Filter Bar -->
    <div class="px-6 md:px-10 max-w-[1600px] mx-auto mb-12 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
      <button v-for="tag in tags" :key="tag" 
        @click="activeTag = tag"
        :class="['px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ease-out whitespace-nowrap border', 
        activeTag === tag ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white shadow-md' : 'bg-white dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/30 hover:text-zinc-900 dark:hover:text-white']">
        {{ tag }}
      </button>
    </div>

    <!-- Masonry Grid -->
    <main class="px-6 md:px-10 pb-32 max-w-[1600px] mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
      
      <!-- Skeleton Loading State -->
      <template v-if="isLoading">
        <PortfolioSkeleton v-for="i in 8" :key="'skeleton-' + i" :height="[400, 300, 500, 350][i % 4]" />
      </template>

      <!-- Actual Content -->
      <template v-else>
        <div v-for="(item, index) in filteredItems" :key="index" 
          class="relative rounded-2xl overflow-hidden group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 hover:scale-[1.02] transition-all duration-500 cursor-zoom-in break-inside-avoid animate-in fade-in duration-1000 shadow-sm hover:shadow-xl dark:shadow-none">
          <img :src="item.image" :alt="item.title" class="w-full h-auto block group-hover:brightness-50 transition-all duration-700">
          
          <!-- Overlay -->
          <div class="absolute inset-0 p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
            <span class="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">{{ item.category }}</span>
            <h3 class="text-xl font-bold mb-4 text-white uppercase tracking-tight">{{ item.title }}</h3>
            <div class="flex gap-5 text-xs font-medium text-zinc-300">
              <span class="flex items-center gap-1.5">👁 {{ item.views }}</span>
              <span class="flex items-center gap-1.5">♥ {{ item.likes }}</span>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- Load More Button -->
    <div v-if="!isLoading && hasMore" class="max-w-[1600px] mx-auto px-10 pb-32 flex justify-center">
      <button @click="loadMore" :disabled="isBotLoading"
        class="group relative px-12 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm tracking-widest uppercase overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
        <span class="relative z-10 flex items-center gap-2">
          {{ isBotLoading ? 'Loading...' : 'Explore More' }}
          <svg v-if="!isBotLoading" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
        </span>
        <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PortfolioSkeleton from '../components/PortfolioSkeleton.vue'

interface PortfolioItem {
  image: string
  title: string
  category: string
  views: string
  likes: string
}

const isLoading = ref(true)
const isBotLoading = ref(false)
const isDark = ref(true)
const tags = ['All Projects', 'UI/UX Design', '3D Art', 'Motion', 'Concept']
const activeTag = ref('All Projects')
const visibleCount = ref(8)

// Theme management
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

const loadMore = () => {
  isBotLoading.value = true
  // Simulate network delay for loading more
  setTimeout(() => {
    visibleCount.value += 4
    isBotLoading.value = false
  }, 800)
}

// Initial theme setup (runs before mount)
const savedTheme = localStorage.getItem('theme')
if (savedTheme) {
  isDark.value = savedTheme === 'dark'
} else {
  isDark.value = true // Default to dark
}
updateThemeClass(isDark.value)

onMounted(() => {
  // Double check theme on mount
  updateThemeClass(isDark.value)
  
  // Simulate initial data loading delay
  setTimeout(() => {
    isLoading.value = false
  }, 1200)
})

const items: PortfolioItem[] = [
  { image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800', title: 'Digital Fluidity Vol.1', category: '3D Art', views: '2.4k', likes: '482' },
  { image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800', title: 'Cybernetic Retrofit', category: 'Concept', views: '1.8k', likes: '315' },
  { image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800', title: 'Minimalist Flux', category: 'UI/UX Design', views: '3.1k', likes: '920' },
  { image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800', title: 'Neon Chromatics', category: 'Motion', views: '4.2k', likes: '1.1k' },
  { image: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=800', title: 'Glass Refraction Lab', category: '3D Art', views: '1.2k', likes: '256' },
  { image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800', title: 'Next-Gen Code Editor', category: 'UI/UX Design', views: '5.5k', likes: '2.3k' },
  { image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800', title: 'Solari Weather OS', category: 'UI/UX Design', views: '2.9k', likes: '740' },
  { image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=800', title: 'Waveform Particles', category: 'Motion', views: '1.1k', likes: '190' },
  { image: 'https://images.unsplash.com/photo-1635241161466-541f065683ba?q=80&w=800', title: 'Prism Geometry', category: '3D Art', views: '1.5k', likes: '280' },
  { image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800', title: 'Ethereal Hardware', category: 'Concept', views: '4.2k', likes: '1.5k' },
  { image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800', title: 'Security Protocol 01', category: 'UI/UX Design', views: '2.1k', likes: '540' },
  { image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=800', title: 'Abstract Velocity', category: 'Motion', views: '3.3k', likes: '890' },
  { image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800', title: 'Neural Network UI', category: 'UI/UX Design', views: '6.7k', likes: '3.1k' },
  { image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800', title: 'Chrome Aesthetics', category: '3D Art', views: '900', likes: '150' },
  { image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800', title: 'Global Data Web', category: 'Concept', views: '12k', likes: '5.2k' },
  { image: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?q=80&w=800', title: 'Vaporwave Interface', category: 'UI/UX Design', views: '4.8k', likes: '1.2k' },
]

const filteredItems = computed(() => {
  let filtered = items
  if (activeTag.value !== 'All Projects') {
    filtered = items.filter(item => item.category === activeTag.value)
  }
  return filtered.slice(0, visibleCount.value)
})

const hasMore = computed(() => {
  const currentTotal = activeTag.value === 'All Projects' 
    ? items.length 
    : items.filter(item => item.category === activeTag.value).length
  return visibleCount.value < currentTotal
})
</script>



<style>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
