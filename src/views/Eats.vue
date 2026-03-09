<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-[#131313] text-zinc-900 dark:text-white transition-colors duration-200">
    <SiteNavbar />
    
    <div class="pt-[60px]">
      <SiteBanner />
    </div>

    <SiteHeader 
      title="EATS & PLACES" 
      description="Curated restaurant lists with real-time locations"
      padding-top="pt-16"
      :enable-gradient="false"
    />

    <main class="px-6 md:px-10 pb-20 max-w-[1800px] mx-auto pt-12">
      <div class="flex flex-col lg:flex-row gap-8 min-h-[600px]">
        
        <!-- Left: Restaurant List -->
        <div class="w-full lg:w-1/3 space-y-2.5 overflow-y-auto max-h-[800px] pr-4 custom-scrollbar">
          <div 
            v-for="shop in restaurantList" 
            :key="shop.id"
            @click="selectShop(shop)"
            class="p-4 rounded-xl border transition-all duration-300 cursor-pointer group"
            :class="selectedId === shop.id 
              ? 'bg-white dark:bg-white/10 border-zinc-900 dark:border-white shadow-xl' 
              : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 hover:border-zinc-400 dark:hover:border-white/20'"
          >
            <div class="flex justify-between items-start mb-1">
              <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/5">
                {{ shop.category }}
              </span>
              <span class="text-[10px] font-bold text-orange-500">★ {{ shop.rating }}</span>
            </div>
            <h3 class="text-base font-bold mb-0.5 group-hover:text-orange-500 transition-colors">{{ shop.name }}</h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{{ shop.description }}</p>
            <div class="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 uppercase tracking-tight">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ shop.address }}
            </div>
          </div>
        </div>

        <!-- Right: Map View (Google Maps Embed) -->
        <div class="w-full lg:w-2/3 h-[400px] lg:h-[800px] sticky top-[100px] rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 shadow-2xl">
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

      </div>
    </main>

    <SiteFooter />
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
const selectedShop = computed(() => restaurantList.value.find(s => s.id === selectedId.value))

/**
 * Updates the selected shop and triggers a map update.
 * @param shop The shop object to select
 */
const selectShop = (shop: Shop) => {
  selectedId.value = shop.id
}

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
