<template>
  <div class="min-h-screen bg-[#0a0a0c] text-white selection:bg-indigo-500/30">
    <!-- Navbar -->
    <nav class="fixed top-0 w-full px-10 py-5 flex justify-between items-center z-50 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/10">
      <router-link to="/" class="flex items-center gap-3 text-xl font-extrabold tracking-tighter">
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
        UXmanual
      </router-link>
      <div class="hidden md:flex gap-8 text-sm font-semibold text-zinc-500">
        <a href="#" class="text-white">Explore Project</a>
        <a href="#" class="hover:text-white transition-colors">Digital Lab</a>
        <a href="#" class="hover:text-white transition-colors">Archived</a>
      </div>
    </nav>

    <!-- Header -->
    <header class="pt-40 px-10 max-w-[1600px] mx-auto mb-10">
      <h1 class="text-5xl font-bold tracking-tight mb-4">Design Portfolio</h1>
      <p class="text-zinc-500 text-lg max-w-xl">미드저니 벤치마킹 스타일의 메이슨리 그리드 및 다크 테마가 적용된 디자인 아카이브입니다.</p>
    </header>

    <!-- Filter Bar -->
    <div class="px-10 max-w-[1600px] mx-auto mb-12 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
      <button v-for="tag in tags" :key="tag" 
        @click="activeTag = tag"
        :class="['px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ease-out whitespace-nowrap border', 
        activeTag === tag ? 'bg-white text-black border-white' : 'bg-zinc-900/50 text-zinc-400 border-white/10 hover:border-white/30 hover:text-white']">
        {{ tag }}
      </button>
    </div>

    <!-- Masonry Grid -->
    <main class="px-10 pb-32 max-w-[1600px] mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
      
      <!-- Skeleton Loading State -->
      <template v-if="isLoading">
        <PortfolioSkeleton v-for="i in 8" :key="'skeleton-' + i" :height="[400, 300, 500, 350][i % 4]" />
      </template>

      <!-- Actual Content -->
      <template v-else>
        <div v-for="(item, index) in filteredItems" :key="index" 
          class="relative rounded-2xl overflow-hidden group bg-zinc-900 border border-white/5 hover:scale-[1.02] transition-all duration-500 cursor-zoom-in break-inside-avoid animate-in fade-in duration-1000">
          <img :src="item.image" :alt="item.title" class="w-full h-auto block group-hover:brightness-50 transition-all duration-700">
          
          <!-- Overlay -->
          <div class="absolute inset-0 p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
            <span class="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">{{ item.category }}</span>
            <h3 class="text-xl font-bold mb-4">{{ item.title }}</h3>
            <div class="flex gap-5 text-xs font-medium text-zinc-400">
              <span class="flex items-center gap-1.5">👁 {{ item.views }}</span>
              <span class="flex items-center gap-1.5">♥ {{ item.likes }}</span>
            </div>
          </div>
        </div>
      </template>
    </main>
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
const tags = ['All Projects', 'UI/UX Design', '3D Art', 'Motion', 'Concept']
const activeTag = ref('All Projects')

onMounted(() => {
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
]

const filteredItems = computed(() => {
  if (activeTag.value === 'All Projects') return items
  return items.filter(item => item.category === activeTag.value)
})
</script>


<style>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
