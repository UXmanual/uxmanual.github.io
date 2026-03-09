<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-[#131313] text-zinc-900 dark:text-white transition-colors duration-200">
    <SiteNavbar />
    
    <div class="pt-[60px]">
      <SiteBanner />
    </div>

    <main class="relative w-full h-[calc(100vh-60px)] overflow-hidden bg-zinc-100 dark:bg-[#131313]">
      <!-- Map View (Background Layer) -->
      <div class="absolute inset-0 z-10">
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

      <!-- Content Layer: Restaurant List -->
      <div class="relative z-20 h-full pointer-events-none">
        <div class="max-w-[1800px] mx-auto h-full px-6 lg:px-10 py-10 flex flex-col lg:flex-row gap-8">
          
          <!-- Desktop: Floating Sidebar | Mobile: Bottom Sheet -->
          <div 
            class="fixed lg:relative inset-x-0 bottom-0 lg:inset-auto lg:top-0 lg:left-0 z-[60] lg:z-30 w-full lg:w-[400px] pointer-events-auto transition-transform duration-500 ease-in-out transform lg:translate-y-0"
            :class="isListOpen ? 'translate-y-0' : 'translate-y-[calc(100%-40px)] lg:translate-y-0'"
          >
            <!-- Bottom Sheet Handle (Mobile Only) -->
            <div 
              @click="isListOpen = !isListOpen"
              class="lg:hidden w-full h-[40px] bg-white dark:bg-[#1f1f1f] rounded-t-[32px] border-t border-x border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            >
              <div class="w-12 h-1.5 bg-zinc-200 dark:bg-white/10 rounded-full"></div>
            </div>

            <!-- List Container (Glassmorphism for Desktop) -->
            <div 
              class="bg-white/90 dark:bg-[#131313]/90 backdrop-blur-xl lg:rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 h-[60vh] lg:h-full lg:max-h-[calc(100vh-140px)] overflow-y-auto px-6 lg:px-5 pt-10 lg:pt-6 pb-16 lg:pb-6 custom-scrollbar space-y-2.5"
            >
              <!-- Desktop Header inside floating box -->
              <div class="hidden lg:block mb-6">
                <h1 class="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none mb-1">EATS & PLACES</h1>
                <p class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Gourmet Guide & Maps</p>
              </div>

              <div 
                v-for="shop in restaurantList" 
                :key="shop.id"
                @click="handleShopSelect(shop)"
                class="p-4 rounded-2xl border transition-all duration-300 cursor-pointer group"
                :class="selectedId === shop.id 
                  ? 'bg-white dark:bg-white/10 border-zinc-900 dark:border-white shadow-md' 
                  : 'bg-white/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20'"
              >
                <div class="flex justify-between items-start mb-1">
                  <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/5">
                    {{ shop.category }}
                  </span>
                  <span class="text-[10px] font-bold text-orange-500">★ {{ shop.rating }}</span>
                </div>
                <h3 class="text-base font-bold mb-0.5 group-hover:text-orange-500 transition-colors">{{ shop.name }}</h3>
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
          <div v-show="!isListOpen" class="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-[50] pointer-events-auto">
            <button 
              @click="isListOpen = true"
              class="flex items-center gap-2 px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-bold text-sm shadow-2xl active:scale-95 transition-all duration-200 border border-zinc-800 dark:border-zinc-200"
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

    <SiteFooter class="relative z-30" />
  </div>
</template>

<script setup lang="ts">
/**
 * Eats.vue
 * Draft layout for the Gourmet Guide section.
 * Integrates a restaurant list with a Google Maps Embed API.
 */
import { ref, computed } from 'vue'
import SiteNavbar from '../components/SiteNavbar.vue'
import SiteFooter from '../components/SiteFooter.vue'
import SiteHeader from '../components/SiteHeader.vue'
import SiteBanner from '../components/SiteBanner.vue'

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
}

const restaurantList = ref<Shop[]>([
  {
    id: 1,
    name: "스시 젠 (Sushi Zen)",
    category: "일식",
    rating: 4.8,
    description: "츠키지 시장에서 공수한 신선한 제철 재료로 만든 정통 에도마에 스시를 경험해보세요.",
    address: "일본 도쿄 주오구",
    lat: 35.6662,
    lng: 139.7755
  },
  {
    id: 2,
    name: "라 테이블 드 조엘 (La Table de Joel)",
    category: "프렌치",
    rating: 4.9,
    description: "정교한 플레이팅과 깊은 풍미가 돋보이는 모던 프렌치 퀴진의 정수입니다.",
    address: "일본 도쿄 미나토구",
    lat: 35.6605,
    lng: 139.7291
  },
  {
    id: 3,
    name: "이치류 라멘 (Ichiryu Ramen)",
    category: "라멘",
    rating: 4.6,
    description: "진한 돈코츠 육수와 직접 뽑은 얇은 면으로 유명한 후쿠오카 대표 라멘 맛집입니다.",
    address: "일본 후쿠오카",
    lat: 33.5891,
    lng: 130.4017
  },
  {
    id: 4,
    name: "교토 가이세키 티 하우스",
    category: "전통식",
    rating: 4.7,
    description: "전통적인 코스 요리를 통해 교토의 계절적 아름다움을 오감으로 느껴보세요.",
    address: "일본 교토",
    lat: 35.0116,
    lng: 135.7681
  },
  {
    id: 5,
    name: "삿포로 씨푸드 그릴",
    category: "해산물",
    rating: 4.5,
    description: "갓 잡은 킹크랩과 가리비를 숯불에 구워 바다의 향을 그대로 담아냈습니다.",
    address: "일본 홋카이도 삿포로",
    lat: 43.0611,
    lng: 141.3564
  }
])

const selectedId = ref(1)
const isListOpen = ref(false)
const selectedShop = computed(() => restaurantList.value.find(s => s.id === selectedId.value))

/**
 * Updates the selected shop and triggers a map update.
 * Closes the mobile bottom sheet after selection.
 * @param shop The shop object to select
 */
const handleShopSelect = (shop: Shop) => {
  selectedId.value = shop.id
  // Close the bottom sheet on mobile after selecting a shop
  if (window.innerWidth < 1024) {
    isListOpen.value = false
  }
}

/**
 * Legacy wrapper for compatibility if needed, 
 * but Template now uses handleShopSelect.
 */
const selectShop = (shop: Shop) => handleShopSelect(shop)

/**
 * Generates the Google Maps Embed URL based on selected shop coordinates.
 * Using 'view' mode for coordination-based display which is free.
 * Note: A valid API Key is required for Production.
 */
const mapUrl = computed(() => {
  if (!selectedShop.value) return ''
  const { lat, lng } = selectedShop.value
  // Using place search if we want specific pins, or view if we want coords.
  // For precise coord jumping with a pin, 'place' + 'q=lat,lng' is a robust choice for Embed API.
  return `https://www.google.com/maps/embed/v1/place?key=AIzaSyAbcrzDVtglZAhgoFEkyc44E_4WMZGpSFE&q=${lat},${lng}&zoom=16`
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
