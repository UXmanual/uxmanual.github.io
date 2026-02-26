<template>
  <div 
    class="min-h-screen bg-zinc-50 dark:bg-[#0a0a0c] text-zinc-900 dark:text-white relative transition-colors duration-200"
  >
    <SiteNavbar />
    
    <div class="pt-[60px]">
      <SiteBanner />
    </div>

    <SiteHeader 
      title="NEWS STAND" 
      description="주요 언론사의 실시간 뉴스 피드를 한곳에서 확인하세요"
      padding-top="pt-16"
      :enable-gradient="true"
    />

    <!-- Stable Anchor for Scroll Positioning -->
    <div ref="scrollAnchor" class="h-px"></div>

    <!-- Category Tabs: Sticky Logic -->
    <div 
      ref="tabsRef"
      class="sticky z-40 bg-zinc-50/90 dark:bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 mb-12 transition-all duration-200"
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


    <main 
      class="px-6 md:px-10 pb-20 max-w-[1800px] mx-auto overflow-hidden touch-pan-y relative"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <Transition :name="transitionName" mode="out-in">
        <div 
          :key="activeCategory" 
          class="content-wrapper"
        >
          <div v-if="groupedNews.length > 0" class="space-y-10">
            <div v-for="group in groupedNews" :key="group.date" class="space-y-6">
              <h2 class="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase whitespace-nowrap mb-6">📅 {{ group.date }}</h2>
              
              <TransitionGroup 
                name="list" 
                tag="div"
                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
              >
                <a v-for="(item, index) in group.items"
                   :key="item.link + index"
                   :href="item.link"
                   target="_blank"
                   class="news-card group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl p-5 transition-all duration-300"
                   :class="`theme-${item.category}`"
                >
                  <div class="flex justify-between items-center mb-4">
                    <span class="source-badge px-2.5 py-1 rounded-md text-[12px] font-black uppercase tracking-normal border">
                      {{ getCategoryName(item.category) }}
                    </span>
                    <span class="text-[11px] text-zinc-400 font-bold uppercase tracking-tight">{{ item.provider || item.source }}</span>
                  </div>
                  
                  <div class="flex gap-4 mb-4 items-center h-12">
                    <div v-if="item.thumb" class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-800">
                      <img :src="item.thumb" class="w-full h-full object-cover" alt="" loading="lazy" referrerpolicy="no-referrer" />
                    </div>
                    <h3 class="text-lg font-bold text-zinc-900 dark:text-white leading-tight line-clamp-2 title-element flex-grow">
                      {{ item.title }}
                    </h3>
                  </div>
                  
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

            <!-- Page Load More -->
            <div v-if="filteredNews.length > visibleCount" class="flex justify-center pt-10">
              <button 
                @click="visibleCount += 20"
                class="px-12 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-semibold text-base leading-normal tracking-tight active:scale-[0.98] transition-all"
              >
                헤드라인 더보기
              </button>
            </div>
          </div>

          <!-- Skeletons: Show when loading or no data yet -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <div v-for="i in 10" :key="i" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl p-5 animate-pulse flex flex-col h-[280px]">
              <div class="flex justify-between items-center mb-4">
                <div class="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
                <div class="h-3 w-20 bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
              </div>
              <div class="flex gap-4 mb-4 items-center h-12">
                <div class="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex-shrink-0"></div>
                <div class="flex-grow space-y-2">
                  <div class="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div class="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                </div>
              </div>
              <div class="space-y-2 mb-6">
                <div class="h-3 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
                <div class="h-3 w-4/5 bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
              </div>
              <div class="mt-auto pt-4 border-t border-zinc-100 dark:border-white/5 flex justify-between">
                <div class="h-3 w-24 bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
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
  thumb?: string
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
const transitionName = ref('slide-left')
const activeIndex = computed(() => {
  const idx = categories.findIndex(c => c.id === activeCategory.value)
  return idx === -1 ? 0 : idx
})

const touchStartX = ref(0)
const touchStartY = ref(0)
const hasTriggeredSwipe = ref(false)

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  hasTriggeredSwipe.value = false
}

const handleTouchMove = (e: TouchEvent) => {
  if (hasTriggeredSwipe.value) return

  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  const deltaX = currentX - touchStartX.value
  const deltaY = currentY - touchStartY.value

  // Horizontal intent check & 50% Threshold Check
  if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
    const viewportWidth = window.innerWidth
    const threshold = viewportWidth * 0.5 // 50% Threshold

    if (Math.abs(deltaX) > threshold) {
      const currentIndex = categories.findIndex(c => c.id === activeCategory.value)
      if (deltaX > 0) {
        // Swipe Right -> Prev
        if (currentIndex > 0) {
          changeCategory(categories[currentIndex - 1].id)
          hasTriggeredSwipe.value = true
        }
      } else {
        // Swipe Left -> Next
        if (currentIndex < categories.length - 1) {
          changeCategory(categories[currentIndex + 1].id)
          hasTriggeredSwipe.value = true
        }
      }
    }
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  // If not already triggered during move (less than 50%), check for terminal swipe intent
  if (!hasTriggeredSwipe.value) {
    const deltaX = e.changedTouches[0].clientX - touchStartX.value
    const deltaY = e.changedTouches[0].clientY - touchStartY.value
    
    // Subtle release trigger (60px) for quick flicks
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      const currentIndex = categories.findIndex(c => c.id === activeCategory.value)
      if (deltaX > 0) {
        if (currentIndex > 0) changeCategory(categories[currentIndex - 1].id)
      } else {
        if (currentIndex < categories.length - 1) changeCategory(categories[currentIndex + 1].id)
      }
    }
  }
  hasTriggeredSwipe.value = false
}

const changeCategory = async (id: string) => {
  const currentIndex = categories.findIndex(c => c.id === activeCategory.value)
  const targetIndex = categories.findIndex(c => c.id === id)
  
  if (targetIndex !== -1 && currentIndex !== -1) {
    transitionName.value = targetIndex > currentIndex ? 'slide-left' : 'slide-right'
  }

  activeCategory.value = id
  
  // Force Nav visible to make the target offset (56px) predictable
  isNavVisible.value = true
  
  await nextTick()

  // Horizontal scroll: Use native scrollIntoView for the most "native-like" smooth centering
  setTimeout(() => {
    const container = scrollContainer.value
    const targetTab = container?.querySelector(`[data-cat="${id}"]`) as HTMLElement
    if (targetTab) {
      targetTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, 100)
  
  if (scrollAnchor.value) {
    const targetScrollY = scrollAnchor.value.offsetTop - 56
    // Instant jump to top to avoid 'upward bounce' during horizontal slide
    window.scrollTo({
      top: targetScrollY,
      behavior: 'auto'
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
  { id: 'design', name: 'Design' },
  { id: 'blog', name: 'Blog' },
  { id: 'youtube', name: 'YouTube' }
]

const RSS_SOURCES = [
  // AI & Tech
  { name: 'AI 타임스', url: 'https://www.aitimes.com/rss/S1N1.xml', category: 'ai' },
  { name: '지디넷코리아', url: 'https://feeds.feedburner.com/zdkorea', category: 'ai' },
  { name: '매경 IT', url: 'https://www.mk.co.kr/rss/50300001/', category: 'ai' },
  { name: '디지털데일리', url: 'https://www.ddaily.co.kr/rss/all.xml', category: 'ai' },
  
  // Finance (Verified High-Priority)
  { name: '한경 경제', url: 'https://www.hankyung.com/feed/economy', category: 'finance' },
  { name: '파이낸셜뉴스', url: 'https://www.fnnews.com/rss/fn_realtime_economy.xml', category: 'finance' },
  { name: '연합 경제', url: 'https://www.yna.co.kr/rss/economy.xml', category: 'finance' },
  { name: '매경 경제', url: 'https://www.mk.co.kr/rss/30100041/', category: 'finance' },
  { name: '뉴스1 경제', url: 'https://www.news1.kr/rss/economy', category: 'finance' },
  { name: '동아 경제', url: 'https://rss.donga.com/economy.xml', category: 'finance' },

  // Design & Art
  { name: '플래텀', url: 'https://platum.kr/feed', category: 'design' },
  { name: 'Creative Bloq', url: 'https://www.creativebloq.com/feed', category: 'design' },
  { name: 'UX Collective', url: 'https://uxdesign.cc/feed', category: 'design' },
  { name: 'Design Milk', url: 'https://design-milk.com/feed/', category: 'design' },

  // Game (Isolated & Robust for v3.2)
  { name: '지디넷 게임', url: 'https://www.zdnet.co.kr/rss/zdnet_game.xml', category: 'game' },
  { name: '뉴스1 게임', url: 'https://www.news1.kr/rss/game', category: 'game' },
  { name: '게임동아', url: 'https://www.gamedonga.co.kr/rss/all.xml', category: 'game' },
  { name: '게임메카', url: 'https://www.gamemeca.com/rss/news.php', category: 'game' },
  { name: '인벤 뉴스', url: 'https://www.inven.co.kr/webzine/news/rss.php', category: 'game' },
  { name: '매경 게임', url: 'https://www.mk.co.kr/rss/50700001/', category: 'game' },

  // Sports (Optimized High-Performance Broadcasting Sources)
  { name: 'SBS 스포츠', url: 'https://news.sbs.co.kr/news/rss.do?section=09', category: 'sports' },
  { name: 'KBS 스포츠', url: 'https://news.kbs.co.kr/rss/news_05.xml', category: 'sports' },
  { name: 'MBC 스포츠', url: 'https://imnews.imbc.com/rss/news/news_04.xml', category: 'sports' },
  { name: '연합 스포츠', url: 'https://www.yna.co.kr/rss/sports.xml', category: 'sports' },
  { name: '매경 스포츠', url: 'https://www.mk.co.kr/rss/71000001/', category: 'sports' },
  { name: '한국일보 스포츠', url: 'https://www.hankookilbo.com/RSS/04', category: 'sports' },

  // Blog (Tech Blogs - Korean Domestic Focused)
  { name: '토스 테크', url: 'https://toss.tech/rss.xml', category: 'blog' },
  { name: '카카오 테크', url: 'https://tech.kakao.com/feed/', category: 'blog' },
  { name: '우아한형제들', url: 'https://techblog.woowahan.com/feed/', category: 'blog' },
  { name: '네이버 D2', url: 'https://d2.naver.com/d2.atom', category: 'blog' },
  { name: '라인 엔지니어링', url: 'https://engineering.linecorp.com/ko/feed/', category: 'blog' },
  { name: '쏘카 테크', url: 'https://tech.socarcorp.kr/feed', category: 'blog' },
  { name: '올리브영 테크', url: 'https://tech.oliveyoung.co.kr/feed/', category: 'blog' },
  { name: '당근 테크', url: 'https://medium.com/daangn/feed', category: 'blog' },

  // YouTube (Hot & Trending Issue Channels)
  { name: 'SBS 뉴스', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCfUuK_1H_7UatYv8Eks5GxA', category: 'youtube' },
  { name: 'MBC 뉴스', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC91n67V2zYtLz37V-26nEaA', category: 'youtube' },
  { name: 'YTN 이슈', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC_g_P6OEx3X0Y9fM_S_1BZw', category: 'youtube' },
  { name: '너덜트', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC-f9W_l7qR5h3YxO_tD31A', category: 'youtube' },
  { name: '숏박스', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC_aUf9lI-oVbJ2Kk2Q0Kj4Q', category: 'youtube' },
  { name: '디스패치', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCk2w-nJm9y-iK_wI5_bL5wQ', category: 'youtube' },
  { name: '워크맨', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC_2uP_K9fO6oY8yWzK_6Sow', category: 'youtube' }
]

const filteredNews = computed(() => {
  if (activeCategory.value === 'all') return news.value
  return news.value.filter(item => item.category === activeCategory.value)
})

const groupedNews = computed(() => {
  const displayed = filteredNews.value.slice(0, visibleCount.value)
  const groups: { date: string, items: NewsItem[] }[] = []
  
  displayed.forEach(item => {
    const pubDate = new Date(item.pubDate)
    if (isNaN(pubDate.getTime())) return
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
  fetchMissingThumbnails()
})


const decodeHtml = (html: string) => {
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

const fetchNews = async () => {
  // 1. Initial Cache Load
  const CURRENT_CACHE_VERSION = 'v8.5'
  const CACHE_KEY = `uxm_trends_cache_${CURRENT_CACHE_VERSION}`
  
  if (news.value.length === 0) {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('uxm_trends_cache_') && key !== CACHE_KEY) {
          localStorage.removeItem(key)
        }
      })
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          news.value = parsed.sort((a: NewsItem, b: NewsItem) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        }
      }
    } catch (e) {
      localStorage.removeItem(CACHE_KEY)
    }
  }
  
  isLoading.value = true

  const fetchSource = async (source: typeof RSS_SOURCES[0]) => {
    // Smart Racing: Standard proxies first, heavyweight fallbacks only if needed
    const primaryProxies = [
      (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`
    ]
    const backupProxies = [
      (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&t=${Date.now()}`,
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    ]

    const fetchWithProxy = async (getProxyUrl: (u: string) => string, timeout = 10000) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      try {
        const response = await fetch(getProxyUrl(source.url), { signal: controller.signal })
        clearTimeout(timeoutId)
        if (!response.ok) throw new Error('Proxy failed')

        let xmlString = ''
        const urlStr = getProxyUrl(source.url)
        if (urlStr.includes('allorigins') && !urlStr.includes('raw')) {
          const data = await response.json()
          xmlString = data.contents || ''
        } else {
          xmlString = await response.text()
        }
        
        if (!xmlString || xmlString.length < 100) throw new Error('Short payload')
        
        const xmlItems = xmlString.split(/<item>|<entry>/i).slice(1)
        const parsedItems: NewsItem[] = []

        xmlItems.forEach((itemRaw, idx) => {
          if (idx >= 30) return 
          const titleMatch = itemRaw.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)
          const linkMatch = itemRaw.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) ||
                            itemRaw.match(/<link[^>]+href=["']([^"']+)["']/i)
          if (!titleMatch || !linkMatch) return

          const title = decodeHtml(titleMatch[1].trim())
          let link = linkMatch[1].trim()
          
          if (link.includes('news.google.com/articles/')) {
            try {
              let b64 = link.split('articles/')[1]?.split('?')[0]
              if (b64) {
                b64 = b64.replace(/-/g, '+').replace(/_/g, '/')
                while (b64.length % 4 !== 0) b64 += '='
                const decoded = atob(b64)
                const urlMatch = decoded.match(/https?:\/\/[^\s\u0000-\u001F"<>\\^`{|}]+/g)
                if (urlMatch && urlMatch.length > 0) link = urlMatch[0]
              }
            } catch (e) {}
          }

          const descMatch = itemRaw.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) ||
                            itemRaw.match(/<summary>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i) ||
                            itemRaw.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i)
          const dateMatch = itemRaw.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i) ||
                            itemRaw.match(/<published>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/published>/i) ||
                            itemRaw.match(/<updated>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/updated>/i)
          
          const description = descMatch ? descMatch[1].trim() : ''
          const pubDate = dateMatch ? dateMatch[1].trim() : ''
          
          // YouTube Specific: Use yt:videoId for reliable thumbnails
          const ytIdMatch = itemRaw.match(/<yt:videoId>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/yt:videoId>/i)
          let thumb = ''
          
          if (ytIdMatch) {
            thumb = `https://i.ytimg.com/vi/${ytIdMatch[1].trim()}/mqdefault.jpg`
          } else {
            const imgMatch = description.match(/<img[^>]+src=["']([^"'>]+)["']/i) || description.match(/<img[^>]+src=([^ >]+)/i)
            if (imgMatch) thumb = imgMatch[1].replace(/['"]/g, '').trim()
            
            if (!thumb) {
              const mediaMatch = itemRaw.match(/<(?:media:content|enclosure|thumbnail|image|media:thumbnail|img)[^>]+(?:url|href|src)=["']([^"'>]+)["']/i)
              if (mediaMatch) thumb = mediaMatch[1]
            }
          }

          const parts = title.split(/ - | \| | : /)
          const newItem = {
            title: parts[0].trim(), link, pubDate,
            description: decodeHtml(description.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()) || (source.category === 'youtube' ? '유튜브에서 관련 영상을 시청하세요.' : '기사 본문을 확인하세요.'),
            source: source.name, category: source.category, provider: parts.length > 1 ? parts[parts.length - 1].trim() : '',
            thumb: thumb.startsWith('//') ? 'https:' + thumb : thumb
          }
          parsedItems.push(newItem)
          if (idx === 0) updateNewsList([newItem])
        })

        if (parsedItems.length > 0) {
          updateNewsList(parsedItems)
          return parsedItems
        }
        throw new Error('No items')
      } catch (err) {
        clearTimeout(timeoutId)
        throw err
      }
    }

    let retryCount = 0
    const maxRetries = 2 // Total 3 attempts

    const attemptFetch = async (): Promise<NewsItem[]> => {
      try {
        // Step 1: Racing the fastest primary proxies
        return await Promise.any(primaryProxies.map(p => fetchWithProxy(p, 8000)))
      } catch {
        try {
          // Step 2: Fallback to heavier proxies if primary fails
          return await Promise.any(backupProxies.map(p => fetchWithProxy(p, 12000)))
        } catch (e) {
          if (retryCount < maxRetries) {
            retryCount++
            // Small delay before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
            return attemptFetch()
          }
          return []
        }
      }
    }

    return attemptFetch()
  }

  const updateNewsList = (newItems: NewsItem[]) => {
    const combined = [...newItems, ...news.value]
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

  try {
    // 1. Fire priority sources immediately without awaiting ALL of them (Incremental UI)
    const prioritySources = activeCategory.value === 'all' 
      ? RSS_SOURCES 
      : RSS_SOURCES.filter(s => s.category === activeCategory.value)
    
    const otherSources = RSS_SOURCES.filter(s => !prioritySources.includes(s))
    
    // Each source updates the list independently as it finishes
    let completedCount = 0
    prioritySources.forEach(source => {
      fetchSource(source).finally(() => {
        completedCount++
        // End loading if we have data OR if all priority sources have at least attempted
        if (news.value.length > 0 || completedCount === prioritySources.length) {
          isLoading.value = false
        }
      })
    })
    
    // 2. Fire background sources: No-wait background update
    otherSources.forEach(source => fetchSource(source))
    
    // final safety: ensure loading ends eventually (even for slow YouTube feeds)
    setTimeout(() => { 
      if (isLoading.value) isLoading.value = false 
    }, 12000)

    fetchMissingThumbnails()
  } catch (err) {
    console.error('Fetch news error:', err)
  } finally {
    // Only set loading false if we HAVE data (either from cache or priority fetch)
    if (news.value.length > 0) {
      isLoading.value = false
    }
  }
}

const fetchMissingThumbnails = async () => {
  // 1. Prioritize current category items that lack thumbnails
  const currentItems = activeCategory.value === 'all' 
    ? news.value 
    : news.value.filter(n => n.category === activeCategory.value)
    
  let pending = currentItems.filter(n => !n.thumb).slice(0, 30)
  
  // 2. If space remains, fill with other categories' items
  if (pending.length < 30) {
    const others = news.value.filter(n => !n.thumb && n.category !== activeCategory.value).slice(0, 30 - pending.length)
    pending = [...pending, ...others]
  }

  if (pending.length === 0) return

  pending.forEach(async (item) => {
    try {
      const targetUrl = item.link
      const providers = [
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&t=${Date.now()}`
      ]

      let html = ''
      for (const pUrl of providers) {
        try {
          const res = await fetch(pUrl)
          if (!res.ok) continue
          if (pUrl.includes('allorigins')) {
            const data = await res.json()
            html = data.contents || ''
          } else {
            html = await res.text()
          }
          if (html && html.length > 500) break
        } catch (e) {}
      }

      if (!html) return

      // Super Robust Extraction Logic
      const imgMatch = 
          html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"'>]+)["']/i) ||
          html.match(/<meta[^>]+content=["']([^"'>]+)["'][^>]+property=["']og:image["']/i) ||
          html.match(/<meta[^>]+name=["']og:image["'][^>]+content=["']([^"'>]+)["']/i) ||
          html.match(/<meta[^>]+content=["']([^"'>]+)["'][^>]+name=["']og:image["']/i) ||
          html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"'>]+)["']/i) ||
          html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"'>]+)["']/i) ||
          html.match(/<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"'>]+)["']/i) ||
          html.match(/<img[^>]+id=["']main-image["'][^>]+src=["']([^"'>]+)["']/i)
      
      if (imgMatch && imgMatch[1]) {
        let imgUrl = imgMatch[1]
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl
        if (imgUrl.match(/\.ico$|favicon|google_logo|tracking|pixel|transparent/i)) return
        
        const idx = news.value.findIndex(n => n.link === targetUrl)
        if (idx !== -1) {
          news.value[idx] = { ...news.value[idx], thumb: imgUrl }
          localStorage.setItem(`uxm_trends_cache_v8.5`, JSON.stringify(news.value))
        }
      }
    } catch (e) {}
  })
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

@keyframes wave {
  0%, 100% { transform: translateY(0); opacity: 0.3; }
  50% { transform: translateY(-10px); opacity: 1; }
}
.animate-wave {
  animation: wave 1.2s ease-in-out infinite;
}

/* Cinematic Slide-Fade Transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
}

/* Moving Forward (Next Tab) */
.slide-left-enter-from { opacity: 0; transform: translateX(20px); }
.slide-left-leave-to { opacity: 0; transform: translateX(-20px); }

/* Moving Backward (Prev Tab) */
.slide-right-enter-from { opacity: 0; transform: translateX(-20px); }
.slide-right-leave-to { opacity: 0; transform: translateX(20px); }

.transition-wrapper {
  will-change: opacity, transform;
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
.theme-blog { --brand-color: #f59e0b; --brand-bg: rgba(245, 158, 11, 0.05); }
.theme-youtube { --brand-color: #ef4444; --brand-bg: rgba(239, 68, 68, 0.05); }

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

.category-tab[data-cat="blog"][data-active="true"] { color: #f59e0b !important; }
.category-tab[data-cat="blog"][data-active="true"] .active-underline { background-color: #f59e0b; }

.category-tab[data-cat="youtube"][data-active="true"] { color: #ef4444 !important; }
.category-tab[data-cat="youtube"][data-active="true"] .active-underline { background-color: #ef4444; }

/* Refined News Card Styling */
.news-card.theme-ai { --brand-color: #6366f1; --brand-bg: rgba(99, 102, 241, 0.05); }
.news-card.theme-finance { --brand-color: #0acaaa; --brand-bg: rgba(10, 202, 170, 0.05); }
.news-card.theme-design { --brand-color: #fa4fc1; --brand-bg: rgba(250, 79, 193, 0.05); }
.news-card.theme-sports { --brand-color: #5196fd; --brand-bg: rgba(81, 150, 253, 0.05); }
.news-card.theme-game { --brand-color: #9333ea; --brand-bg: rgba(147, 51, 234, 0.05); }
.news-card.theme-blog { --brand-color: #f59e0b; --brand-bg: rgba(245, 158, 11, 0.05); }
.news-card.theme-youtube { --brand-color: #ef4444; --brand-bg: rgba(239, 68, 68, 0.05); }

/* Hover Effects: Enabled only for devices that support hover (Mouse) to prevent sticky feel on mobile */
@media (hover: hover) {
  .news-card:hover {
    transform: translateY(-4px);
  }
  
  .news-card.theme-ai:hover { border-color: #6366f180; }
  .news-card.theme-finance:hover { border-color: #0acaaa80; }
  .news-card.theme-design:hover { border-color: #fa4fc180; }
  .news-card.theme-sports:hover { border-color: #5196fd80; }
  .news-card.theme-game:hover { border-color: #9333ea80; }
  .news-card.theme-blog:hover { border-color: #f59e0b80; }
  .news-card.theme-youtube:hover { border-color: #ef444480; }

  .news-card:hover .title-element {
    opacity: 0.8;
  }

  button:hover {
    scale: 1.02;
  }
}

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
.news-card.theme-blog .source-badge { border-color: #f59e0b30; }
.news-card.theme-youtube .source-badge { border-color: #ef444430; }

.more-link {
  color: var(--brand-color);
}


</style>
