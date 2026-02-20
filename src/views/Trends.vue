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

    <main class="px-6 md:px-10 pb-32 max-w-[1800px] mx-auto">
      <div v-if="isLoading && news.length === 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <div v-for="i in 10" :key="i" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 animate-pulse h-40">
          <div class="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded mb-3"></div>
          <div class="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
          <div class="h-4 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
          <div class="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded mt-auto"></div>
        </div>
      </div>

      <div v-else class="space-y-10">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <TransitionGroup name="list">
            <a v-for="(item, index) in displayedNews" 
               :key="item.link + index" 
               :href="item.link" 
               target="_blank"
               class="group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl p-6 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] hover:-translate-y-1"
            >
              <div class="flex justify-between items-center mb-4">
                <span class="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/10">
                  {{ item.source }}
                </span>
                <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">{{ item.category }}</span>
              </div>
              
              <h3 class="text-lg font-bold text-zinc-900 dark:text-white leading-tight mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {{ item.title }}
              </h3>
              
              <p class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {{ item.description }}
              </p>
              
              <div class="mt-auto pt-4 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center">
                <span class="text-xs text-zinc-400 font-medium">{{ formatDate(item.pubDate) }}</span>
                <span class="text-xs font-bold text-indigo-500 flex items-center gap-1">
                  MORE
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          </TransitionGroup>
        </div>

        <!-- Infinite Scroll Sentinel -->
        <div ref="sentinel" class="h-20 flex items-center justify-center">
          <div v-if="filteredNews.length > visibleCount" class="flex gap-1">
            <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && displayedNews.length === 0" class="flex flex-col items-center justify-center py-40 text-center">
        <div class="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-200 dark:border-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2 text-zinc-400">Searching for trends...</h3>
        <p class="text-zinc-500 text-sm">Please wait while we fetch the latest data.</p>
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
const visibleCount = ref(12)
const sentinel = ref<HTMLElement | null>(null)

const categories = [
  { id: 'all', name: 'All News' },
  { id: 'ai', name: 'AI & Tech' },
  { id: 'finance', name: 'Finance' },
  { id: 'design', name: 'Design' }
]

const RSS_SOURCES = [
  { name: '한경 AI/IT', url: 'https://www.hankyung.com/feed/it', category: 'ai' },
  { name: 'TechCrunch (Global)', url: 'https://techcrunch.com/feed/', category: 'ai' },
  { name: '한경 경제/금융', url: 'https://www.hankyung.com/feed/finance', category: 'finance' },
  { name: 'Behance Featured', url: 'https://www.behance.net/feeds/projects', category: 'design' },
  { name: 'Dribbble Popular', url: 'https://dribbble.com/shots/popular.rss', category: 'design' }
]

const filteredNews = computed(() => {
  if (activeCategory.value === 'all') return news.value
  return news.value.filter(item => item.category === activeCategory.value)
})

const displayedNews = computed(() => {
  return filteredNews.value.slice(0, visibleCount.value)
})

watch(activeCategory, () => {
  visibleCount.value = 12
})

const fetchNews = async () => {
  isLoading.value = true
  
  // 1. Load from cache first for instant UI
  const cachedNews = localStorage.getItem('uxm_trends_cache')
  if (cachedNews) {
    news.value = JSON.parse(cachedNews)
    isLoading.value = false
  }

  const fetchSource = async (source: typeof RSS_SOURCES[0]) => {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}&timestamp=${Date.now()}`
      const response = await fetch(proxyUrl)
      if (!response.ok) return []
      
      const data = await response.json()
      if (!data.contents) return []
      
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(data.contents, 'text/xml')
      const items = xmlDoc.querySelectorAll('item')
      const parsedItems: NewsItem[] = []
      
      items.forEach((item, idx) => {
        if (idx > 12) return // Optimized limit
        
        const title = item.querySelector('title')?.textContent || ''
        const link = item.querySelector('link')?.textContent || ''
        let pubDate = item.querySelector('pubDate')?.textContent || ''
        let description = item.querySelector('description')?.textContent || ''
        
        description = description.replace(/<[^>]*>?/gm, '').trim()
        if (description.length > 180) description = description.slice(0, 180) + '...'
        if (!description) description = '상세 내용을 확인하시려면 클릭하세요.'
        
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
  }

  // 2. Fetch all sources in parallel for speed
  const results = await Promise.all(RSS_SOURCES.map(fetchSource))
  const flattenedResults = results.flat().sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )

  if (flattenedResults.length > 0) {
    news.value = flattenedResults
    // 3. Update cache
    localStorage.setItem('uxm_trends_cache', JSON.stringify(flattenedResults))
  }
  
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
  
  // Infinite Scroll Observer
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && filteredNews.value.length > visibleCount.value) {
      visibleCount.value += 12
    }
  }, { threshold: 0.1 })

  if (sentinel.value) {
    observer.observe(sentinel.value)
  }
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
