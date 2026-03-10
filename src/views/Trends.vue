<template>
  <div 
    class="min-h-screen bg-zinc-50 dark:bg-[#131313] text-zinc-900 dark:text-white relative transition-colors duration-200"
  >
    <SiteNavbar />
    
    <div class="pt-[60px]">
      <SiteBanner />
    </div>

    <SiteHeader 
      title="NEWS STAND" 
      description="All major news feeds, real-time and in one place"
      padding-top="pt-16"
      :enable-gradient="true"
      :show-date-time-weather="true"
    />

    <!-- Stable Anchor for Scroll Positioning -->
    <div ref="scrollAnchor" class="h-px"></div>

    <!-- Category Tabs: Sticky Logic -->
    <div 
      ref="tabsRef"
      class="sticky z-40 bg-zinc-50/90 dark:bg-[#131313]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 mb-12 transition-all duration-200"
      :style="{ top: `max(0px, 56px + var(--nav-y, 0px))` }"
    >
      <div class="px-6 md:px-10 max-w-[1800px] mx-auto pt-2 pb-0">
        <div class="relative group/tabs">
          <div 
            class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-50 dark:from-[#131313] to-transparent pointer-events-none z-10 transition-opacity"
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
            class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-50 dark:from-[#131313] to-transparent pointer-events-none z-10 transition-opacity"
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
          <!-- Show content when data is available -->
          <div v-if="groupedNews.length > 0" class="space-y-10">
            <div v-for="group in groupedNews" :key="group.date" class="space-y-6">
              <h2 class="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase whitespace-nowrap mb-6">📅 {{ group.date }}</h2>
              
              <TransitionGroup 
                name="list" 
                tag="div"
                :class="activeCategory === 'googleart' ? 'columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'"
              >
                <a v-for="(item, index) in group.items"
                   :key="item.link + index"
                   :href="item.link"
                   target="_blank"
                   class="news-card group transition-all duration-300"
                   :class="[
                     `theme-${item.category}`,
                     activeCategory === 'googleart' 
                       ? 'block w-full break-inside-avoid mb-3 mt-0 bg-white dark:bg-[#1f1f1f] border border-zinc-200 dark:border-white/5 rounded-2xl overflow-hidden p-0 transform-gpu' 
                       : 'flex flex-col bg-white dark:bg-[#1f1f1f] border border-zinc-200 dark:border-white/5 rounded-2xl p-5'
                   ]"
                >
                  <!-- Regular Header (Not for Arts Pinterest) -->
                  <div v-if="activeCategory !== 'googleart'" class="flex justify-between items-center mb-4 gap-2 px-0">
                    <span class="source-badge px-2.5 py-1 rounded-md text-[12px] font-black uppercase tracking-normal border flex-shrink-0">
                      {{ getCategoryName(item.category) }}
                    </span>
                    <span class="text-[11px] text-zinc-400 font-bold uppercase tracking-tight truncate text-right flex-grow min-w-0">{{ item.provider || item.source }}</span>
                  </div>
                  
                    <!-- Main Content Block -->
                    <div class="w-full relative">
                      <!-- Arts Pinterest View -->
                      <div v-if="activeCategory === 'googleart'">
                        <div class="relative w-full overflow-hidden bg-zinc-50 dark:bg-zinc-800/20">
                          <!-- Skeleton Shimmer -->
                          <div 
                            v-if="!item.thumbLoaded && !item.thumbError" 
                            class="absolute inset-0 z-10 animate-pulse bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800"
                            style="min-height: 200px;"
                          ></div>
                          
                          <!-- Error State Component -->
                          <div 
                            v-if="item.thumbError" 
                            class="flex flex-col items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 py-12"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span class="text-[9px] text-zinc-400 font-medium tracking-tight">이미지 로드 실패</span>
                          </div>

                          <img 
                            v-if="item.thumb && !item.thumbError"
                            :src="item.category === 'googleart' && !item.thumb.includes('artic.edu') ? `https://images.weserv.nl/?url=${encodeURIComponent(item.thumb)}&w=500` : item.thumb" 
                            class="w-full h-auto block transition-all duration-700 ease-out group-hover:scale-[1.01]" 
                            :class="item.thumbLoaded ? 'opacity-100' : 'opacity-0'"
                            loading="lazy" 
                            referrerpolicy="no-referrer"
                            @load="item.thumbLoaded = true"
                            @error="handleImgError(item)"
                          />
                        </div>
                        <div class="p-4 border-t border-zinc-100 dark:border-white/5 bg-white dark:bg-[#1f1f1f]">
                          <h3 class="text-sm font-bold text-zinc-900 dark:text-white leading-tight line-clamp-2">
                            {{ item.title }}
                          </h3>
                          <div class="mt-2 flex items-center justify-between gap-2">
                            <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate min-w-0 flex-grow">{{ item.source }}</span>
                            <span class="text-[10px] text-zinc-400 flex-shrink-0 text-right">{{ formatDate(item.pubDate) }}</span>
                          </div>
                        </div>
                      </div>

                    <!-- Regular View -->
                    <div v-else class="flex gap-4 mb-4 items-center h-12">
                      <div 
                        v-if="item.thumb && !item.thumbError" 
                        class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-800 transition-opacity duration-300"
                      >
                        <img 
                          :src="item.thumb" 
                          class="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" 
                          loading="lazy" 
                          referrerpolicy="no-referrer"
                          @error="handleImgError(item)"
                        />
                      </div>
                      <h3 class="text-lg font-bold text-zinc-900 dark:text-white leading-tight line-clamp-2 title-element flex-grow">
                        {{ item.title }}
                      </h3>
                    </div>
                  </div>

                  <!-- Regular Footer (Not for Arts Pinterest) -->
                  <div v-if="activeCategory !== 'googleart'" class="pt-4 mt-auto border-t border-zinc-100 dark:border-white/5 flex justify-between items-center">
                    <span class="text-[11px] text-zinc-400 font-medium">{{ formatDate(item.pubDate) }}</span>
                    <span class="more-link text-[11px] font-bold flex items-center gap-0.5">
                      <span class="translate-y-[0.5px]">더 보기</span>
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
                class="px-12 py-4 bg-zinc-900 hover:bg-zinc-700 text-white dark:bg-white hover:dark:bg-zinc-300 dark:text-black rounded-lg font-semibold text-base leading-normal tracking-tight active:scale-[0.98] transition-all duration-300 border border-transparent"
              >
                헤드라인 더보기
              </button>
            </div>
          </div>

          <!-- Skeletons: Show when no data is available -->
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
            </div>
          </div>
        </div>
      </Transition>
    </main>

    <!-- Loading Toast Notification -->
    <Transition name="toast">
      <div 
        v-if="isBackgroundLoading" 
        class="fixed bottom-8 right-8 z-50 bg-white/70 dark:bg-black/50 backdrop-blur-3xl border-0 rounded-full pl-5 pr-4 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-row-reverse items-center gap-3 transition-all duration-300"
      >
        <!-- Spinner on the right for natural RTL expansion -->
        <svg class="animate-spin h-3.5 w-3.5 text-zinc-900 dark:text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>

        <div class="relative h-5 overflow-hidden flex items-center">
          <Transition name="slide-up-fade" mode="out-in">
            <div :key="currentLoadingCategoryName" class="flex items-center gap-1.5 font-medium tracking-tight">
              <span class="text-[12px] text-zinc-900 dark:text-white whitespace-nowrap">
                {{ currentLoadingCategoryName || 'News' }}
              </span>
              <span class="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold tabular-nums">
                {{ processedTaskSources }}/{{ totalTaskSources }}
              </span>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import SiteNavbar from '../components/SiteNavbar.vue'
import SiteFooter from '../components/SiteFooter.vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteBanner from '../components/SiteBanner.vue'

const CURRENT_CACHE_VERSION = '44.1'
const CACHE_KEY = `uxm_trends_cache_${CURRENT_CACHE_VERSION}`

interface NewsItem {
  title: string
  link: string
  pubDate: string
  description: string
  source: string
  category: string
  provider: string
  thumb?: string
  thumbError?: boolean
  thumbLoaded?: boolean
}

const isLoading = ref(true)
const isBackgroundLoading = ref(false)
const totalTaskSources = ref(0)
const processedTaskSources = ref(0)
const activeCategory = ref('all')
const news = ref<NewsItem[]>([])
const visibleCount = ref(50)
const currentLoadingCategoryName = ref('')
const currentFetchSession = ref(0)

// Persistent Session Progress
const sessionProcessedSources = ref(new Set<string>())
const lastGlobalSyncTime = ref(0)

const handleImgError = (item: NewsItem) => {
  item.thumbError = true
}

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
  fetchNews()
  
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
  { id: 'ai', name: 'AI Next' },
  { id: 'it', name: 'IT Device' },
  { id: 'finance', name: 'Finance' },
  { id: 'insurance', name: 'Insurance' },
  { id: 'game', name: 'Game' },
  { id: 'sports', name: 'Sports' },
  { id: 'entertain', name: 'Entertain' },
  { id: 'design', name: 'Design' },
  { id: 'figma', name: 'Figma' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'diablo2', name: 'Diablo2' },
  { id: 'googleart', name: 'Arts' }
]

const RSS_SOURCES = [
  // AI Next (Algorithms, Models, Intelligence Evolution)
  { name: 'AI 타임스', url: 'https://www.aitimes.com/rss/S1N1.xml', category: 'ai' },
  { name: 'Google AI Next (KR)', url: 'https://news.google.com/rss/search?q=LLM+딥러닝+생성형AI+인공지능&hl=ko&gl=KR&ceid=KR:ko', category: 'ai' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', category: 'ai', translate: true },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'ai', translate: true },
  { name: 'MIT Tech Review AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', category: 'ai', translate: true },

  // IT Device (Products, Hardware, Market, BigTech Business)
  { name: '전자신문 (Devices)', url: 'https://www.etnews.com/rss/etnews_realtime_news.xml', category: 'it' },
  { name: '지디넷코리아 (Product)', url: 'https://feeds.feedburner.com/zdkorea', category: 'it' },
  { name: '디지털데일리 (Hardware)', url: 'https://www.ddaily.co.kr/rss/all.xml', category: 'it' },
  { name: '매경 IT (Service)', url: 'https://www.mk.co.kr/rss/50300001/', category: 'it' },
  { name: '블로터 (BigTech)', url: 'https://www.bloter.net/rss/all.xml', category: 'it' },
  { name: '보안뉴스 (Security)', url: 'https://www.boannews.com/media/t_rss.xml', category: 'it' },
  { name: '아이티데일리 (Enterprise)', url: 'http://www.itdaily.kr/rss/all.xml', category: 'it' },
  { name: '바이라인네트워크', url: 'https://byline.network/feed/', category: 'it' },
  
  // Finance (Verified High-Priority)
  { name: '한경 경제', url: 'https://www.hankyung.com/feed/economy', category: 'finance' },
  { name: '파이낸셜뉴스', url: 'https://www.fnnews.com/rss/fn_realtime_economy.xml', category: 'finance' },
  { name: '연합 경제', url: 'https://www.yna.co.kr/rss/economy.xml', category: 'finance' },
  { name: '매경 경제', url: 'https://www.mk.co.kr/rss/30100041/', category: 'finance' },
  { name: '뉴스1 경제', url: 'https://www.news1.kr/rss/economy', category: 'finance' },
  { name: '동아 경제', url: 'https://rss.donga.com/economy.xml', category: 'finance' },

  // Design & Art
  { name: '디자인정글', url: 'https://www.jungle.co.kr/rss/news', category: 'design' },
  { name: '플래텀', url: 'https://platum.kr/feed', category: 'design' },
  { name: 'Creative Bloq', url: 'https://www.creativebloq.com/feed', category: 'design', translate: true },
  { name: 'UX Collective', url: 'https://uxdesign.cc/feed', category: 'design', translate: true },
  { name: 'Design Milk', url: 'https://design-milk.com/feed/', category: 'design', translate: true },

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

  // Entertain (Domestic & International)
  { name: 'Google 연예 (KR)', url: 'https://news.google.com/rss/search?q=%EC%97%B0%EC%98%88+%EC%97%94%ED%84%B0%ED%85%8C%EC%9D%B8%EB%A8%BC%ED%8A%B8+%EC%95%84%EC%9D%B4%EB%8F%8C&hl=ko&gl=KR&ceid=KR:ko', category: 'entertain' },
  { name: '연합뉴스 연예', url: 'https://www.yna.co.kr/rss/entertainment.xml', category: 'entertain' },
  { name: 'MBC 연예', url: 'https://imnews.imbc.com/rss/news/news_05.xml', category: 'entertain' },
  { name: 'KBS 연예', url: 'https://news.kbs.co.kr/rss/news_06.xml', category: 'entertain' },
  { name: 'SBS 연예', url: 'https://news.sbs.co.kr/news/rss.do?section=14', category: 'entertain' },
  { name: '한국일보 연예', url: 'https://www.hankookilbo.com/RSS/05', category: 'entertain' },
  { name: 'TMZ News', url: 'https://www.tmz.com/rss.xml', category: 'entertain', translate: true },
  { name: 'Variety', url: 'https://variety.com/feed/', category: 'entertain', translate: true },
  { name: 'Deadline', url: 'https://deadline.com/feed/', category: 'entertain', translate: true },
  { name: 'Hollywood Reporter', url: 'https://www.hollywoodreporter.com/feed/', category: 'entertain', translate: true },

  // Figma (Official Blog, Global News, Community, Config)
  { name: 'Figma Blog', url: 'https://www.figma.com/blog/feed/', category: 'figma', translate: true },
  { name: 'Figma News (Global)', url: 'https://news.google.com/rss/search?q=figma+design+tool+software&hl=en&gl=US&ceid=US:en', category: 'figma', translate: true },
  { name: '피그마 새소식 (KR)', url: 'https://news.google.com/rss/search?q=피그마+Figma+디자인+업데이트&hl=ko&gl=KR&ceid=KR:ko', category: 'figma' },
  { name: 'Figma Community', url: 'https://news.google.com/rss/search?q=figma+community+plugins+widget&hl=en&gl=US&ceid=US:en', category: 'figma', translate: true },
  { name: 'Config News', url: 'https://news.google.com/rss/search?q=figma+config+conference+news&hl=en&gl=US&ceid=US:en', category: 'figma', translate: true },
  { name: 'Figma Plugins (Hot)', url: 'https://news.google.com/rss/search?q=best+figma+plugins+2024+2025&hl=en&gl=US&ceid=US:en', category: 'figma', translate: true },
  { name: 'Figma Variables & Prototyping', url: 'https://news.google.com/rss/search?q=figma+variables+advanced+prototyping&hl=en&gl=US&ceid=US:en', category: 'figma', translate: true },
  { name: 'UI/UX Design Trends', url: 'https://news.google.com/rss/search?q=modern+ui+ux+design+trends+figma&hl=en&gl=US&ceid=US:en', category: 'figma', translate: true },
  { name: 'Design Systems (Figma)', url: 'https://news.google.com/rss/search?q=figma+design+systems+workflow&hl=en&gl=US&ceid=US:en', category: 'figma', translate: true },
  { name: 'Figma for Developers', url: 'https://news.google.com/rss/search?q=figma+dev+mode+handoff&hl=en&gl=US&ceid=US:en', category: 'figma', translate: true },
  { name: 'Figma (NEW)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQsVmhSa4X-G3lHlUtejzLA', category: 'figma' },

  // YouTube (Curated Korean Hot Issues - Strictly User Specified)
  { name: '침착맨 (Channel)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCUj6rrhMTR9pipbAWBAMvUQ', category: 'youtube' },
  { name: '돌비공포라디오 (NEW)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC9aUIOFL_OeARVA6MtBTZAQ', category: 'youtube' },
  { name: '코딩애플 (NEW)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSLrpBAzr-ROVGHQ5EmxnUg', category: 'youtube' },
  { name: 'YouTube Creators (NEW)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCUZHFZ9jIKrLroW8LcyJEQQ', category: 'youtube' },
  { name: 'OpenAI (NEW)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXZCJLdBC09xxGZ6gcdrc6A', category: 'youtube' },
  { name: '잇섭 ITSub (Hot)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCdUcjkyZtf-1WJyPPiETF1g', category: 'youtube' },


  // Insurance (Renamed from GoodRich - Specialized Professional Sources)
  { name: '보험신보', url: 'http://www.insweek.co.kr/rss/all.xml', category: 'insurance' },
  { name: '한국금융 보험', url: 'https://www.fntimes.com/rss/S1N6.xml', category: 'insurance' },
  { name: '대항뉴스 보험', url: 'https://www.dhns.co.kr/rss/S1N12.xml', category: 'insurance' },
  { name: '조선비즈 보험', url: 'https://biz.chosun.com/rss/insurance/', category: 'insurance' },
  { name: '국민일보 보험', url: 'https://rss.kmib.co.kr/index.xml', category: 'insurance' },
  { name: '굿리치 공식 블로그', url: 'https://rss.blog.naver.com/goodrich_official.xml', category: 'insurance' },

  // Diablo2 (Google Bypass & Direct Bridge: Community Posts)
  // Using broad Google Search RSS bypass for strictly blocked sites (Inven, DC Inside, ChaosCube).
  { name: '루리웹 디아2 (커뮤니티)', url: 'https://bbs.ruliweb.com/game/85642/rss', category: 'diablo2' },
  { name: '인벤 디아2 (커뮤니티)', url: 'https://news.google.com/rss/search?q=디아블로2+인벤&hl=ko&gl=KR&ceid=KR:ko', category: 'diablo2' },
  { name: '디시 디아2 (갤러리)', url: 'https://news.google.com/rss/search?q=디아블로2+디시인사이드&hl=ko&gl=KR&ceid=KR:ko', category: 'diablo2' },
  { name: '카오스큐브 (커뮤니티)', url: 'https://news.google.com/rss/search?q=디아블로2+카오스큐브&hl=ko&gl=KR&ceid=KR:ko', category: 'diablo2' },
  
  // Google Art (Pinterest Style Masonry)
  { name: 'Cleveland Museum of Art', url: 'https://openaccess-api.clevelandart.org/api/artworks', category: 'googleart' },
  { name: 'The Met Museum', url: 'https://collectionapi.metmuseum.org/public/collection/v1/objects', category: 'googleart' },
  { name: 'This Is Colossal', url: 'https://www.thisiscolossal.com/feed/', category: 'googleart', translate: true },
  { name: 'Juxtapoz Art', url: 'https://www.juxtapoz.com/feed/', category: 'googleart', translate: true },
  { name: 'Hi-Fructose', url: 'https://hifructose.com/feed/', category: 'googleart', translate: true },
  { name: 'My Modern Met', url: 'https://mymodernmet.com/feed/', category: 'googleart', translate: true },
  { name: 'Dezeen', url: 'https://www.dezeen.com/feed/', category: 'googleart', translate: true },
  { name: 'Designboom', url: 'https://www.designboom.com/feed/', category: 'googleart', translate: true },
  { name: 'Artnet News', url: 'https://news.artnet.com/feed/', category: 'googleart', translate: true },
  { name: 'Artforum', url: 'https://www.artforum.com/rss/news', category: 'googleart', translate: true },
  { name: 'The Art Newspaper', url: 'https://www.theartnewspaper.com/rss', category: 'googleart', translate: true },
  { name: 'Bored Panda Art', url: 'https://www.boredpanda.com/art/feed/', category: 'googleart', translate: true },
  { name: 'Hyperallergic', url: 'https://hyperallergic.com/feed/', category: 'googleart', translate: true },
  { name: 'Apollo Magazine', url: 'https://www.apollo-magazine.com/feed/', category: 'googleart', translate: true },
  { name: 'Aesthetica', url: 'https://aestheticamagazine.com/feed/', category: 'googleart', translate: true },
  { name: 'Wallpaper* Art', url: 'https://www.wallpaper.com/rss/art', category: 'googleart', translate: true },
  { name: 'Creative Review', url: 'https://www.creativereview.co.uk/feed/', category: 'googleart', translate: true },
  { name: 'ArtNews', url: 'https://www.artnews.com/feed/', category: 'googleart', translate: true },
  { name: 'NGA Highlights', url: 'https://www.nga.gov/collection/collection-feeds/collection-highlights-feed.xml', category: 'googleart', translate: true },
  { name: 'DailyArt Magazine', url: 'https://www.dailyartmagazine.com/feed/', category: 'googleart', translate: true },
  { name: 'Booooooom', url: 'https://www.booooooom.com/feed/', category: 'googleart', translate: true },
  { name: 'It\'s Nice That', url: 'https://www.itsnicethat.com/rss', category: 'googleart', translate: true },
]

const filteredNews = computed(() => {
  let list = news.value
  if (activeCategory.value !== 'all') {
    list = list.filter(item => item.category === activeCategory.value)
  } else {
    // Exclude Arts category from 'All News' to avoid overcrowding
    list = list.filter(item => item.category !== 'googleart')
  }
    // Filter items with local thumb property (to avoid showing empty text cards initially)
    // IMPORTANT: DO NOT filter by thumbError here, as it causes reactive flickering 
    // when an image fails and the item is suddenly removed from the masonry.
    return list.filter(item => {
      if (item.category === 'googleart') {
        return !!item.thumb
      }
      return true
    })
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

watch(activeCategory, (newCat) => {
  visibleCount.value = 50
  fetchMissingThumbnails()
  
  // If the selected category is empty, trigger a prioritized fetch immediately
  const hasItems = news.value.some(item => item.category === newCat)
  if (!hasItems && newCat !== 'all') {
    fetchNews()
  }
})


const decodeHtml = (html: string) => {
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

const translateText = async (text: string) => {
  if (!text || !/[a-zA-Z]/.test(text)) return text;
  // Use a proxy to avoid CORS and to stay safe
  const targetUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
    if (!response.ok) return text;
    const data = await response.json();
    // Google Translate returns an array of arrays for the translation segments
    return data[0].map((item: any) => item[0]).join('').trim();
  } catch (e) {
    return text;
  }
}

const fetchNews = async () => {
  // 1. Initial Cache Load
  
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
          // Purge items from categories that no longer exist
          const validCategoryIds = new Set(['all', ...categories.map(c => c.id)])
          const filtered = parsed.filter((item: any) => validCategoryIds.has(item.category))
          news.value = filtered.sort((a: NewsItem, b: NewsItem) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        }
      }
    } catch (e) {
      localStorage.removeItem(CACHE_KEY)
    }
  }
  
  isLoading.value = true
  const sessionId = ++currentFetchSession.value

  const fetchSource = async (source: typeof RSS_SOURCES[0]) => {
    if (sessionId !== currentFetchSession.value) return [] // Abort if session changed
    // ... existing fetchSource logic ...
    // Note: fetchSource structure remains the same but needs to check sessionId inside if possible
    // For simplicity, we check sessionId at the loop level below which is more critical.
    // Special handling for Museum APIs
    if (source.category === 'googleart') {
      // 1. Cleveland Museum of Art (CMA)
      if (source.url.includes('clevelandart.org')) {
        try {
          const designKeywords = ['graphic design', 'poster', 'typography', 'modern art', 'drawing', 'architecture drawing', 'printmaking', 'photography'];
          const res = await fetch(`https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&limit=40&q=${designKeywords[Math.floor(Math.random() * designKeywords.length)]}`);
          const data = await res.json();
          if (!data.data) return [];

          const excludeSync = /ceramic|pottery|porcelain|sculpture|statue|vessel|bowl|jar|mask|figurine|marble|bronze|woodwork|craft|furniture/i;

          const artItems: NewsItem[] = (await Promise.all(data.data.map(async (item: any) => {
            // Filter out 3D objects/crafts
            if (excludeSync.test(item.type) || excludeSync.test(item.title) || excludeSync.test(item.technique)) return null;

            const [tTitle, tDesc] = await Promise.all([
              translateText(item.title),
              item.creators?.[0]?.description ? translateText(item.creators[0].description) : Promise.resolve('클리블랜드 미술관 컬렉션')
            ]);
            return {
              title: tTitle,
              link: item.url || `https://www.clevelandart.org/art/${item.accession_number}`,
              pubDate: new Date().toISOString(),
              description: tDesc,
              source: 'CMA',
              category: 'googleart',
              provider: 'Cleveland Museum of Art',
              thumb: item.images?.web?.url || item.images?.print?.url
            };
          }))).filter(Boolean) as NewsItem[];
          updateNewsList(artItems);
          return artItems;
        } catch (e) { return []; }
      }

      // 3. The Metropolitan Museum of Art (The Met)
      if (source.url.includes('metmuseum.org')) {
        try {
          const designKeywords = ['graphic', 'poster', 'typography', 'modern', 'sketch', 'illustration', 'advertising'];
          const keyword = designKeywords[Math.floor(Math.random() * designKeywords.length)];
          // Using classification to narrow down to 2D art types
          const searchRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&classification=Drawings%20and%20Prints|Paintings|Photographs&q=${keyword}`);
          const searchData = await searchRes.json();
          if (!searchData.objectIDs) return [];

          const randomIds = searchData.objectIDs
            .sort(() => 0.5 - Math.random())
            .slice(0, 20);

          const excludeSync = /ceramic|pottery|porcelain|sculpture|statue|vessel|bowl|jar|mask|figurine|marble|bronze|furniture|terracotta/i;

          const artItems: NewsItem[] = (await Promise.all(randomIds.map(async (id: number) => {
            try {
              const objRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
              const objData = await objRes.json();
              if (!objData.primaryImageSmall) return null;
              
              // Post-fetch filtering for excluded types
              if (excludeSync.test(objData.objectName) || excludeSync.test(objData.title) || excludeSync.test(objData.medium)) return null;

              const [tTitle, tDesc] = await Promise.all([
                translateText(objData.title),
                objData.artistDisplayName ? translateText(objData.artistDisplayName) : Promise.resolve('메트로폴리탄 미술관 컬렉션')
              ]);

              return {
                title: tTitle,
                link: objData.objectURL,
                pubDate: new Date().toISOString(),
                description: tDesc,
                source: 'Met',
                category: 'googleart',
                provider: 'The Metropolitan Museum of Art',
                thumb: objData.primaryImageSmall
              };
            } catch (e) { return null; }
          }))).filter(Boolean) as NewsItem[];

          updateNewsList(artItems);
          return artItems;
        } catch (e) { return []; }
      }
    }

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
        
        const xmlItems = xmlString.split(/<(?:item|entry)[^>]*>/i).slice(1).slice(0, 30)
        const parsedItems: NewsItem[] = []

        // Pre-process all items to extract raw data first
        const rawParsed: any[] = []
        for (const itemRaw of xmlItems) {
          const titleMatch = itemRaw.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)
          const linkMatch = itemRaw.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) ||
                            itemRaw.match(/<link[^>]+href=["']([^"']+)["']/i)
          if (!titleMatch || !linkMatch) continue

          let title = decodeHtml(titleMatch[1].trim())
          let link = linkMatch[1].trim()
          let ytId = ''
          
          if (link.includes('news.google.com/')) {
            try {
              let b64 = link.split('articles/')[1]?.split('?')[0] || link.split('rss/articles/')[1]?.split('?')[0]
              if (b64) {
                b64 = b64.replace(/-/g, '+').replace(/_/g, '/')
                while (b64.length % 4 !== 0) b64 += '='
                const decoded = atob(b64)
                
                const idRegex = /(?:v=|v\/|embed\/|youtu\.be\/|watch\?v%3D|watch\?v=)([A-Za-z0-9_-]{11})/i
                const ytMatch = decoded.match(idRegex)
                
                if (ytMatch) {
                  ytId = ytMatch[1]
                  link = `https://www.youtube.com/watch?v=${ytId}`
                } else {
                  const urlMatch = decoded.match(/https?:\/\/[^\s\u0000-\u001F"<>\\^`{|}]+/g)
                  if (urlMatch && urlMatch.length > 0) {
                    link = urlMatch[0]
                    const innerYtMatch = link.match(idRegex)
                    if (innerYtMatch) {
                      ytId = innerYtMatch[1]
                      link = `https://www.youtube.com/watch?v=${ytId}`
                    }
                  }
                }
              }
            } catch (e) {}
          }

          const descMatch = itemRaw.match(/<(?:description|summary|content|content:encoded)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|summary|content|content:encoded)>/i)
          const contentMatch = itemRaw.match(/<(?:content:encoded|encoded)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:content:encoded|encoded)>/i)
          const dateMatch = itemRaw.match(/<(?:pubDate|published|updated)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:pubDate|published|updated)>/i)
          
          let description = descMatch ? decodeHtml(descMatch[1].replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()) : ''
          const pubDate = dateMatch ? dateMatch[1].trim() : ''
          
          let thumb = ''
          if (ytId) {
            thumb = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
          } else {
            const ytMatch = link.match(/(?:v=|v\/|embed\/|youtu\.be\/|watch\?v%3D|watch\?v=)([A-Za-z0-9_-]{11})/i)
            if (ytMatch) {
              thumb = `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`
            } else {
              // Try Media RSS tags first
              const mediaMatch = itemRaw.match(/<(?:media:content|media:thumbnail)[^>]+url=["']([^"']+)["']/i) ||
                                 itemRaw.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image\/[^"']+["']/i) ||
                                 itemRaw.match(/<image[^>]*>([\s\S]*?)<\/image>/i)
              
              if (mediaMatch) {
                thumb = mediaMatch[1].includes('url=') ? (mediaMatch[1].match(/url=["']([^"']+)["']/i)?.[1] || '') : mediaMatch[1]
              } else {
                // Look in description OR content:encoded
                const searchBody = (descMatch ? descMatch[1] : '') + (contentMatch ? contentMatch[1] : '')
                const imgMatch = searchBody.match(/<img[^>]+src=["']([^"'>]+)["']/i) || searchBody.match(/<img[^>]+src=([^ >]+)/i)
                if (imgMatch) thumb = imgMatch[1].replace(/['"]/g, '').trim()
              }
            }
          }

          rawParsed.push({
            titleRaw: title,
            link, pubDate,
            description: description || (source.category === 'youtube' ? '유튜브에서 관련 영상을 시청하세요.' : '기사 본문을 확인하세요.'),
            source: source.name, category: source.category,
            thumb: thumb && thumb.startsWith('//') ? 'https:' + thumb : thumb
          })
        }

        // Parallel Translation if enabled: Only translate first 10 for speed
        const itemsToProcess = (source as any).translate ? rawParsed.slice(0, 10) : rawParsed
        
        const finalizedItems: NewsItem[] = await Promise.all(itemsToProcess.map(async (item: any) => {
          let title = item.titleRaw
          let description = item.description
          
          if ((source as any).translate) {
            try {
              const [tTitle, tDesc] = await Promise.all([
                translateText(title),
                description ? translateText(description) : Promise.resolve('')
              ])
              title = tTitle
              if (tDesc) description = tDesc
            } catch (e) {
              console.error('Translation failed', e)
            }
          }

          const parts = title.split(/ - | \| | : /)
          return {
            title: parts[0].trim(),
            link: item.link,
            pubDate: item.pubDate,
            description,
            source: item.source,
            category: item.category,
            provider: parts.length > 1 ? parts[parts.length - 1].trim() : '',
            thumb: item.thumb
          }
        }))

        if (finalizedItems.length > 0) {
          updateNewsList(finalizedItems)
          return finalizedItems
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

  // 5 Minutes Global Refresh Logic
  const now = Date.now()
  const isStale = now - lastGlobalSyncTime.value > 5 * 60 * 1000
  if (isStale) {
    sessionProcessedSources.value.clear()
    lastGlobalSyncTime.value = now
  }

  if (activeCategory.value === 'all') {
    totalTaskSources.value = RSS_SOURCES.length
    processedTaskSources.value = sessionProcessedSources.value.size
  } else {
    const catSources = RSS_SOURCES.filter(s => s.category === activeCategory.value)
    totalTaskSources.value = catSources.length
    processedTaskSources.value = catSources.filter(s => sessionProcessedSources.value.has(s.url)).length
  }

  // If already full, just show updated message briefly or skip
  if (processedTaskSources.value === totalTaskSources.value && !isStale) {
    if (activeCategory.value === 'all') {
      totalTaskSources.value = RSS_SOURCES.length
      processedTaskSources.value = sessionProcessedSources.value.size
    } else {
      const catSources = RSS_SOURCES.filter(s => s.category === activeCategory.value)
      totalTaskSources.value = catSources.length
      processedTaskSources.value = catSources.filter(s => sessionProcessedSources.value.has(s.url)).length
    }
    
    if (processedTaskSources.value === totalTaskSources.value) {
      currentLoadingCategoryName.value = 'Up to date'
      isBackgroundLoading.value = true
      setTimeout(() => { if (sessionId === currentFetchSession.value) isBackgroundLoading.value = false }, 1500)
      return
    }
  }

  try {
    isBackgroundLoading.value = true
    
    // 1. Process current active category first (Priority Group)
    const prioritySources = activeCategory.value === 'all'
      ? RSS_SOURCES.filter(s => ['ai', 'finance', 'it', 'game', 'sports', 'entertain'].includes(s.category)).slice(0, 15)
      : RSS_SOURCES.filter(s => s.category === activeCategory.value)

    const realPriority = prioritySources.filter(s => !sessionProcessedSources.value.has(s.url))
    
    if (realPriority.length > 0) {
      if (sessionId !== currentFetchSession.value) return
      currentLoadingCategoryName.value = getCategoryName(activeCategory.value)
      await Promise.all(realPriority.map(source => 
        fetchSource(source).finally(() => {
          if (sessionId === currentFetchSession.value) {
            sessionProcessedSources.value.add(source.url)
            if (activeCategory.value === 'all') {
              totalTaskSources.value = RSS_SOURCES.length
              processedTaskSources.value = sessionProcessedSources.value.size
            } else {
              const catSources = RSS_SOURCES.filter(s => s.category === activeCategory.value)
              totalTaskSources.value = catSources.length
              processedTaskSources.value = catSources.filter(s => sessionProcessedSources.value.has(s.url)).length
            }
          }
        })
      ))
      isLoading.value = false
    } else {
      if (news.value.length > 20) isLoading.value = false
    }
    
    // 2. Process all other categories SEQUENTIALLY
    const startBackgroundFetch = async () => {
      const remainingSources = RSS_SOURCES.filter(s => !sessionProcessedSources.value.has(s.url))
      const categoryGroups = remainingSources.reduce((acc, source) => {
        if (!acc[source.category]) acc[source.category] = []
        acc[source.category].push(source)
        return acc
      }, {} as Record<string, typeof RSS_SOURCES>)
      
      const categoryIds = categories.map(c => c.id).filter(id => categoryGroups[id])
      
      for (const catId of categoryIds) {
        if (sessionId !== currentFetchSession.value) return
        
        const group = categoryGroups[catId]
        currentLoadingCategoryName.value = getCategoryName(catId)
        
        await Promise.all(group.map(s => 
          fetchSource(s).finally(() => {
            if (sessionId === currentFetchSession.value) {
              sessionProcessedSources.value.add(s.url)
              if (activeCategory.value === 'all') {
                totalTaskSources.value = RSS_SOURCES.length
                processedTaskSources.value = sessionProcessedSources.value.size
              } else {
                const catSources = RSS_SOURCES.filter(s => s.category === catId)
                totalTaskSources.value = catSources.length
                processedTaskSources.value = catSources.filter(s => sessionProcessedSources.value.has(s.url)).length
              }
            }
          })
        ))
        
        await new Promise(r => setTimeout(r, 400))
        if (isLoading.value && news.value.length > 20) isLoading.value = false
      }
      
      if (sessionId !== currentFetchSession.value) return
      
      setTimeout(() => {
        if (sessionId === currentFetchSession.value) {
          currentLoadingCategoryName.value = 'Ready'
          processedTaskSources.value = totalTaskSources.value
          setTimeout(() => {
            if (sessionId === currentFetchSession.value) isBackgroundLoading.value = false
          }, 2000)
        }
      }, 500)
    }
    
    startBackgroundFetch()
    
    setTimeout(() => { if (isLoading.value) isLoading.value = false }, 5000)
    setTimeout(fetchMissingThumbnails, 4000)
  } catch (err) {
    if (news.value.length > 0) isLoading.value = false
  }
}

const fetchMissingThumbnails = async () => {
  // 1. Prioritize current category items that lack thumbnails
  const currentItems = activeCategory.value === 'all' 
    ? news.value 
    : news.value.filter(n => n.category === activeCategory.value)
    
  let pending = currentItems.filter(n => !n.thumb).slice(0, 15) // Reduced from 30 to 15
  
  // 2. If space remains, fill with other categories' items
  if (pending.length < 15) {
    const others = news.value.filter(n => !n.thumb && n.category !== activeCategory.value).slice(0, 15 - pending.length)
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
          localStorage.setItem(CACHE_KEY, JSON.stringify(news.value))
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

/* Toast Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s cubic-bezier(0.2, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Category Name Motion: Slide up and Fade */
.slide-up-fade-enter-active,
.slide-up-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.slide-up-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
.theme-sports { --brand-color: #f59e0b; --brand-bg: rgba(245, 158, 11, 0.05); }
.theme-entertain { --brand-color: #ec4899; --brand-bg: rgba(236, 72, 153, 0.05); }
.theme-game { --brand-color: #9333ea; --brand-bg: rgba(147, 51, 234, 0.05); }
.theme-figma { --brand-color: #f24e1e; --brand-bg: rgba(242, 78, 30, 0.05); }
.theme-youtube { --brand-color: #ef4444; --brand-bg: rgba(239, 68, 68, 0.05); }
.theme-insurance { --brand-color: #f97316; --brand-bg: rgba(249, 115, 22, 0.05); }
.theme-diablo2 { --brand-color: #c44135; --brand-bg: rgba(196, 65, 53, 0.05); }
.theme-googleart { --brand-color: #0ea5e9; --brand-bg: rgba(14, 165, 233, 0.05); }
.theme-it { --brand-color: #3b82f6; --brand-bg: rgba(59, 130, 246, 0.05); }

/* Apply Theme to Header Tabs */
.category-tab[data-cat="all"] .active-underline { background-color: #18181b; }
.dark .category-tab[data-cat="all"] .active-underline { background-color: white !important; }

/* Active Title & Underline Colors */
.category-tab[data-cat="ai"][data-active="true"] { color: #6366f1 !important; }
.category-tab[data-cat="ai"][data-active="true"] .active-underline { background-color: #6366f1; }

.category-tab[data-cat="it"][data-active="true"] { color: #3b82f6 !important; }
.category-tab[data-cat="it"][data-active="true"] .active-underline { background-color: #3b82f6; }

.category-tab[data-cat="finance"][data-active="true"] { color: #0acaaa !important; }
.category-tab[data-cat="finance"][data-active="true"] .active-underline { background-color: #0acaaa; }

.category-tab[data-cat="design"][data-active="true"] { color: #fa4fc1 !important; }
.category-tab[data-cat="design"][data-active="true"] .active-underline { background-color: #fa4fc1; }

.category-tab[data-cat="sports"][data-active="true"] { color: #f59e0b !important; }
.category-tab[data-cat="sports"][data-active="true"] .active-underline { background-color: #f59e0b; }

.category-tab[data-cat="entertain"][data-active="true"] { color: #ec4899 !important; }
.category-tab[data-cat="entertain"][data-active="true"] .active-underline { background-color: #ec4899; }

.category-tab[data-cat="game"][data-active="true"] { color: #9333ea !important; }
.category-tab[data-cat="game"][data-active="true"] .active-underline { background-color: #9333ea; }

.category-tab[data-cat="figma"][data-active="true"] { color: #f24e1e !important; }
.category-tab[data-cat="figma"][data-active="true"] .active-underline { background-color: #f24e1e; }

.category-tab[data-cat="youtube"][data-active="true"] { color: #ef4444 !important; }
.category-tab[data-cat="youtube"][data-active="true"] .active-underline { background-color: #ef4444; }

.category-tab[data-cat="insurance"][data-active="true"] { color: #f97316 !important; }
.category-tab[data-cat="insurance"][data-active="true"] .active-underline { background-color: #f97316; }

.category-tab[data-cat="diablo2"][data-active="true"] { color: #c44135 !important; }
.category-tab[data-cat="diablo2"][data-active="true"] .active-underline { background-color: #c44135; }

.category-tab[data-cat="googleart"][data-active="true"] { color: #0ea5e9 !important; }
.category-tab[data-cat="googleart"][data-active="true"] .active-underline { background-color: #0ea5e9; }

/* Refined News Card Styling */
.news-card.theme-ai { --brand-color: #6366f1; --brand-bg: rgba(99, 102, 241, 0.05); }
.news-card.theme-finance { --brand-color: #0acaaa; --brand-bg: rgba(10, 202, 170, 0.05); }
.news-card.theme-design { --brand-color: #fa4fc1; --brand-bg: rgba(250, 79, 193, 0.05); }
.news-card.theme-sports { --brand-color: #f59e0b; --brand-bg: rgba(245, 158, 11, 0.05); }
.news-card.theme-entertain { --brand-color: #ec4899; --brand-bg: rgba(236, 72, 153, 0.05); }
.news-card.theme-game { --brand-color: #9333ea; --brand-bg: rgba(147, 51, 234, 0.05); }
.news-card.theme-figma { --brand-color: #f24e1e; --brand-bg: rgba(242, 78, 30, 0.05); }
.news-card.theme-youtube { --brand-color: #ef4444; --brand-bg: rgba(239, 68, 68, 0.05); }
.news-card.theme-insurance { --brand-color: #f97316; --brand-bg: rgba(249, 115, 22, 0.05); }
.news-card.theme-diablo2 { --brand-color: #c44135; --brand-bg: rgba(196, 65, 53, 0.05); }
.news-card.theme-googleart { --brand-color: #0ea5e9; --brand-bg: rgba(14, 165, 233, 0.05); }
.news-card.theme-it { --brand-color: #3b82f6; --brand-bg: rgba(59, 130, 246, 0.05); }

/* Hover Effects: Enabled only for devices that support hover (Mouse) to prevent sticky feel on mobile */
@media (hover: hover) {
  .news-card:hover {
    transform: translateY(-4px);
  }
  
  .news-card.theme-ai:hover { border-color: #6366f180; }
  .news-card.theme-finance:hover { border-color: #0acaaa80; }
  .news-card.theme-design:hover { border-color: #fa4fc180; }
  .news-card.theme-sports:hover { border-color: #f59e0b80; }
  .news-card.theme-entertain:hover { border-color: #ec489980; }
  .news-card.theme-game:hover { border-color: #9333ea80; }
  .news-card.theme-figma:hover { border-color: #f24e1e80; }
  .news-card.theme-youtube:hover { border-color: #ef444480; }
  .news-card.theme-diablo2:hover { border-color: #c4413580; }
  .news-card.theme-insurance:hover { border-color: #f9731680; }
  .news-card.theme-googleart:hover { border-color: #0ea5e980; }
  .news-card.theme-it:hover { border-color: #3b82f680; }

  .news-card:hover .title-element {
    opacity: 0.8;
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
.news-card.theme-sports .source-badge { border-color: #f59e0b30; }
.news-card.theme-entertain .source-badge { border-color: #ec489930; }
.news-card.theme-game .source-badge { border-color: #9333ea30; }
.news-card.theme-figma .source-badge { border-color: #f24e1e30; }
.news-card.theme-youtube .source-badge { border-color: #ef444430; }
.news-card.theme-diablo2 .source-badge { border-color: #c4413530; }
.news-card.theme-insurance .source-badge { border-color: #f9731630; }
.news-card.theme-googleart .source-badge { border-color: #0ea5e930; }
.news-card.theme-it .source-badge { border-color: #3b82f630; }

.more-link {
  color: var(--brand-color);
}


</style>
