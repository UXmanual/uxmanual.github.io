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

    <main class="px-6 md:px-10 pb-32 max-w-[1200px] mx-auto">
      <div v-if="isLoading && news.length === 0" class="space-y-4">
        <div v-for="i in 5" :key="i" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 animate-pulse flex items-center gap-6">
          <div class="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          <div class="flex-1 space-y-3">
            <div class="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div class="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-3">
        <TransitionGroup name="list">
          <a v-for="(item, index) in displayedNews" 
             :key="item.link + index" 
             :href="item.link" 
             target="_blank"
             class="group flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl p-5 transition-all duration-300 hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:shadow-xl hover:shadow-indigo-500/5"
          >
            <!-- Badge & Source -->
            <div class="flex flex-row md:flex-col items-center md:items-start gap-3 md:w-32 flex-shrink-0">
              <span class="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[9px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-white/5">
                {{ item.category }}
              </span>
              <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 truncate w-full">
                {{ item.source }}
              </span>
            </div>
            
            <!-- Content Area -->
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-bold text-zinc-900 dark:text-white leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                {{ item.title }}
              </h3>
              <p class="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-1">
                {{ item.description }}
              </p>
            </div>
            
            <!-- Date & Link -->
            <div class="flex items-center justify-between md:justify-end gap-6 md:w-32 flex-shrink-0">
              <span class="text-[10px] text-zinc-400 font-medium">{{ formatDate(item.pubDate) }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-zinc-300 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </TransitionGroup>

        <!-- Load More Section -->
        <div v-if="filteredNews.length > visibleCount" class="pt-10 flex justify-center">
          <button @click="visibleCount += 5" 
            class="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-500/10"
          >
            Show More Trends (+5)
          </button>
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
const visibleCount = ref(10)

const categories = [
  { id: 'all', name: 'All News' },
  { id: 'ai', name: 'AI & Tech' },
  { id: 'finance', name: 'Finance' },
  { id: 'crypto', name: 'Crypto' },
  { id: 'gtrends', name: 'Google Trends' }
]

const RSS_SOURCES = [
  { name: 'Google News AI (인공지능)', url: 'https://news.google.com/rss/search?q=%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5&hl=ko&gl=KR&ceid=KR:ko', category: 'ai' },
  { name: 'TechCrunch (Global)', url: 'https://techcrunch.com/feed/', category: 'ai' },
  { name: 'Google News Finance (경제)', url: 'https://news.google.com/rss/search?q=%ED%85%8C%ED%81%AC+%EA%B2%BD%EC%A0%9C&hl=ko&gl=KR&ceid=KR:ko', category: 'finance' },
  { name: 'CoinTelegraph KR (가상자산)', url: 'https://kr.cointelegraph.com/rss', category: 'crypto' },
  { name: 'Google 실시간 트렌드', url: 'https://trends.google.co.kr/trends/trendingsearches/daily/rss?geo=KR', category: 'gtrends' },
  { name: '실시간 검색어 (Signal)', url: 'https://api.signal.bz/news/rss', category: 'gtrends' }
]

const filteredNews = computed(() => {
  if (activeCategory.value === 'all') return news.value
  return news.value.filter(item => item.category === activeCategory.value)
})

const displayedNews = computed(() => {
  return filteredNews.value.slice(0, visibleCount.value)
})

watch(activeCategory, () => {
  visibleCount.value = 10
})

const fetchNews = async () => {
  isLoading.value = true
  news.value = []
  
  for (const source of RSS_SOURCES) {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}&timestamp=${Date.now()}`
      const response = await fetch(proxyUrl)
      if (!response.ok) continue
      
      const data = await response.json()
      if (!data.contents) continue
      
      const xmlString = data.contents
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
      
      const items = xmlDoc.querySelectorAll('item')
      const parsedItems: NewsItem[] = []
      
      items.forEach((item, idx) => {
        if (idx > 15) return // Limit per source
        
        const title = item.querySelector('title')?.textContent || ''
        const link = item.querySelector('link')?.textContent || ''
        let pubDate = item.querySelector('pubDate')?.textContent || ''
        let description = item.querySelector('description')?.textContent || ''
        
        // Handle Google Trends specific fields (ht:approx_traffic)
        const traffic = item.getElementsByTagName('ht:approx_traffic')[0]?.textContent
        if (traffic && source.category === 'gtrends') {
          description = `🔥 실시간 트래픽: ${traffic} | ${description}`
        }
        
        description = description.replace(/<[^>]*>?/gm, '').trim()
        if (description.length > 200) description = description.slice(0, 200) + '...'
        if (!description) description = '관련 보도자료 및 상세 내용을 확인하시려면 클릭하세요.'
        
        parsedItems.push({
          title,
          link,
          pubDate,
          description,
          source: source.name,
          category: source.category
        })
      })
      
      news.value = [...news.value, ...parsedItems].sort((a, b) => 
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      )
      
      if (news.value.length > 0) isLoading.value = false
    } catch (err) {
      console.error(`Error fetching ${source.name}:`, err)
    }
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
