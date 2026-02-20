<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-[#0a0a0c] text-zinc-900 dark:text-white transition-colors duration-500">
    <SiteNavbar />

    <header class="pt-40 px-6 md:px-10 max-w-[1600px] mx-auto mb-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-5xl font-bold tracking-tight mb-4 flex items-center gap-4">
            Real-time Trends
            <span class="flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
          </h1>
          <p class="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed max-w-2xl">
            유튜브 콘텐츠 기획을 위한 실시간 글로벌 트렌드 데이터입니다. <br class="hidden md:block">
            AI, 금융, 테크 분야의 최신 소식을 한 곳에서 파악하고 인사이트를 얻으세요.
          </p>
        </div>
        
        <div class="flex gap-2 bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="activeCategory = cat.id"
            class="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300"
            :class="activeCategory === cat.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg shadow-zinc-500/20' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>
    </header>

    <main class="px-6 md:px-10 pb-32 max-w-[1600px] mx-auto">
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl p-8 animate-pulse h-64">
          <div class="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
          <div class="h-8 w-full bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
          <div class="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded mb-8"></div>
          <div class="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mt-auto"></div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TransitionGroup name="list">
          <a v-for="(item, index) in filteredNews" 
             :key="item.link" 
             :href="item.link" 
             target="_blank"
             class="group block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl p-8 transition-all duration-500 hover:border-indigo-500/50 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:-translate-y-1"
          >
            <div class="flex justify-between items-start mb-6">
              <span class="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
                {{ item.source }}
              </span>
              <span class="text-[10px] text-zinc-400 font-medium tracking-tighter">{{ formatDate(item.pubDate) }}</span>
            </div>
            
            <h3 class="text-xl font-bold mb-4 text-zinc-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-3">
              {{ item.title }}
            </h3>
            
            <p class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2">
              {{ item.description }}
            </p>
            
            <div class="flex items-center gap-2 text-[10px] font-bold text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
              READ FULL STORY
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </a>
        </TransitionGroup>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && filteredNews.length === 0" class="flex flex-col items-center justify-center py-40 text-center">
        <div class="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2 text-zinc-400">No trends found</h3>
        <p class="text-zinc-500">Wait a moment or try another category.</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import SiteNavbar from '../components/SiteNavbar.vue'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  description: string
  source: string
  category: string
}

const isLoading = ref(true)
const activeCategory = ref('all')
const news = ref<NewsItem[]>([])

const categories = [
  { id: 'all', name: 'All News' },
  { id: 'ai', name: 'AI & Tech' },
  { id: 'finance', name: 'Finance' },
  { id: 'crypto', name: 'Crypto' }
]

const RSS_SOURCES = [
  { name: 'Google News AI (인공지능)', url: 'https://news.google.com/rss/search?q=%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5&hl=ko&gl=KR&ceid=KR:ko', category: 'ai' },
  { name: 'TechCrunch (Global)', url: 'https://techcrunch.com/feed/', category: 'ai' },
  { name: 'Google News Finance (경제)', url: 'https://news.google.com/rss/search?q=%ED%85%8C%ED%81%AC+%EA%B2%BD%EC%A0%9C&hl=ko&gl=KR&ceid=KR:ko', category: 'finance' },
  { name: 'CoinTelegraph KR (가상자산)', url: 'https://kr.cointelegraph.com/rss', category: 'crypto' }
]

const filteredNews = computed(() => {
  if (activeCategory.value === 'all') return news.value
  return news.value.filter(item => item.category === activeCategory.value)
})

const fetchNews = async () => {
  isLoading.value = true
  news.value = []
  
  const allFetchPromises = RSS_SOURCES.map(async (source) => {
    try {
      // Use AllOrigins Proxy to bypass CORS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`
      const response = await fetch(proxyUrl)
      if (!response.ok) throw new Error('Proxy error')
      
      const data = await response.json()
      const xmlString = data.contents
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
      
      const items = xmlDoc.querySelectorAll('item')
      const parsedItems: NewsItem[] = []
      
      items.forEach((item, idx) => {
        if (idx > 10) return // Limit per source
        
        const title = item.querySelector('title')?.textContent || ''
        const link = item.querySelector('link')?.textContent || ''
        const pubDate = item.querySelector('pubDate')?.textContent || ''
        let description = item.querySelector('description')?.textContent || ''
        
        // Clean description (remove HTML tags)
        description = description.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...'
        
        parsedItems.push({
          title,
          link,
          pubDate,
          description,
          source: source.name,
          category: source.category
        })
      })
      
      return parsedItems
    } catch (err) {
      console.error(`Error fetching ${source.name}:`, err)
      return []
    }
  })

  const results = await Promise.all(allFetchPromises)
  const flattenedResults = results.flat()
  
  // Sort by date
  flattenedResults.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
  
  news.value = flattenedResults
  isLoading.value = false
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchNews()
})

// Refresh trends every 10 minutes
onMounted(() => {
  const interval = setInterval(fetchNews, 10 * 60 * 1000)
  return () => clearInterval(interval)
})
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
