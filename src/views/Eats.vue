<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-[#131313] text-zinc-900 dark:text-white transition-colors duration-200">
    <SiteNavbar :is-sheet-full="false" />
    
    <main class="relative w-full h-[100svh] overflow-hidden bg-zinc-100 dark:bg-[#131313] touch-none overscroll-none">
      <div 
        class="absolute top-[60px] left-0 right-0 bottom-0 z-10"
      >
        <transition name="fade" mode="out-in">
          <iframe
            :key="mapUrl"
            width="100%"
            height="100%"
            style="border:0"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            :src="mapUrl"
          ></iframe>
        </transition>
      </div>

      <!-- Dim Overlay: Blocks map, dims background, and collapses on click -->
      <transition 
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="sheetMode !== 'collapsed' || isDragging"
          class="fixed top-[60px] left-0 right-0 bottom-0 z-[45] bg-transparent pointer-events-auto cursor-pointer"
          @click="sheetMode = 'collapsed'"
          @touchstart.stop
        ></div>
      </transition>

      <!-- Content Layer: Restaurant List -->
      <div class="relative z-[60] lg:z-40 h-full pointer-events-none">
        <div class="max-w-[1800px] mx-auto h-[calc(100vh-60px)] mt-[60px] px-6 lg:px-10 flex flex-col lg:flex-row lg:items-center lg:justify-end gap-8">
          
          <!-- Desktop: Floating Sidebar (Right) | Mobile: Bottom Sheet -->
          <div 
            class="fixed lg:relative inset-x-0 top-0 lg:inset-auto lg:top-0 lg:right-0 z-[60] lg:z-30 w-full lg:w-[400px] h-[100svh] lg:h-[calc(100vh-100px)] pointer-events-auto bg-white dark:bg-zinc-900 shadow-2xl rounded-t-[32px] lg:rounded-3xl transition-transform duration-500 ease-in-out transform touch-none select-none flex flex-col"
            :class="[
              sheetMode === 'collapsed' && !isDragging ? 'translate-y-[calc(100svh-85px)]' : '',
              sheetMode === 'half' && !isDragging ? 'translate-y-[60svh]' : '',
              sheetMode === 'full' && !isDragging ? 'translate-y-[120px]' : '',
              windowWidth >= 1024 ? '!translate-y-0' : ''
            ]"
            :style="isDragging ? { transform: `translateY(${dragTranslateY}px)`, transition: 'none' } : {}"
            @pointerdown="handlePointerDown"
            @mousedown.stop
          >
            <!-- Swipe Handle Area (Visual only now, logic is on container) -->
            <div 
              class="lg:hidden shrink-0 w-full h-[40px] flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
            >
              <div class="w-12 h-1.5 bg-zinc-400 dark:bg-white/20 rounded-full"></div>
            </div>

            <!-- Country Tabs -->
            <div class="shrink-0 px-6 lg:px-5 pb-5 lg:pt-8 flex gap-5 overflow-x-auto no-scrollbar">
              <button 
                v-for="country in countries" 
                :key="country"
                @click.stop="handleCountryChange(country as '한국' | '일본')"
                class="relative py-1 text-sm font-bold tracking-tight transition-all duration-300 whitespace-nowrap pointer-events-auto"
                :class="selectedCountry === country 
                  ? 'text-zinc-900 dark:text-white' 
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'"
              >
                {{ country }}
                <div 
                  v-if="selectedCountry === country"
                  class="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-full"
                ></div>
              </button>
            </div>

            <!-- Bottom Extension to prevent holes during over-drag (Moved outside scroll area) -->
            <div class="lg:hidden absolute top-[100%] left-0 right-0 h-[2000px] bg-white dark:bg-zinc-900 z-[-1] pointer-events-none"></div>

            <!-- List Container (Glassmorphism for Desktop) -->
            <div 
              ref="scrollContainer"
              class="grow px-6 lg:px-5 pt-0 pb-40 lg:pb-8 custom-scrollbar space-y-2.5 relative overscroll-contain overflow-x-hidden"
              :class="(sheetMode === 'full' || windowWidth >= 1024) && !isDragging ? 'overflow-y-auto' : 'overflow-y-hidden'"
            >
              <!-- Header inside floating box: Dynamic Area Name (Mobile & Desktop) -->
              <div v-if="selectedShop" class="mb-6 pt-0" @pointerdown.stop>
                <h1 class="text-2xl font-black text-zinc-900 dark:text-white uppercase leading-tight">{{ selectedShop.address }}</h1>
              </div>

              <div 
                v-for="shop in filteredRestaurants" 
                :key="shop.id"
                @click="handleShopSelect(shop)"
                class="p-4 rounded-2xl transition-all duration-300 cursor-pointer group border"
                :class="selectedId === shop.id 
                  ? 'bg-white dark:bg-white/10 border-[#1a73e8]' 
                  : 'bg-transparent border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5'"
              >
                <div class="flex justify-between items-start mb-1">
                  <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/5">
                    {{ shop.category }}
                  </span>
                  <span class="text-[10px] font-bold text-[#1a73e8]">★ {{ shop.rating }}</span>
                </div>
                <h3 class="text-base font-bold mb-0.5 group-hover:text-[#1a73e8] transition-colors">{{ shop.name }}</h3>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">{{ shop.description }}</p>
                <div class="mt-2.5 flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 uppercase tracking-tight">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ shop.address }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Floating Mobile Toggle Button -->
          <div v-show="sheetMode === 'collapsed'" class="lg:hidden fixed bottom-[105px] left-1/2 -translate-x-1/2 z-[50] pointer-events-auto">
            <button 
              @click="sheetMode = 'half'"
              class="flex items-center gap-2 px-6 py-3.5 bg-[#1a73e8] text-white rounded-full font-bold text-sm shadow-2xl active:scale-95 transition-all duration-200 border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              목록보기
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * Eats.vue
 * Draft layout for the Gourmet Guide section.
 * Integrates a restaurant list with a Google Maps Embed API.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SiteNavbar from '../components/SiteNavbar.vue'

// Mock Data for Layout Demonstration
interface Shop {
  id: number
  name: string
  category: string
  rating: number
  description: string
  address: string
  lat: number
  lng: number
  country: '한국' | '일본'
}

const restaurantList = ref<Shop[]>([
  {
    id: 101,
    name: "가온 (Gaon)",
    category: "한식",
    rating: 4.9,
    description: "전통 한식의 정수를 보여주는 미쉐린 3스타 레스토랑입니다.",
    address: "서울특별시 강남구 신사동",
    lat: 37.5256,
    lng: 127.0358,
    country: '한국'
  },
  {
    id: 102,
    name: "우래옥 (Wooraeok)",
    category: "고기요리",
    rating: 4.7,
    description: "70년 전통의 평양냉면과 불고기 명가입니다.",
    address: "서울특별시 중구 주교동",
    lat: 37.5683,
    lng: 126.9995,
    country: '한국'
  },
  {
    id: 103,
    name: "밍글스 (Mingles)",
    category: "퓨전한식",
    rating: 4.8,
    description: "한국 전통 식재료를 현대적으로 재해석한 창의적인 요리입니다.",
    address: "서울특별시 강남구 논현동",
    lat: 37.5212,
    lng: 127.0413,
    country: '한국'
  },
  {
    id: 1,
    name: "스시 젠 (Sushi Zen)",
    category: "일식",
    rating: 4.8,
    description: "츠키지 시장에서 공수한 신선한 제철 재료로 만든 정통 에도마에 스시를 경험해보세요.",
    address: "일본 도쿄 주오구",
    lat: 35.6662,
    lng: 139.7755,
    country: '일본'
  },
  {
    id: 2,
    name: "라 테이블 드 조엘 (La Table de Joel)",
    category: "프렌치",
    rating: 4.9,
    description: "정교한 플레이팅과 깊은 풍미가 돋보이는 모던 프렌치 퀴진의 정수입니다.",
    address: "일본 도쿄 미나토구",
    lat: 35.6605,
    lng: 139.7291,
    country: '일본'
  },
  {
    id: 3,
    name: "이치류 라멘 (Ichiryu Ramen)",
    category: "라멘",
    rating: 4.6,
    description: "진한 돈코츠 육수와 직접 뽑은 얇은 면으로 유명한 후쿠오카 대표 라멘 맛집입니다.",
    address: "일본 후쿠오카현 후쿠오카시",
    lat: 33.5891,
    lng: 130.4017,
    country: '일본'
  },
  {
    id: 4,
    name: "교토 가이세키 티 하우스",
    category: "전통식",
    rating: 4.7,
    description: "전통적인 코스 요리를 통해 교토의 계절적 아름다움을 오감으로 느껴보세요.",
    address: "일본 교토부 교토시",
    lat: 35.0116,
    lng: 135.7681,
    country: '일본'
  },
  {
    id: 5,
    name: "삿포로 씨푸드 그릴",
    category: "해산물",
    rating: 4.5,
    description: "갓 잡은 킹크랩과 가리비를 숯불에 구워 바다의 향을 그대로 담아냈습니다.",
    address: "일본 홋카이도 삿포로시",
    lat: 43.0611,
    lng: 141.3564,
    country: '일본'
  }
])

const countries = ['일본', '한국'] as const
const selectedCountry = ref<'한국' | '일본'>('일본')
const selectedId = ref(1)

const filteredRestaurants = computed(() => 
  restaurantList.value.filter(s => s.country === selectedCountry.value)
)

type SheetMode = 'collapsed' | 'half' | 'full'
const sheetMode = ref<SheetMode>('half')

const selectedShop = computed(() => 
  restaurantList.value.find(s => s.id === selectedId.value)
)

const handleCountryChange = (country: '한국' | '일본') => {
  selectedCountry.value = country
  const firstInCountry = filteredRestaurants.value[0]
  if (firstInCountry) {
    selectedId.value = firstInCountry.id
  }
}

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  // Lock body scroll to prevent browser UI hiding/showing
  document.documentElement.style.overflow = 'hidden'
  document.documentElement.style.height = '100svh'
  document.body.style.overflow = 'hidden'
  document.body.style.height = '100svh'
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // Restore body scroll
  document.documentElement.style.overflow = ''
  document.documentElement.style.height = ''
  document.body.style.overflow = ''
  document.body.style.height = ''
})

// Swipe Interaction Logic (Integrated with Scrolling)
const scrollContainer = ref<HTMLElement | null>(null)
const startY = ref(0)
const isDragging = ref(false)
const dragTranslateY = ref(0)

const getModeOffset = (mode: SheetMode) => {
  const containerHeight = window.innerHeight
  if (mode === 'collapsed') return containerHeight - 85
  if (mode === 'half') return containerHeight * 0.6 // 2/5 visible = 60% offset
  return 120 // Stop 120px from top
}

const handlePointerDown = (e: PointerEvent) => {
  if (window.innerWidth >= 1024) return
  // Don't stop propagation here to allow child clicks but start drag check
  
  startY.value = e.clientY
  isDragging.value = false
  dragTranslateY.value = getModeOffset(sheetMode.value)
  
  // Attach move/up to window/overlay to ensure focus
  window.addEventListener('pointermove', handlePointerMove, { passive: false })
  window.addEventListener('pointerup', handlePointerUp)
}

const handlePointerMove = (e: PointerEvent) => {
  if (window.innerWidth >= 1024) return
  e.stopPropagation()

  const deltaY = e.clientY - startY.value
  const scrollTop = scrollContainer.value?.scrollTop || 0
  
  // Distance check to ignore small jitter (taps)
  if (!isDragging.value && Math.abs(deltaY) > 8) {
    // Decision logic to start dragging
    const atTop = scrollTop <= 5 
    const isSwipingDown = deltaY > 0
    const isSwipingUp = deltaY < 0
    
    // 1. Kéo xuống khi đang ở đỉnh danh sách (kể cả Full 모드 탈출)
    // 2. Kéo lên khi chưa ở Full 모드
    if ((isSwipingDown && atTop) || (isSwipingUp && sheetMode.value !== 'full')) {
      isDragging.value = true
      startY.value = e.clientY - getModeOffset(sheetMode.value)
    }
  }

  if (isDragging.value) {
    let newPos = e.clientY - startY.value
    // Aggressive resistance near the top limit (120px)
    if (newPos < 120) {
      newPos = 120
    }
    dragTranslateY.value = newPos
    
    if (e.cancelable) e.preventDefault()
  }
}

const handlePointerUp = (e: PointerEvent) => {
  e.stopPropagation()
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
  
  if (!isDragging.value) return
  
  isDragging.value = false
  const sensitivity = 50 
  const currentOffset = dragTranslateY.value
  const prevOffset = getModeOffset(sheetMode.value)
  const diff = currentOffset - prevOffset

  if (Math.abs(diff) > sensitivity) {
    if (diff < 0) { // Up
      if (sheetMode.value === 'collapsed') sheetMode.value = 'half'
      else if (sheetMode.value === 'half') sheetMode.value = 'full'
    } else { // Down
      if (sheetMode.value === 'full') sheetMode.value = 'half'
      else if (sheetMode.value === 'half') sheetMode.value = 'collapsed'
    }
  }
}

/**
 * Handles map interaction to hide the initial peek
 */
const handleMapInteraction = () => {
  if (sheetMode.value !== 'collapsed') {
    sheetMode.value = 'collapsed'
  }
}

/**
 * Updates the selected shop and triggers a map update.
 * @param shop The shop object to select
 */
const handleShopSelect = (shop: Shop) => {
  selectedId.value = shop.id
  if (window.innerWidth < 1024) {
    sheetMode.value = 'collapsed'
  }
}

/**
 * Legacy wrapper for compatibility if needed, 
 * but Template now uses handleShopSelect.
 */
const selectShop = (shop: Shop) => handleShopSelect(shop)

/**
 * Generates the Google Maps Embed URL based on selected shop coordinates.
 * Using 'place' mode for rich details.
 */
const mapUrl = computed(() => {
  if (!selectedShop.value) return ''
  const { name, address } = selectedShop.value
  // Using name + address to help Google Maps find the actual place and show details
  const query = encodeURIComponent(`${name}, ${address}`)
  return `https://www.google.com/maps/embed/v1/place?key=AIzaSyAbcrzDVtglZAhgoFEkyc44E_4WMZGpSFE&q=${query}&zoom=16`
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
