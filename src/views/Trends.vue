<template>
  <div 
    class="min-h-screen bg-zinc-50 dark:bg-[#0a0a0c] text-zinc-900 dark:text-white relative"
  >
    <SiteNavbar />
    
    <div class="pt-14">
      <SiteBanner message="뉴스부터 우리들의 이야기까지, Todays News의 새로운 피드 기능을 만나보세요." />
    </div>

    <SiteHeader 
      title="News Stand" 
      description="주요 언론사의 실시간 뉴스 피드를 한곳에서 확인하세요"
      padding-top="pt-16"
    />

    <!-- Stable Anchor for Scroll Positioning -->
    <div ref="scrollAnchor" class="h-px"></div>

    <!-- Category Tabs: Sticky Logic -->
    <div 
      ref="tabsRef"
      class="sticky z-40 bg-zinc-50/90 dark:bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 mb-12 transition-all duration-0"
      :style="{ top: `max(0px, 56px + var(--nav-y, 0px))` }"
    >
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
              @click="changeCategory(cat.id)"
              :data-cat="cat.id"
              :data-active="activeCategory === cat.id"
              class="category-tab relative pt-2 pb-3 text-sm font-bold whitespace-nowrap flex-shrink-0 tracking-tight"
              :class="activeCategory === cat.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'"
            >
              {{ cat.name }}

              <!-- Active Underline: Sharp 2px line above the divider -->
              <div 
                v-if="activeCategory === cat.id" 
                class="active-underline absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-900 dark:bg-white z-10"
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
                 class="news-card group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl p-5 hover:-translate-y-1 transition-transform duration-300"
                 :class="`theme-${item.category}`"
              >
                <div class="flex justify-between items-center mb-4">
                  <span class="source-badge px-2.5 py-1 rounded-md text-[12px] font-black uppercase tracking-normal border">
                    {{ getCategoryName(item.category) }}
                  </span>
                  <span class="text-[11px] text-zinc-400 font-bold uppercase tracking-tight">{{ item.provider || item.source }}</span>
                </div>
                
                <h3 class="text-lg font-bold text-zinc-900 dark:text-white leading-tight mb-4 min-h-[2.8rem] line-clamp-2 group-hover:opacity-80">
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

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import SiteNavbar from '../components/SiteNavbar.vue'
import SiteFooter from '../components/SiteFooter.vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteBanner from '../components/SiteBanner.vue'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  description: string
  source: string
  category: string
  provider: string
}

const isLoading = ref(true)
const activeCategory = ref('all')
const news = ref<NewsItem[]>([])
const visibleCount = ref(50)

const getCategoryName = (id: string) => {
  const cat = categories.find(c => c.id === id)
  return cat ? cat.name : id
}

// Navigation Visibility (Synced via SiteNavbar)
const isNavVisible = ref(true)
const lastScrollY = ref(0)
const tabsRef = ref<HTMLElement | null>(null)
const scrollAnchor = ref<HTMLElement | null>(null)

const changeCategory = async (id: string) => {
  activeCategory.value = id
  
  // Force Nav visible to make the target offset (64px) predictable
  isNavVisible.value = true
  
  await nextTick()
  
  if (scrollAnchor.value) {
    // We use the Anchor offsetTop which is stable regardless of sticky state
    const targetScrollY = scrollAnchor.value.offsetTop - 56
    
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    })
  }
}

const handleScroll = () => {
  const currentScrollY = window.scrollY
  const delta = currentScrollY - lastScrollY.value
  
  // Navigation visibility logic for synchronized UI
  if (currentScrollY < 56 && delta >= 0) {
    isNavVisible.value = true
  } else {
    if (delta > 8) {
      isNavVisible.value = false
    } else if (delta < -15) {
      isNavVisible.value = true
    }
    
    if (currentScrollY <= 0) {
      isNavVisible.value = true
    }
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



const categories = [
  { id: 'all', name: 'All News' },
  { id: 'ai', name: 'AI & Tech' },
  { id: 'finance', name: 'Finance' },
  { id: 'game', name: 'Game' },
  { id: 'sports', name: 'Sports' },
  { id: 'design', name: 'Design' }
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
        const timeoutId = setTimeout(() => controller.abort(), 4000) // Reduced timeout for speed
        
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
          if (idx >= 100) return 
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
          
          // Smart Headline & Provider Extraction
          // Google News usually formats as "Headline - Source"
          const parts = title.split(/ - | \| | : /)
          const headline = parts[0].trim()
          const provider = parts.length > 1 ? parts[parts.length - 1].trim() : ''
          
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
              title: headline,
              link,
              pubDate,
              description: cleanDesc || '기사 본문을 통해 자세한 내용을 확인하세요.',
              source: source.name,
              category: source.category,
              provider: provider
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

.category-tab {
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Category Themes using CSS Variables */
.theme-ai { --brand-color: #6366f1; --brand-bg: rgba(99, 102, 241, 0.05); }
.theme-finance { --brand-color: #0acaaa; --brand-bg: rgba(10, 202, 170, 0.05); }
.theme-design { --brand-color: #fa4fc1; --brand-bg: rgba(250, 79, 193, 0.05); }
.theme-sports { --brand-color: #5196fd; --brand-bg: rgba(81, 150, 253, 0.05); }
.theme-game { --brand-color: #9333ea; --brand-bg: rgba(147, 51, 234, 0.05); }

/* Apply Theme to Header Tabs */
.category-tab[data-cat="all"] .active-underline { background-color: #18181b; }
.dark .category-tab[data-cat="all"] .active-underline { background-color: white !important; }

/* Active Title & Underline Colors */
.category-tab[data-cat="ai"][data-active="true"] { color: #6366f1 !important; }
.category-tab[data-cat="ai"][data-active="true"] .active-underline { background-color: #6366f1; }

.category-tab[data-cat="finance"][data-active="true"] { color: #0acaaa !important; }
.category-tab[data-cat="finance"][data-active="true"] .active-underline { background-color: #0acaaa; }

.category-tab[data-cat="design"][data-active="true"] { color: #fa4fc1 !important; }
.category-tab[data-cat="design"][data-active="true"] .active-underline { background-color: #fa4fc1; }

.category-tab[data-cat="sports"][data-active="true"] { color: #5196fd !important; }
.category-tab[data-cat="sports"][data-active="true"] .active-underline { background-color: #5196fd; }

.category-tab[data-cat="game"][data-active="true"] { color: #9333ea !important; }
.category-tab[data-cat="game"][data-active="true"] .active-underline { background-color: #9333ea; }


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


</style>
