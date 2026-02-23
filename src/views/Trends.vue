<template>
  <div 
    class="min-h-screen bg-zinc-50 dark:bg-[#0a0a0c] text-zinc-900 dark:text-white transition-colors duration-500 relative"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Navigation Area: Fixed with smooth translation -->
    <div 
      class="fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out"
      :class="isNavVisible ? 'translate-y-0' : '-translate-y-full'"
      :style="isFixed ? {} : { transform: `translateY(${-Math.min(scrollY, 100)}px)` }"
    >
      <SiteNavbar :isFixed="false" class="h-[64px] !py-4" />
    </div>

    <!-- Page Header: Title/Description (Scrolls Away) -->
    <header class="pt-32 px-6 md:px-10 max-w-[1800px] mx-auto mb-8 transition-opacity duration-300">
      <!-- Pull to Refresh Icon -->
      <div 
        class="flex items-center justify-center overflow-hidden transition-all duration-300"
        :style="{ height: (pullDistance > 0 || (isLoading && isPulling)) ? '60px' : '0px' }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-zinc-400" :class="{ 'animate-smooth-spin': isLoading }" fill="none" viewBox="0 0 24 24" stroke="currentColor" :style="{ transform: `rotate(${pullDistance * 2}deg)` }">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>

      <div class="space-y-4">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight">News Stand</h1>
        <p class="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl leading-relaxed">
          지금 가장 뜨거운 최신 뉴스 트렌드를 확인하고 새로운 영감을 얻어보세요.
        </p>
      </div>
    </header>

    <!-- Category Tabs -->
    <div class="bg-zinc-50 dark:bg-[#0a0a0c] border-b border-zinc-200 dark:border-white/10 mb-8">
      <div class="px-6 md:px-10 max-w-[1800px] mx-auto pt-4 pb-0">
        <div class="relative group/tabs">
          <div 
            class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-50 dark:from-[#0a0a0c] to-transparent pointer-events-none z-10 transition-opacity"
            :class="showLeftGradient ? 'opacity-100' : 'opacity-0'"
          ></div>

          <div 
            ref="scrollContainer"
            class="flex items-center gap-6 overflow-x-auto no-scrollbar touch-pan-x"
            @scroll="checkScroll"
          >
            <button 
              v-for="cat in categories" 
              :key="cat.id"
              @click="activeCategory = cat.id"
              class="relative pt-2 pb-3 text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 tracking-tight"
              :class="activeCategory === cat.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'"
            >
              {{ cat.name }}
              <!-- Active Underline: Positioned above the divider -->
              <div 
                v-if="activeCategory === cat.id" 
                class="absolute bottom-0 left-0 right-0 h-[2.5px] bg-zinc-900 dark:bg-white rounded-t-full z-10"
              ></div>
            </button>
          </div>

          <div 
            class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-50 dark:from-[#0a0a0c] to-transparent pointer-events-none z-10 transition-opacity"
            :class="showRightGradient ? 'opacity-100' : 'opacity-0'"
          ></div>
        </div>
      </div>
    </div>


    <main class="px-6 md:px-10 pb-10 max-w-[1800px] mx-auto">
      <div v-if="isLoading && news.length === 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <div v-for="i in 10" :key="i" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 animate-pulse h-40">
          <div class="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded mb-3"></div>
          <div class="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
          <div class="h-4 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
          <div class="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded mt-auto"></div>
        </div>
      </div>

      <div v-else class="space-y-10">
        <div v-for="group in groupedNews" :key="group.date" class="space-y-6">
          <h2 class="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase whitespace-nowrap mb-6">📅 {{ group.date }}</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <TransitionGroup name="list">
              <a v-for="(item, index) in group.items" 
                 :key="item.link + index" 
                 :href="item.link" 
                 target="_blank"
                 class="news-card group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1"
                 :class="`theme-${item.category}`"
              >
                <div class="flex justify-between items-center mb-4">
                  <span class="source-badge px-2.5 py-1 rounded-md text-[12px] font-black uppercase tracking-normal border transition-colors">
                    {{ item.source }}
                  </span>
                  <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">{{ item.category }}</span>
                </div>
                
                <h3 class="text-lg font-bold text-zinc-900 dark:text-white leading-tight mb-5 transition-colors line-clamp-3 group-hover:opacity-80">
                  {{ item.title }}
                </h3>
                
                <div class="pt-4 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center">
                  <span class="text-[11px] text-zinc-400 font-medium">{{ formatDate(item.pubDate) }}</span>
                  <span class="more-link text-[11px] font-bold flex items-center gap-1">
                    더 보기
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </a>
            </TransitionGroup>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="filteredNews.length > visibleCount" class="flex justify-center pt-10 pb-20">
          <button 
            @click="visibleCount += 20"
            class="px-12 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-semibold text-base leading-normal tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            헤드라인 더보기
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

    <!-- Footer Section -->
    <footer class="border-t border-zinc-100 dark:border-white/5 py-16 px-6 md:px-10">
      <div class="max-w-[1800px] mx-auto text-left space-y-4">
        <p class="text-sm font-black text-zinc-400 dark:text-zinc-500 tracking-tight">
          @uxmanual
        </p>
        <p class="text-xs leading-snug text-zinc-400 dark:text-zinc-500 max-w-2xl">
          본 사이트에서 제공하는 뉴스 콘텐츠는 각 언론사의 RSS를 통해 수집된 정보이며, <br class="hidden sm:block">
          기사 본문에 대한 저작권은 해당 언론사에 있습니다. 각 기사는 클릭 시 해당 언론사의 원문 페이지로 연결됩니다.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
const visibleCount = ref(50)

// Navigation Reveal Logic
const isNavVisible = ref(true)
const isFixed = ref(false)
const scrollY = ref(0)
const lastScrollY = ref(0)

const handleScroll = () => {
  const currentScrollY = window.scrollY
  scrollY.value = currentScrollY
  const threshold = 180 
  
  // 1. Top Area: Follow scroll via transform
  if (currentScrollY < threshold) {
    if (isFixed.value) isFixed.value = false
    isNavVisible.value = true
    lastScrollY.value = currentScrollY
    return
  }
  
  // 2. Beyond Header: Set Fixed
  if (!isFixed.value && currentScrollY > threshold + 20) {
    isFixed.value = true
  }
  const delta = currentScrollY - lastScrollY.value
  
  if (delta > 5) {
    // Scrolling Down -> Hide
    isNavVisible.value = false
  } else if (delta < -15) {
    // Scrolling Up -> Show
    isNavVisible.value = true
  }
  
  lastScrollY.value = currentScrollY
}

// Tab Scroll Indicators logic
const scrollContainer = ref<HTMLElement | null>(null)
const showLeftGradient = ref(false)
const showRightGradient = ref(false)

const checkScroll = () => {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  showLeftGradient.value = scrollLeft > 10
  showRightGradient.value = scrollLeft < scrollWidth - clientWidth - 10
}

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
  { id: 'sports', name: 'Sports' },
  { id: 'game', name: 'Game' }
]

const RSS_SOURCES = [
  { name: '매경 IT', url: 'https://www.mk.co.kr/rss/50300001/', category: 'ai' },
  { name: 'ZDNet IT', url: 'https://zdnet.co.kr/rss/all.xml', category: 'ai' },
  { name: 'AI 트렌드', url: 'https://news.google.com/rss/search?q=AI+%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5+%ED%8A%B8%EB%A0%8C%EB%93%9C&hl=ko&gl=KR&ceid=KR:ko', category: 'ai' },
  { name: '매경 경제', url: 'https://www.mk.co.kr/rss/30100041/', category: 'finance' },
  { name: '금융 소식', url: 'https://news.google.com/rss/search?q=%EA%B8%88%EC%9C%B5+%EC%A6%9D%EA%B6%8C&hl=ko&gl=KR&ceid=KR:ko', category: 'finance' },
  { name: '디자인 트렌드', url: 'https://news.google.com/rss/search?q=%EB%94%94%EC%9E%90%EC%9D%B8+%ED%8A%B8%EB%A0%8C%EB%93%9C&hl=ko&gl=KR&ceid=KR:ko', category: 'design' },
  { name: 'UX/UI 디자인', url: 'https://news.google.com/rss/search?q=UX+UI+%EB%94%94%EC%9E%90%EC%9D%B8&hl=ko&gl=KR&ceid=KR:ko', category: 'design' },
  { name: '해외축구', url: 'https://news.google.com/rss/search?q=%ED%95%B4%EC%99%B8%EC%B6%95%EA%B5%AC&hl=ko&gl=KR&ceid=KR:ko', category: 'sports' },
  { name: '유럽 축구', url: 'https://news.google.com/rss/search?q=%EC%9C%A0%EB%9F%BD%EC%B6%95%EA%B5%AC&hl=ko&gl=KR&ceid=KR:ko', category: 'sports' },
  { name: '디스이즈게임', url: 'https://news.google.com/rss/search?q=site:thisisgame.com&hl=ko&gl=KR&ceid=KR:ko', category: 'game' },
  { name: '인벤 뉴스', url: 'https://news.google.com/rss/search?q=site:inven.co.kr&hl=ko&gl=KR&ceid=KR:ko', category: 'game' },
  { name: '게임메카', url: 'https://news.google.com/rss/search?q=site:gamemeca.com&hl=ko&gl=KR&ceid=KR:ko', category: 'game' },
  { name: '게임 트렌드', url: 'https://news.google.com/rss/search?q=%EA%B2%8C%EC%9E%84+%EC%8B%A0%EC%9E%91+%ED%8A%B8%EB%A0%8C%EB%93%9C&hl=ko&gl=KR&ceid=KR:ko', category: 'game' }
]

const filteredNews = computed(() => {
  if (activeCategory.value === 'all') return news.value
  return news.value.filter(item => item.category === activeCategory.value)
})

const displayedNews = computed(() => {
  return filteredNews.value.slice(0, visibleCount.value)
})

const groupedNews = computed(() => {
  const groups: { date: string, items: NewsItem[] }[] = []
  
  displayedNews.value.forEach(item => {
    const pubDate = new Date(item.pubDate)
    const dateStr = `${pubDate.getFullYear()}년 ${pubDate.getMonth() + 1}월 ${pubDate.getDate()}일`
    
    let group = groups.find(g => g.date === dateStr)
    if (!group) {
      group = { date: dateStr, items: [] }
      groups.push(group)
    }
    group.items.push(item)
  })
  
  return groups
})

watch(activeCategory, () => {
  visibleCount.value = 50
})


const fetchNews = async () => {
  // 1. Initial Cache Load (Instant)
  const CACHE_KEY = 'uxm_trends_cache_v2' // Incremented version to clear old tainted data
  if (news.value.length === 0) {
    const cached = localStorage.getItem(CACHE_KEY)
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
          const title = (item.querySelector('title')?.textContent || '').trim()
          const link = (item.querySelector('link')?.textContent || '').trim()
          const pubDate = (item.querySelector('pubDate')?.textContent || '').trim()
          
          // Try to find a meaningful description
          let description = ''
          const descNode = item.querySelector('description')
          const contentNode = item.getElementsByTagName('content:encoded')[0] || item.querySelector('encoded')
          const summaryNode = item.querySelector('summary')
          
          description = (descNode?.textContent || '') || (summaryNode?.textContent || '') || (contentNode?.textContent || '')

          // Clean up HTML
          let cleanDesc = description.replace(/<[^>]*>?/gm, ' ')
                                   .replace(/&nbsp;/g, ' ')
                                   .replace(/&quot;/g, '"')
                                   .replace(/&amp;/g, '&')
                                   .replace(/&lt;/g, '<')
                                   .replace(/&gt;/g, '>')
                                   .replace(/\s+/g, ' ')
                                   .trim()
          
          // Smart Headline Extraction: Remove source suffix from title to better match description
          // Handle "Title - Source", "Title | Source", "Title : Source", "Title(Source)"
          const headline = title.split(/ - | \| | : /)[0].trim()
          
          // If description starts with title or extracted headline, try to extract the rest
          if (cleanDesc.toLowerCase().startsWith(title.toLowerCase())) {
            cleanDesc = cleanDesc.substring(title.length).trim()
          } else if (cleanDesc.toLowerCase().startsWith(headline.toLowerCase())) {
            cleanDesc = cleanDesc.substring(headline.length).trim()
          }
          
          // Alternative check: See if first 20 chars overlap
          if (headline.length > 20 && cleanDesc.toLowerCase().startsWith(headline.substring(0, 20).toLowerCase())) {
             const potentialSnippet = cleanDesc.replace(headline, '').trim()
             if (potentialSnippet.length > 5) cleanDesc = potentialSnippet
          }
          
          // Remove source name if it's appended at the end
          const sourceSuffix = ` - ${source.name}`
          if (cleanDesc.endsWith(sourceSuffix)) {
            cleanDesc = cleanDesc.substring(0, cleanDesc.length - sourceSuffix.length).trim()
          }

          // Final cleanup of common leading noise (commas, dots, dashes, colons)
          cleanDesc = cleanDesc.replace(/^[:\-\s\.\,]+/, '').trim()
          
          if (title && link) {
            parsedItems.push({
              title,
              link,
              pubDate,
              description: cleanDesc || '기사 본문을 통해 자세한 내용을 확인하세요.',
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
    const combined = [...nextNews, ...news.value]
    const newsMap = new Map()
    combined.forEach(item => {
      const existing = newsMap.get(item.link)
      if (!existing || new Date(item.pubDate) > new Date(existing.pubDate)) {
        newsMap.set(item.link, item)
      }
    })

    const finalized = Array.from(newsMap.values())
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 500)

    news.value = finalized
    localStorage.setItem(CACHE_KEY, JSON.stringify(finalized))
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


const fetchInterval = ref<any>(null)

onMounted(() => {
  fetchNews()
  setTimeout(checkScroll, 500) // Initial scroll check
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // Refresh every 5 mins
  fetchInterval.value = setInterval(fetchNews, 5 * 60 * 1000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (fetchInterval.value) clearInterval(fetchInterval.value)
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
.theme-game { --brand-color: #9333ea; --brand-bg: rgba(147, 51, 234, 0.05); }

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
button[data-cat="game"] .active-underline { background-color: #9333ea; }

/* Refined News Card Styling */
.news-card.theme-ai { --brand-color: #6366f1; --brand-bg: rgba(99, 102, 241, 0.05); }
.news-card.theme-finance { --brand-color: #0acaaa; --brand-bg: rgba(10, 202, 170, 0.05); }
.news-card.theme-design { --brand-color: #fa4fc1; --brand-bg: rgba(250, 79, 193, 0.05); }
.news-card.theme-sports { --brand-color: #5196fd; --brand-bg: rgba(81, 150, 253, 0.05); }
.news-card.theme-game { --brand-color: #9333ea; --brand-bg: rgba(147, 51, 234, 0.05); }

.news-card:hover {
  border-color: rgba(var(--brand-color), 0.5); /* This won't work with hex directly in CSS overlay, using fallbacks */
}

/* Precision Hex Border for hover */
.news-card.theme-ai:hover { border-color: #6366f180; }
.news-card.theme-finance:hover { border-color: #0acaaa80; }
.news-card.theme-design:hover { border-color: #fa4fc180; }
.news-card.theme-sports:hover { border-color: #5196fd80; }
.news-card.theme-game:hover { border-color: #9333ea80; }

.source-badge {
  background-color: var(--brand-bg);
  color: var(--brand-color);
  border-color: rgba(0, 0, 0, 0.05); /* Default */
}

.news-card.theme-ai .source-badge { border-color: #6366f130; }
.news-card.theme-finance .source-badge { border-color: #0acaaa30; }
.news-card.theme-design .source-badge { border-color: #fa4fc130; }
.news-card.theme-sports .source-badge { border-color: #5196fd30; }
.news-card.theme-game .source-badge { border-color: #9333ea30; }

.more-link {
  color: var(--brand-color);
}

.animate-smooth-spin {
  animation: smooth-spin 0.8s linear infinite;
}

@keyframes smooth-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
