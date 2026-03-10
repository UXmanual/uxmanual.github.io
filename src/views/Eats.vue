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
          class="lg:hidden fixed top-[60px] left-0 right-0 bottom-0 z-[45] bg-transparent pointer-events-auto"
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
              class="grow px-6 lg:px-5 pt-0 custom-scrollbar space-y-2.5 relative overscroll-contain overflow-x-hidden"
              :class="[
                (sheetMode === 'full' || sheetMode === 'half' || windowWidth >= 1024) && !isDragging ? 'overflow-y-auto' : 'overflow-y-hidden',
                (windowWidth < 1024 && (sheetMode === 'half' || sheetMode === 'collapsed')) ? 'pb-[50svh]' : 'pb-10 lg:pb-8',
                (isMouseDragging && hasMoved) ? 'cursor-grabbing select-none dragging-active' : 'cursor-grab'
              ]"
              @mousedown="startMouseDrag"
            >
              <!-- Header inside floating box: Dynamic Area Name (Mobile & Desktop) -->
              <div v-if="selectedShop" class="mb-6 pt-3" @pointerdown.stop>
                <h1 class="text-2xl font-black text-zinc-900 dark:text-white uppercase leading-tight">{{ selectedShop.address }}</h1>
              </div>

              <div 
                v-for="shop in filteredRestaurants" 
                :key="shop.id"
                :data-id="shop.id"
                @click="handleShopSelect(shop)"
                class="p-4 rounded-2xl transition-all duration-300 cursor-pointer group border"
                :class="selectedId === shop.id 
                  ? 'bg-white dark:bg-white/10 border-[#1a73e8]' 
                  : 'bg-transparent border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5'"
              >
                <div class="flex gap-4">
                  <!-- Thumbnail Image (Optional) -->
                  <div v-if="shop.imageUrl" class="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                    <img 
                      :src="shop.imageUrl" 
                      :alt="shop.name" 
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      @error="(e) => (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200&h=200'"
                    >
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="px-1.5 py-1 inline-flex items-center rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/5 leading-none">
                        {{ shop.category }}
                      </span>
                      <span class="text-[11px] font-bold text-[#1a73e8]">★ {{ shop.rating }}</span>
                    </div>
                    <h3 
                      class="text-base font-bold mb-0.5 group-hover:text-[#1a73e8] transition-colors"
                      :class="{ 'text-[#1a73e8]': selectedId === shop.id }"
                    >
                      {{ shop.name }}
                    </h3>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">{{ shop.description }}</p>
                    <div class="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-tight">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ shop.address }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- End of List Indicator -->
              <div class="pt-8 pb-8 text-center text-zinc-200 dark:text-zinc-800">
                <p class="text-[11px] font-bold uppercase tracking-normal">
                  마지막 리스트입니다
                </p>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
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
  imageUrl?: string
}

const restaurantList = ref<Shop[]>([
  // --- 한국 맛집 리스트 (서울 주요 지역별 정렬: 종로 > 중구 > 용산 > 강남 > 서초 > 마포 > 송파) ---
  {
    id: 104,
    name: "황생가칼국수",
    category: "칼국수",
    rating: 4.5,
    description: "북촌의 자부심, 깊은 사골 육수로 맛을 낸 정성 가득한 칼국수와 만두입니다.",
    address: "서울특별시 종로구 소격동",
    lat: 37.5801,
    lng: 126.9814,
    country: '한국'
  },
  {
    id: 105,
    name: "자하손만두",
    category: "만두부문",
    rating: 4.4,
    description: "부암동 산비탈에서 즐기는 정갈하고 담백한 개성식 손만두 전문점입니다.",
    address: "서울특별시 종로구 부암동",
    lat: 37.5936,
    lng: 126.9658,
    country: '한국'
  },
  {
    id: 106,
    name: "토속촌 삼계탕",
    category: "삼계탕",
    rating: 4.3,
    description: "경복궁 옆, 견과류가 들어간 진한 국물의 원조 삼계탕 맛집입니다.",
    address: "서울특별시 종로구 체부동",
    lat: 37.5776,
    lng: 126.9717,
    country: '한국'
  },
  {
    id: 102,
    name: "우래옥 (Wooraeok)",
    category: "고기요리",
    rating: 4.7,
    description: "70년 전통의 평양냉면과 불고기 명가, 명실상부 서울 최고의 노포입니다.",
    address: "서울특별시 중구 주교동",
    lat: 37.5683,
    lng: 126.9995,
    country: '한국'
  },
  {
    id: 107,
    name: "명동교자",
    category: "칼국수",
    rating: 4.6,
    description: "명동의 랜드마크, 진한 닭 육수와 부드러운 만두가 어우러진 맛의 명소입니다.",
    address: "서울특별시 중구 명동",
    lat: 37.5625,
    lng: 126.9856,
    country: '한국'
  },
  {
    id: 108,
    name: "하동관",
    category: "곰탕",
    rating: 4.4,
    description: "1939년부터 이어온, 맑고 깊은 국물 맛이 일품인 대표 곰탕집입니다.",
    address: "서울특별시 중구 명동",
    lat: 37.5668,
    lng: 126.9840,
    country: '한국'
  },
  {
    id: 109,
    name: "진주회관",
    category: "콩국수",
    rating: 4.5,
    description: "여름철 필수 코스, 걸쭉하고 진한 맛의 냉콩국수로 전국적인 명성을 가진 곳입니다.",
    address: "서울특별시 중구 서소문동",
    lat: 37.5623,
    lng: 126.9754,
    country: '한국'
  },
  {
    id: 110,
    name: "오레노라멘",
    category: "라멘",
    rating: 4.7,
    description: "진한 닭 육수의 토리파이탄 라멘으로 사랑받는 미쉐린 가이드 선정 맛집입니다.",
    address: "서울특별시 용산구 이태원동",
    lat: 37.5401,
    lng: 126.9922,
    country: '한국'
  },
  {
    id: 111,
    name: "나리식당",
    category: "냉동삼겹살",
    rating: 4.2,
    description: "한남동 냉삼 열풍의 주역, 청국장과 함께 즐기는 추억의 맛입니다.",
    address: "서울특별시 용산구 한남동",
    lat: 37.5385,
    lng: 127.0001,
    country: '한국'
  },
  {
    id: 112,
    name: "부자피자",
    category: "화덕피자",
    rating: 4.4,
    description: "한남동에서 즐기는 정통 이탈리안 화덕피자, 신선한 재료 본연의 맛을 살립니다.",
    address: "서울특별시 용산구 한남동",
    lat: 37.5388,
    lng: 127.0012,
    country: '한국'
  },
  {
    id: 101,
    name: "권숙수 (Kwon Sook Soo)",
    category: "한식",
    rating: 4.8,
    description: "한국의 전통 미학을 요리에 담아낸 미쉐린 2스타 한식 파인 다이닝입니다.",
    address: "서울특별시 강남구 신사동",
    lat: 37.5246,
    lng: 127.0355,
    country: '한국'
  },
  {
    id: 113,
    name: "정식당 (Jungsik)",
    category: "모던한식",
    rating: 4.9,
    description: "뉴욕과 서울을 잇는 뉴 코리안 퀴진의 선구자, 독창적인 메뉴를 선보입니다.",
    address: "서울특별시 강남구 청담동",
    lat: 37.5255,
    lng: 127.0407,
    country: '한국'
  },
  {
    id: 103,
    name: "밍글스 (Mingles)",
    category: "퓨전한식",
    rating: 4.8,
    description: "전통과 현대의 조화, 제철 식재료를 사용한 창의적인 코스 요리입니다.",
    address: "서울특별시 강남구 삼성동",
    lat: 37.5212,
    lng: 127.0413,
    country: '한국'
  },
  {
    id: 114,
    name: "새벽집",
    category: "육류요리",
    rating: 4.5,
    description: "청담동 24시간 맛집, 최고급 한우 구이와 육회비빔밥이 유명한 곳입니다.",
    address: "서울특별시 강남구 청담동",
    lat: 37.5252,
    lng: 127.0505,
    country: '한국'
  },
  {
    id: 115,
    name: "진미평양냉면",
    category: "평양냉면",
    rating: 4.6,
    description: "강남권 평양냉면의 신흥 강자, 깔끔한 육수와 제육의 조화가 완벽합니다.",
    address: "서울특별시 강남구 논현동",
    lat: 37.5161,
    lng: 127.0360,
    country: '한국'
  },
  {
    id: 116,
    name: "무교동 유정낙지",
    category: "낙지요리",
    rating: 4.2,
    description: "매콤한 낙지볶음의 대명사, 스트레스를 날려버리는 화끈한 맛입니다.",
    address: "서울특별시 서초구 서초동",
    lat: 37.4912,
    lng: 127.0125,
    country: '한국'
  },
  {
    id: 117,
    name: "버드나무집",
    category: "갈비",
    rating: 4.4,
    description: "서초동 갈비 명가, 한우 갈비탕의 푸짐함으로 항상 붐비는 곳입니다.",
    address: "서울특별시 서초구 서초동",
    lat: 37.4877,
    lng: 127.0315,
    country: '한국'
  },
  {
    id: 118,
    name: "옥동식",
    category: "돼지곰탕",
    rating: 4.7,
    description: "맑은 국물의 돼지곰탕이라는 새로운 장르를 개척한 미쉐린 선정 맛집입니다.",
    address: "서울특별시 마포구 서교동",
    lat: 37.5507,
    lng: 126.9145,
    country: '한국'
  },
  {
    id: 119,
    name: "진진 (Jin Jin)",
    category: "중식",
    rating: 4.6,
    description: "왕육성 셰프의 멘보샤가 일품인, 실리적이고 맛있는 중식 전문점입니다.",
    address: "서울특별시 마포구 서교동",
    lat: 37.5555,
    lng: 126.9115,
    country: '한국'
  },
  {
    id: 121,
    name: "벽제갈비",
    category: "소갈비",
    rating: 4.7,
    description: "한우 등급 관리팀을 별도로 운영하는 자타공인 최고급 한우 명가입니다.",
    address: "서울특별시 송파구 방이동",
    lat: 37.5115,
    lng: 127.1245,
    country: '한국'
  },
  // --- 일본 맛집 리스트 (평점순 20개, 지역별 정렬: 도쿄 > 오사카 > 교토 > 후쿠오카) ---
  {
    id: 1,
    name: "타치구이 아키라 (Tachigui Akira)",
    category: "스시",
    rating: 4.9,
    description: "신선한 네타와 정교한 샤리가 일품인 서서 먹는 정통 스시 바입니다.",
    address: "일본 도쿄 미나토구",
    lat: 35.6662,
    lng: 139.7583,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 2,
    name: "긴자 이부키 (Ginza Ibuki)",
    category: "가이세키",
    rating: 4.8,
    description: "긴자의 품격이 느껴지는 제철 식재료 중심의 고급 가이세키 요리입니다.",
    address: "일본 도쿄 주오구",
    lat: 35.6720,
    lng: 139.7710,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 3,
    name: "텐푸라 미카쿠 (Tempura Mikaku)",
    category: "텐푸라",
    rating: 4.7,
    description: "1931년 창업, 장인의 손길로 튀겨낸 바삭하고 정갈한 텐푸라 전문점입니다.",
    address: "일본 도쿄 미나토구",
    lat: 35.6694,
    lng: 139.7523,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1583953623787-ada99d338235?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 11,
    name: "로쿠린샤 (Rokurinsha)",
    category: "츠케멘",
    rating: 4.6,
    description: "도쿄역 캐릭터 스트리트의 명물, 진한 육수의 츠케멘 전문점입니다.",
    address: "일본 도쿄 지요다구",
    lat: 35.6814,
    lng: 139.7677,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 12,
    name: "이마한 (Imahan)",
    category: "스키야키",
    rating: 4.8,
    description: "100년 넘는 역사를 가진 최고급 쿠로게와규 스키야키 전문점입니다.",
    address: "일본 도쿄 니혼바시",
    lat: 35.6853,
    lng: 139.7820,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1504416285472-eccf03dd31eb?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 6,
    name: "호젠지 스시도코로 나카타니",
    category: "스시",
    rating: 4.8,
    description: "오사카 호젠지 골목의 숨은 보석 같은 미쉐린 스타 스시야입니다.",
    address: "일본 오사카부 오사카시",
    lat: 34.6675,
    lng: 135.5028,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1534483909716-dd79199797a1?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 7,
    name: "이자카야 토요 (Izakaya Toyo)",
    category: "해산물",
    rating: 4.7,
    description: "넷플릭스 출연으로 유명한, 활기찬 분위기의 노천 해산물 이자카야입니다.",
    address: "일본 오사카부 오사카시",
    lat: 34.6980,
    lng: 135.5348,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 8,
    name: "후쿠타로 (Fukutaro)",
    category: "오코노미야키",
    rating: 4.6,
    description: "오사카 3대 명물로 손꼽히는 겉바속촉 식감의 정통 오코노미야키입니다.",
    address: "일본 오사카부 오사카시",
    lat: 34.6657,
    lng: 135.5033,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1617196034183-421b4917c92b?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 13,
    name: "카니도라쿠 (Kani Doraku)",
    category: "게 요리",
    rating: 4.5,
    description: "도톤보리의 상징적인 대게 요리 전문점으로 다양한 게 코스를 즐길 수 있습니다.",
    address: "일본 오사카부 주오구",
    lat: 34.6687,
    lng: 135.5013,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 14,
    name: "쿠시카츠 다루마",
    category: "쿠시카츠",
    rating: 4.4,
    description: "신세카이 명물, 바삭한 튀김옷과 소스가 일품인 원조 쿠시카츠 전문점입니다.",
    address: "일본 오사카부 나니와구",
    lat: 34.6506,
    lng: 135.5065,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 5,
    name: "텐푸라 마츠 (Tempura Matsu)",
    category: "교토요리",
    rating: 4.8,
    description: "강변의 정취와 함께 즐기는 창의적이고 예술적인 가이세키 코스입니다.",
    address: "일본 교토부 교토시",
    lat: 35.0083,
    lng: 135.6983,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1549438102-193c7628256a?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 4,
    name: "멘야 이노이치 하나레",
    category: "라멘",
    rating: 4.7,
    description: "교토 특유의 맑고 깊은 육수가 매력적인 프리미엄 라멘 맛집입니다.",
    address: "일본 교토부 교토시",
    lat: 35.0006,
    lng: 135.7656,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1557872242-50387cae1764?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 15,
    name: "혼케 오와리야",
    category: "소바",
    rating: 4.6,
    description: "550년 역사를 자랑하는 교토에서 가장 오래된 메밀소바 전문점입니다.",
    address: "일본 교토부 나카교구",
    lat: 35.0125,
    lng: 135.7593,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1511910849309-0dffb8785146?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 16,
    name: "기온 쿄료리 가지로",
    category: "가이세키",
    rating: 4.5,
    description: "전통 기온 거리에서 즐기는 고즈넉하고 우아한 정통 교토 요리입니다.",
    address: "일본 교토부 히가시야마구",
    lat: 35.0034,
    lng: 135.7735,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1582390142013-16786cacc45c?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 17,
    name: "이즈우 (Izuu)",
    category: "고등어스시",
    rating: 4.4,
    description: "교토 명물 사바스시(고등어 스시)의 원조격인 240년 전통의 맛집입니다.",
    address: "일본 교토부 히가시야마구",
    lat: 35.0045,
    lng: 135.7720,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 9,
    name: "요시즈카 우나기야",
    category: "장어",
    rating: 4.8,
    description: "140년 역사를 자랑하는 후쿠오카 최고의 장어구이 전문점입니다.",
    address: "일본 후쿠오카현 후쿠오카시",
    lat: 33.5910,
    lng: 130.4070,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 10,
    name: "하카타 라멘 신신 (ShinShin)",
    category: "라멘",
    rating: 4.6,
    description: "부드러운 돈코츠 육수와 얇은 면이 조화로운 후쿠오카 대표 맛집입니다.",
    address: "일본 후쿠오카현 후쿠오카시",
    lat: 33.5937,
    lng: 130.3973,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 18,
    name: "이치란 본점",
    category: "라멘",
    rating: 4.5,
    description: "전 세계적으로 유명한 돈코츠 라멘의 본고장, 후쿠오카 본점입니다.",
    address: "일본 후쿠오카현 하카타구",
    lat: 33.5932,
    lng: 130.4017,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1596733430284-f74313f8c5b0?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 19,
    name: "텐진 호르몬",
    category: "철반구이",
    rating: 4.4,
    description: "눈앞에서 구워주는 신선한 곱창과 스테이크 철판 요리 전문점입니다.",
    address: "일본 후쿠오카현 주오구",
    lat: 33.5912,
    lng: 130.3985,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1559190394-df5a28aab5c5?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 20,
    name: "미즈타키 코우류 (Koryu)",
    category: "닭한마리",
    rating: 4.5,
    description: "후쿠오카의 전통 보양식인 진한 닭 육수 전골, 미즈타키 전문점입니다.",
    address: "일본 후쿠오카현 주오구",
    lat: 33.5895,
    lng: 130.4002,
    country: '일본',
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=200&h=200"
  }

])

const countries = ['일본', '한국'] as const
const selectedCountry = ref<'한국' | '일본'>('일본')
const selectedId = ref(1)

const filteredRestaurants = computed(() => {
  const list = restaurantList.value.filter(s => s.country === selectedCountry.value)
  
  if (selectedCountry.value === '일본') {
    const regionPriority: Record<string, number> = {
      '도쿄': 1,
      '오사카': 2,
      '교토': 3,
      '후쿠오카': 4
    }

    return [...list].sort((a, b) => {
      const regionA = Object.keys(regionPriority).find(r => a.address.includes(r)) || '기타'
      const regionB = Object.keys(regionPriority).find(r => b.address.includes(r)) || '기타'
      
      const priorityA = regionPriority[regionA] || 99
      const priorityB = regionPriority[regionB] || 99

      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }
      return b.rating - a.rating
    })
  }
  
  return list
})

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
  
  // Reset scroll position to top on tab change
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
}

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

const handleResize = () => {
  const prevWidth = windowWidth.value
  windowWidth.value = window.innerWidth
  
  // Transition from Desktop to Mobile
  if (prevWidth >= 1024 && windowWidth.value < 1024) {
    sheetMode.value = 'half'
    // 1. 우선 시트를 화면 아래(바닥)로 즉시 강제 이동 (트랜지션 없이)
    isDragging.value = true
    dragTranslateY.value = window.innerHeight 
    
    // 2. 브라우저가 바닥 위치를 인식할 수 있도록 아주 짧은 지연 후 트랜지션 활성화
    setTimeout(() => {
      isDragging.value = false
      dragTranslateY.value = getModeOffset('half')
    }, 20)
  } else if (!isDragging.value) {
    dragTranslateY.value = getModeOffset(sheetMode.value)
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize() // Sync state immediately
  
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
const isHandleInteraction = ref(false)
const dragTranslateY = ref(0)

// Desktop Drag-to-Scroll State
const isMouseDragging = ref(false)
const mouseStartY = ref(0)
const mouseScrollTop = ref(0)
const hasMoved = ref(false)

// Momentum (Sliding) State
const mouseVelocity = ref(0)
const lastMouseY = ref(0)
const lastTimestamp = ref(0)
let momentumRafId: number | null = null

const getModeOffset = (mode: SheetMode) => {
  const containerHeight = window.innerHeight
  if (mode === 'collapsed') return containerHeight - 85
  if (mode === 'half') return containerHeight * 0.6 // 2/5 visible = 60% offset
  return 120 // Stop 120px from top
}

const handlePointerDown = (e: PointerEvent) => {
  if (window.innerWidth >= 1024) return
  
  startY.value = e.clientY
  isDragging.value = false
  dragTranslateY.value = getModeOffset(sheetMode.value)
  
  // Detect if the interaction started on the handle or tabs area (~100px)
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  isHandleInteraction.value = (e.clientY - rect.top) <= 100
  
  window.addEventListener('pointermove', handlePointerMove, { passive: false })
  window.addEventListener('pointerup', handlePointerUp)
}

const handlePointerMove = (e: PointerEvent) => {
  if (window.innerWidth >= 1024) return
  e.stopPropagation()

  const deltaY = e.clientY - startY.value
  const scrollTop = scrollContainer.value?.scrollTop || 0
  
  if (!isDragging.value && Math.abs(deltaY) > 8) {
    const atTop = scrollTop <= 5 
    const isSwipingDown = deltaY > 0
    const isSwipingUp = deltaY < 0
    
    // Allow dragging if pulling from handle OR at top & pulling down OR not full & pulling up
    if (isHandleInteraction.value || (isSwipingDown && atTop) || (isSwipingUp && sheetMode.value !== 'full')) {
      isDragging.value = true
      startY.value = e.clientY - getModeOffset(sheetMode.value)
    }
  }

  if (isDragging.value) {
    let newPos = e.clientY - startY.value
    if (newPos < 120) newPos = 120
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
const applyMomentum = () => {
  const container = scrollContainer.value
  if (!container || Math.abs(mouseVelocity.value) < 0.1) return
  
  container.scrollTop -= mouseVelocity.value
  mouseVelocity.value *= 0.95 // Friction factor
  
  momentumRafId = requestAnimationFrame(applyMomentum)
}

const onMouseDrag = (e: MouseEvent) => {
  if (!isMouseDragging.value || isDragging.value) return
  const container = scrollContainer.value
  if (!container) return
  
  const currentTimestamp = performance.now()
  const deltaY = e.clientY - mouseStartY.value
  const deltaTime = currentTimestamp - lastTimestamp.value
  
  if (Math.abs(deltaY) > 5) {
    hasMoved.value = true
    container.scrollTop = mouseScrollTop.value - deltaY
    
    // Calculate velocity (px per frame roughly)
    if (deltaTime > 0) {
      mouseVelocity.value = (e.clientY - lastMouseY.value)
    }
    
    if (e.cancelable) e.preventDefault()
  }
  
  lastMouseY.value = e.clientY
  lastTimestamp.value = currentTimestamp
}

const startMouseDrag = (e: MouseEvent) => {
  const container = scrollContainer.value
  if (!container) return
  
  if (e.button !== 0) return
  if (isDragging.value) return
  
  // Cancel previous momentum
  if (momentumRafId) {
    cancelAnimationFrame(momentumRafId)
    momentumRafId = null
  }
  
  isMouseDragging.value = true
  mouseStartY.value = e.clientY
  mouseScrollTop.value = container.scrollTop
  lastMouseY.value = e.clientY
  lastTimestamp.value = performance.now()
  mouseVelocity.value = 0
  hasMoved.value = false
  
  window.addEventListener('mousemove', onMouseDrag, { passive: false })
  window.addEventListener('mouseup', stopMouseDrag)
}

const stopMouseDrag = () => {
  isMouseDragging.value = false
  window.removeEventListener('mousemove', onMouseDrag)
  window.removeEventListener('mouseup', stopMouseDrag)
  
  // Start sliding effect
  if (hasMoved.value) {
    applyMomentum()
  }
}

const handleShopSelect = async (shop: Shop) => {
  // Prevent selection if mouse was dragging on desktop
  // If we moved significantly, ignore this click
  if (window.innerWidth >= 1024 && hasMoved.value) {
    // Reset for next click attempt
    hasMoved.value = false
    return
  }
  
  selectedId.value = shop.id
  
  if (window.innerWidth < 1024) {
    sheetMode.value = 'half'
    
    await nextTick()
    const container = scrollContainer.value
    if (container) {
      const selectedElement = container.querySelector(`[data-id="${shop.id}"]`) as HTMLElement
      if (selectedElement) {
        container.scrollTo({
          top: selectedElement.offsetTop - 8,
          behavior: 'smooth'
        })
      }
    }
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

/* Prevent child interaction during desktop mouse drag scroll */
.dragging-active * {
  pointer-events: none !important;
}
</style>
