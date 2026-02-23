<template>
  <div 
    class="min-h-screen bg-zinc-50 dark:bg-[#0a0a0c] text-zinc-900 dark:text-white transition-colors duration-500 relative"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <SiteNavbar />

    <SiteNavbar />

    <header class="pt-[120px] px-6 md:px-10 max-w-[1800px] mx-auto mb-10 overflow-hidden">
      <!-- Inline Pull to Refresh Area -->
      <div 
        class="transition-all duration-300 flex items-center justify-center overflow-hidden"
        :style="{ 
          height: (pullDistance > 0 || (isLoading && isPulling)) ? '64px' : '0px',
          opacity: pullingProgress || (isLoading && isPulling ? 1 : 0)
        }"
      >
        <div class="pt-0 pb-10">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="w-6 h-6 text-indigo-500" 
            :class="{ 'animate-spin': isLoading }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            :style="{ transform: `rotate(${pullDistance * 2}deg)` }"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

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
            지금 가장 뜨거운 최신 뉴스 트렌드를 확인하고 새로운 영감을 얻어보세요.
          </p>
        </div>
        
        <div class="flex items-center gap-8 overflow-x-auto no-scrollbar max-w-full border-b border-zinc-100 dark:border-white/5">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="activeCategory = cat.id"
            :data-cat="cat.id"
            class="relative pb-2 pt-2 text-sm font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 tracking-tight"
            :class="activeCategory === cat.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'"
          >
            {{ cat.name }}
            <!-- Active Underline -->
            <div 
              class="active-underline absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 transform scale-x-100"
              v-if="activeCategory === cat.id"
            ></div>
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
               class="news-card group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1"
               :class="`theme-${item.category}`"
            >
              <div class="flex justify-between items-center mb-4">
                <span class="source-badge px-2.5 py-1 rounded-md text-[12px] font-black uppercase tracking-widest border transition-colors">
                  {{ item.source }}
                </span>
                <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">{{ item.category }}</span>
              </div>
              
              <h3 class="text-lg font-bold text-zinc-900 dark:text-white leading-tight mb-3 transition-colors line-clamp-2 group-hover:opacity-80">
                {{ item.title }}
              </h3>
              
              <p class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {{ item.description }}
              </p>
              
              <div class="mt-auto pt-4 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center">
                <span class="text-xs text-zinc-400 font-medium">{{ formatDate(item.pubDate) }}</span>
                <span class="more-link text-xs font-bold flex items-center gap-1">
                  MORE
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          </TransitionGroup>
        </div>

        <!-- Load More Button -->
        <div v-if="filteredNews.length > visibleCount" class="flex justify-center pt-10 pb-20">
          <button 
            @click="visibleCount += 20"
            class="px-12 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Load More Trends
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
const visibleCount = ref(20)

// Pull to Refresh Logic
const startY = ref(0)
const pullDistance = ref(0)
const isPulling = ref(false)
const pullingProgress = computed(() => Math.min(pullDistance.value / 80, 1))

const handleTouchStart = (e: TouchEvent) => {
  if (window.scrollY <= 0) {
    startY.value = e.touches[0].pageY
    isPulling.value = true
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isPulling.value) return
  const currentY = e.touches[0].pageY
  const diff = currentY - startY.value
  
  if (diff > 0 && window.scrollY <= 0) {
    // Apply rubber band effect
    pullDistance.value = Math.pow(diff, 0.85)
    if (pullDistance.value > 10) {
      if (e.cancelable) e.preventDefault()
    }
  } else {
    pullDistance.value = 0
    isPulling.value = false
  }
}

const handleTouchEnd = async () => {
  if (!isPulling.value) return
  
  if (pullDistance.value > 60) {
    // Snap to hold position while refreshing
    pullDistance.value = 40
    await fetchNews()
  }
  
  // Smooth reset after fetch or if threshold not met
  const animate = () => {
    if (pullDistance.value > 0) {
      pullDistance.value = Math.max(0, pullDistance.value - 8)
      requestAnimationFrame(animate)
    } else {
      isPulling.value = false
      pullDistance.value = 0
    }
  }
  animate()
}

const categories = [
  { id: 'all', name: 'All News' },
  { id: 'ai', name: 'AI & Tech' },
  { id: 'finance', name: 'Finance' },
  { id: 'design', name: 'Design' },
  { id: 'sports', name: 'Sports' }
]

const RSS_SOURCES = [
  { name: '매경 IT', url: 'https://www.mk.co.kr/rss/50300001/', category: 'ai' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'ai' },
  { name: '매경 경제', url: 'https://www.mk.co.kr/rss/30100041/', category: 'finance' },
  { name: '금융 소식', url: 'https://news.google.com/rss/search?q=%EA%B8%88%EC%9C%B5+%EC%A6%9D%EA%B6%8C&hl=ko&gl=KR&ceid=KR:ko', category: 'finance' },
  { name: '디자인 트렌드', url: 'https://news.google.com/rss/search?q=%EB%94%94%EC%9E%90%EC%9D%B8+%ED%8A%B8%EB%A0%8C%EB%93%9C&hl=ko&gl=KR&ceid=KR:ko', category: 'design' },
  { name: 'UX/UI 디자인', url: 'https://news.google.com/rss/search?q=UX+UI+%EB%94%94%EC%9E%90%EC%9D%B8&hl=ko&gl=KR&ceid=KR:ko', category: 'design' },
  { name: '스포츠 뉴스', url: 'https://news.google.com/rss/search?q=%EC%8A%A4%ED%8F%AC%EC%B8%A0&hl=ko&gl=KR&ceid=KR:ko', category: 'sports' },
  { name: '국내 축구', url: 'https://news.google.com/rss/search?q=%ED%95%9C%EA%B5%AD+%EC%B6%95%EA%B5%AC&hl=ko&gl=KR&ceid=KR:ko', category: 'sports' }
]

const filteredNews = computed(() => {
  if (activeCategory.value === 'all') return news.value
  return news.value.filter(item => item.category === activeCategory.value)
})

const displayedNews = computed(() => {
  return filteredNews.value.slice(0, visibleCount.value)
})

watch(activeCategory, () => {
  visibleCount.value = 20
})

// Category theme mapping based on CSS classes handled in <style>
const getCategoryTheme = (cat: string) => cat

const fetchNews = async () => {
  // 1. Initial Cache Load (Instant)
  if (news.value.length === 0) {
    const cached = localStorage.getItem('uxm_trends_cache')
    if (cached) {
      const parsed = JSON.parse(cached)
      news.value = parsed.sort((a: NewsItem, b: NewsItem) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    }
  }
  
  isLoading.value = true

  const fetchSource = async (source: typeof RSS_SOURCES[0]) => {
    const proxies = [
      (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
      (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&timestamp=${Date.now()}`
    ]

    for (const getProxyUrl of proxies) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 6000)
        
        const response = await fetch(getProxyUrl(source.url), { signal: controller.signal })
        clearTimeout(timeoutId)
        
        if (!response.ok) continue

        let xmlString = ''
        if (getProxyUrl(source.url).includes('allorigins')) {
          const data = await response.json()
          xmlString = data.contents
        } else {
          xmlString = await response.text()
        }

        if (!xmlString) continue

        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
        const items = xmlDoc.querySelectorAll('item')
        const parsedItems: NewsItem[] = []
        
        items.forEach((item, idx) => {
          if (idx >= 30) return 
          const title = item.querySelector('title')?.textContent || ''
          const link = item.querySelector('link')?.textContent || ''
          const pubDate = item.querySelector('pubDate')?.textContent || ''
          let description = item.querySelector('description')?.textContent || ''
          
          description = description.replace(/<[^>]*>?/gm, '').trim()
          
          if (title && link) {
            parsedItems.push({
              title,
              link,
              pubDate,
              description: description || '뉴스 본문을 통해 자세한 내용을 확인하세요.',
              source: source.name,
              category: source.category
            })
          }
        })

        if (parsedItems.length > 0) return parsedItems
      } catch (err) {
        // Silent fail for individual proxy
      }
    }
    return []
  }

  // 2. Fetch all in parallel for maximum speed
  const results = await Promise.all(RSS_SOURCES.map(source => fetchSource(source)))
  const nextNews = results.flat()

  // 3. Robust Merge & Sort
  if (nextNews.length > 0) {
    // Merge new items with current ones, prioritize newer versions of the same link
    const combined = [...nextNews, ...news.value]
    
    // Use a Map for O(1) deduplication by Link
    const newsMap = new Map()
    combined.forEach(item => {
      const existing = newsMap.get(item.link)
      if (!existing || new Date(item.pubDate) > new Date(existing.pubDate)) {
        newsMap.set(item.link, item)
      }
    })

    // Strict Chronological Sort
    const finalized = Array.from(newsMap.values())
      .sort((a, b) => {
        const timeA = new Date(a.pubDate).getTime()
        const timeB = new Date(b.pubDate).getTime()
        return timeB - timeA
      })
      .slice(0, 500) // Keep more for "All News"

    news.value = finalized
    localStorage.setItem('uxm_trends_cache', JSON.stringify(finalized))
  }
  
  isLoading.value = false
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchNews()
  
  const interval = setInterval(fetchNews, 5 * 60 * 1000) // Refresh every 5 mins
  return () => {
    clearInterval(interval)
  }
})
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: opacity 0.2s linear;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Category Themes using CSS Variables */
.theme-ai, button:has(.active-underline) { --brand-color: #6366f1; --brand-bg: rgba(99, 102, 241, 0.05); }
.theme-finance { --brand-color: #0acaaa; --brand-bg: rgba(10, 202, 170, 0.05); }
.theme-design { --brand-color: #fa4fc1; --brand-bg: rgba(250, 79, 193, 0.05); }
.theme-sports { --brand-color: #5196fd; --brand-bg: rgba(81, 150, 253, 0.05); }

/* Apply Theme to Header Tabs */
button:has(.active-underline) .active-underline {
  background-color: var(--brand-color);
}

/* Handle specific tab brands if activeCategory matches */
button[data-cat="all"] .active-underline { background-color: currentColor; }
button[data-cat="ai"] .active-underline { background-color: #6366f1; }
button[data-cat="finance"] .active-underline { background-color: #0acaaa; }
button[data-cat="design"] .active-underline { background-color: #fa4fc1; }
button[data-cat="sports"] .active-underline { background-color: #5196fd; }

/* Refined News Card Styling */
.news-card.theme-ai { --brand-color: #6366f1; --brand-bg: rgba(99, 102, 241, 0.05); }
.news-card.theme-finance { --brand-color: #0acaaa; --brand-bg: rgba(10, 202, 170, 0.05); }
.news-card.theme-design { --brand-color: #fa4fc1; --brand-bg: rgba(250, 79, 193, 0.05); }
.news-card.theme-sports { --brand-color: #5196fd; --brand-bg: rgba(81, 150, 253, 0.05); }

.news-card:hover {
  border-color: rgba(var(--brand-color), 0.5); /* This won't work with hex directly in CSS overlay, using fallbacks */
}

/* Precision Hex Border for hover */
.news-card.theme-ai:hover { border-color: #6366f180; }
.news-card.theme-finance:hover { border-color: #0acaaa80; }
.news-card.theme-design:hover { border-color: #fa4fc180; }
.news-card.theme-sports:hover { border-color: #5196fd80; }

.source-badge {
  background-color: var(--brand-bg);
  color: var(--brand-color);
  border-color: rgba(0, 0, 0, 0.05); /* Default */
}

.news-card.theme-ai .source-badge { border-color: #6366f130; }
.news-card.theme-finance .source-badge { border-color: #0acaaa30; }
.news-card.theme-design .source-badge { border-color: #fa4fc130; }
.news-card.theme-sports .source-badge { border-color: #5196fd30; }

.more-link {
  color: var(--brand-color);
}
</style>
