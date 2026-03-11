<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-[#131313] text-zinc-900 dark:text-white transition-colors duration-200">
    <SiteNavbar :is-sheet-full="false" />
    
    <main class="relative w-full h-[100svh] overflow-hidden bg-zinc-100 dark:bg-[#131313] touch-none overscroll-none">
      <div 
        class="absolute top-[60px] left-0 right-0 bottom-0 z-10"
      >
        <transition name="fade" mode="out-in">
          <div v-if="selectedCountry === '한국'" id="naver-map" class="w-full h-full bg-zinc-100 dark:bg-zinc-800"></div>
          <iframe
            v-else-if="selectedCountry === '일본'"
            :key="mapUrl"
            class="w-full h-full border-0 google-map-iframe"
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
            class="fixed lg:relative inset-x-0 top-0 lg:inset-auto lg:top-0 lg:right-0 z-[60] lg:z-30 w-full lg:w-[400px] h-[100svh] lg:h-[calc(100vh-100px)] pointer-events-auto bg-zinc-50 dark:bg-[#131313] shadow-2xl rounded-t-[32px] lg:rounded-3xl transition-transform duration-500 ease-in-out transform touch-none select-none flex flex-col"
            :class="[
              sheetMode === 'collapsed' && !isDragging ? 'translate-y-[calc(100svh-85px)]' : '',
              sheetMode === 'half' && !isDragging ? 'translate-y-[60svh]' : '',
              sheetMode === 'full' && !isDragging ? 'translate-y-[120px]' : '',
              windowWidth >= 1024 ? '!translate-y-0' : ''
            ]"
            :style="isDragging ? { transform: `translateY(${dragTranslateY}px)`, transition: 'none' } : {}"
            @pointerdown="handlePointerDown"
            @mouseleave="() => { stopMouseDrag(); stopRegionDrag(); }"
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

            <!-- Fixed Header Area: Region Tabs (Horizontal Scroll) -->
            <div 
              ref="regionContainer"
              class="shrink-0 px-6 lg:px-5 pb-5 pt-0 flex gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto" 
              @pointerdown.stop
              @mousedown="startRegionDrag"
            >
              <button 
                v-for="region in regionsByCountry[selectedCountry]" 
                :key="region"
                :data-region="region"
                @click="selectRegion(region)"
                class="shrink-0 px-3 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 border whitespace-nowrap"
                :class="selectedRegion === region 
                  ? 'bg-[#1a73e8] border-[#1a73e8] text-white' 
                  : 'bg-transparent border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'"
              >
                {{ region }} <span class="ml-0.5 opacity-60 text-[11px] font-medium">{{ getRegionCount(region) }}</span>
              </button>
            </div>

            <!-- Bottom Extension to prevent holes during over-drag (Moved outside scroll area) -->
            <div class="lg:hidden absolute top-[100%] left-0 right-0 h-[2000px] bg-zinc-50 dark:bg-[#131313] z-[-1] pointer-events-none"></div>

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
              <div 
                v-for="shop in filteredRestaurants" 
                :key="shop.id"
                :data-id="shop.id"
                @click="handleShopSelect(shop)"
                class="p-4 rounded-2xl transition-all duration-300 cursor-pointer group border"
                :class="selectedId === shop.id 
                  ? 'bg-white dark:bg-[#2a2a2a] border-[#1a73e8]' 
                  : 'bg-white dark:bg-[#1f1f1f] border-zinc-200 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-[#252525]'"
              >
                <div class="min-w-0">
                  <div class="flex justify-between items-center mb-1.5">
                    <span class="px-1.5 py-1 inline-flex items-center rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/5 leading-none">
                      {{ shop.category }}
                    </span>
                    <span class="text-[11px] font-bold text-[#1a73e8]">★ {{ shop.rating }}</span>
                  </div>
                  <h3 
                    class="text-base font-bold mb-0.5 group-hover:text-[#1a73e8] transition-colors line-clamp-1"
                    :class="{ 'text-[#1a73e8]': selectedId === shop.id }"
                  >
                    {{ shop.name }}
                  </h3>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">{{ shop.description }}</p>
                  <div class="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-tight">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ shop.address }}
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
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
  // --- 한국 맛집 리스트 (서울, 부산, 제주, 경주, 전주, 강원 등) ---
  // [서울] --------------------------------------------------
  { id: 104, name: "황생가칼국수", category: "칼국수", rating: 4.5, description: "북촌의 자부심, 깊은 사골 육수로 맛을 낸 정성 가득한 칼국수와 만두입니다.", address: "서울특별시 종로구 소격동", lat: 37.5801, lng: 126.9814, country: '한국' },
  { id: 105, name: "자하손만두", category: "만두", rating: 4.4, description: "부암동 산비탈에서 즐기는 정갈하고 담백한 개성식 손만두 전문점입니다.", address: "서울특별시 종로구 부암동", lat: 37.5936, lng: 126.9658, country: '한국' },
  { id: 106, name: "토속촌 삼계탕", category: "삼계탕", rating: 4.3, description: "경복궁 옆, 견과류가 들어간 진한 국물의 원조 삼계탕 맛집입니다.", address: "서울특별시 종로구 체부동", lat: 37.5776, lng: 126.9717, country: '한국' },
  { id: 102, name: "우래옥", category: "냉면/불고기", rating: 4.7, description: "70년 전통의 평양냉면과 불고기 명가, 명실상부 서울 최고의 노포입니다.", address: "서울특별시 중구 주교동", lat: 37.5683, lng: 126.9995, country: '한국' },
  { id: 107, name: "명동교자", category: "칼국수", rating: 4.6, description: "명동의 랜드마크, 진한 닭 육수와 부드러운 만두가 어우러진 맛의 명소입니다.", address: "서울특별시 중구 명동", lat: 37.5625, lng: 126.9856, country: '한국' },
  { id: 108, name: "하동관", category: "곰탕", rating: 4.4, description: "1939년부터 이어온, 맑고 깊은 국물 맛이 일품인 대표 곰탕집입니다.", address: "서울특별시 중구 명동", lat: 37.5668, lng: 126.9840, country: '한국' },
  { id: 109, name: "진주회관", category: "콩국수", rating: 4.5, description: "여름철 필수 코스, 걸쭉하고 진한 맛의 냉콩국수로 전국적인 명성을 가진 곳입니다.", address: "서울특별시 중구 서소문동", lat: 37.5623, lng: 126.9754, country: '한국' },
  { id: 110, name: "오레노라멘", category: "라멘", rating: 4.7, description: "진한 닭 육수의 토리파이탄 라멘으로 사랑받는 미쉐린 가이드 선정 맛집입니다.", address: "서울특별시 용산구 이태원동", lat: 37.5401, lng: 126.9922, country: '한국' },
  { id: 112, name: "부자피자", category: "화덕피자", rating: 4.4, description: "한남동에서 즐기는 정통 이탈리안 화덕피자, 신선한 재료 본연의 맛을 살립니다.", address: "서울특별시 용산구 한남동", lat: 37.5388, lng: 127.0012, country: '한국' },
  { id: 113, name: "정식당", category: "파인 다이닝", rating: 4.9, description: "뉴욕과 서울을 잇는 뉴 코리안 퀴진의 선구자, 독창적인 메뉴를 선보입니다.", address: "서울특별시 강남구 청담동", lat: 37.5255, lng: 127.0407, country: '한국' },
  { id: 115, name: "진미평양냉면", category: "냉면", rating: 4.6, description: "강남권 평양냉면의 신흥 강자, 깔끔한 육수와 제육의 조화가 완벽합니다.", address: "서울특별시 강남구 논현동", lat: 37.5161, lng: 127.0360, country: '한국' },
  { id: 118, name: "옥동식", category: "돼지곰탕", rating: 4.7, description: "맑은 국물의 돼지곰탕이라는 새로운 장르를 개척한 미쉐린 선정 맛집입니다.", address: "서울특별시 마포구 서교동", lat: 37.5507, lng: 126.9145, country: '한국' },
  
  // [부산] --------------------------------------------------
  { id: 201, name: "양산왕돼지국밥", category: "돼지국밥", rating: 4.5, description: "진하고 뽀얀 사골 국물과 부드러운 수육의 조화가 일품인 부산의 대표 국밥 전문점입니다.", address: "부산광역시 해운대구 재송동", lat: 35.1912, lng: 129.1235, country: '한국' },
  { id: 202, name: "신발원", category: "만두", rating: 4.1, description: "백종원의 3대천왕 출연, 70년 전통의 수제 만두와 공갈빵이 유명한 곳입니다.", address: "부산광역시 동구 초량동", lat: 35.1223, lng: 129.0410, country: '한국' },
  { id: 203, name: "금수복국", category: "복어", rating: 4.4, description: "1970년부터 이어진 해운대의 상징, 시원한 복국과 다양한 복어 요리를 제공합니다.", address: "부산광역시 해운대구 중동", lat: 35.1636, lng: 129.1764, country: '한국' },
  { id: 204, name: "이재모피자", category: "피자", rating: 4.5, description: "부산 현지인들의 인생 피자집, 아낌없이 들어간 치즈와 담백한 도우가 특징입니다.", address: "부산광역시 중구 신창동1가", lat: 35.1021, lng: 129.0315, country: '한국' },
  { id: 205, name: "상국이네", category: "분식", rating: 4.2, description: "해운대 시장의 명물, 걸쭉하고 매콤한 떡볶이와 바삭한 튀김이 일품입니다.", address: "부산광역시 해운대구 중동", lat: 35.1615, lng: 129.1634, country: '한국' },
  { id: 206, name: "개미집 본점", category: "낙곱새", rating: 4.1, description: "부산 해운대의 줄 서서 먹는 맛집, 중독성 강한 매콤한 낙곱새 볶음 전문점입니다.", address: "부산광역시 해운대구 우동", lat: 35.1587, lng: 129.1598, country: '한국' },

  // [제주] --------------------------------------------------
  { id: 301, name: "숙성도 함덕점", category: "흑돼지", rating: 4.7, description: "제주 흑돼지의 정점, 드라이에이징으로 깊은 맛을 낸 숙성 고기를 선보입니다.", address: "제주특별자치도 제주시 조천읍", lat: 33.5435, lng: 126.6690, country: '한국' },
  { id: 302, name: "명진전복", category: "전복", rating: 4.4, description: "구좌 해안가 위치, 고소한 전복 돌솥밥과 구이가 유명한 제주의 줄 서는 맛집입니다.", address: "제주특별자치도 제주시 구좌읍", lat: 33.5352, lng: 126.8524, country: '한국' },
  { id: 303, name: "자매국수", category: "고기국수", rating: 4.1, description: "제주 고기국수 거리의 대표 주자, 진한 사골 육수에 큼직한 수육이 올라갑니다.", address: "제주특별자치도 제주시 삼도이동", lat: 33.5182, lng: 126.5414, country: '한국' },
  { id: 304, name: "우진해장국", category: "해장국", rating: 4.3, description: "제주식 고사리 해장국으로 유명한 곳, 걸쭉하고 구수한 맛이 독특한 별미입니다.", address: "제주특별자치도 제주시 삼도이동", lat: 33.5115, lng: 126.5201, country: '한국' },
  { id: 305, name: "연돈", category: "돈카츠", rating: 4.6, description: "백종원의 골목식당 출연, 정성껏 튀겨낸 완벽한 식감의 수제 돈카츠 전문점입니다.", address: "제주특별자치도 서귀포시 색달동", lat: 33.2548, lng: 126.4055, country: '한국' },
  { id: 306, name: "올래국수", category: "고기국수", rating: 4.4, description: "제주 공항 인근, 담백하고 깔끔한 육수 맛으로 수많은 단골을 보유한 국수집입니다.", address: "제주특별자치도 제주시 연동", lat: 33.4915, lng: 126.4955, country: '한국' },

  // [경주/전주] ----------------------------------------------
  { id: 401, name: "함양집", category: "한우물회", rating: 4.3, description: "90년 전통, 경주를 대표하는 시원하고 매콤한 한우물회가 유명한 노포입니다.", address: "경상북도 경주시 북군동", lat: 35.8415, lng: 129.2155, country: '한국' },
  { id: 402, name: "교리김밥", category: "분식", rating: 4.0, description: "경주의 명물 달걀 김밥, 폭신한 달걀 지단이 가득 들어가 담백한 맛이 일품입니다.", address: "경상북도 경주시 탑동", lat: 35.8295, lng: 129.2155, country: '한국' },
  { id: 501, name: "한국집", category: "비빔밥", rating: 4.2, description: "1952년 창업, 전주 비빔밥의 원조로 불리는 정갈하고 깊은 맛의 맛집입니다.", address: "전북특별자치도 전주시 완산구", lat: 35.8165, lng: 127.1475, country: '한국' },
  { id: 502, name: "베테랑칼국수", category: "칼국수", rating: 4.1, description: "전주 한옥마을의 명물, 들깨가루와 가득한 계란이 어우러진 걸쭉한 칼국수입니다.", address: "전북특별자치도 전주시 완산구", lat: 35.8145, lng: 127.1515, country: '한국' },
  { id: 503, name: "삼백집", category: "콩나물국밥", rating: 4.1, description: "하루 삼백 그릇만 판다는 정신으로 시작된, 전주 정통 콩나물 국밥 명소입니다.", address: "전북특별자치도 전주시 완산구", lat: 35.8185, lng: 127.1425, country: '한국' },

  // [강원] --------------------------------------------------
  { id: 601, name: "봉포머구리집", category: "물회", rating: 4.2, description: "속초 바다가 한눈에 보이는 곳에서 즐기는 신선하고 푸짐한 제철 물회입니다.", address: "강원특별자치도 속초시 영랑동", lat: 38.2255, lng: 128.5875, country: '한국' },
  { id: 602, name: "동화가든", category: "짬뽕순두부", rating: 4.3, description: "강릉 초당두부 마을의 명소, 불맛 나는 짬뽕과 부드러운 순두부의 환상적인 만남입니다.", address: "강원특별자치도 강릉시 초당동", lat: 37.7915, lng: 128.9165, country: '한국' },
  { id: 603, name: "엄지네포장마차", category: "꼬막비빔밥", rating: 4.3, description: "강릉 꼬막비빔밥 열풍의 주역, 짭쪼름한 양념과 신선한 꼬막이 어우러진 별미입니다.", address: "강원특별자치도 강릉시 포남동", lat: 37.7655, lng: 128.9085, country: '한국' },

  // --- 일본 맛집 리스트 (도쿄, 오사카, 교토, 후쿠오카, 삿포로, 요코하마, 나고야) ---
  { id: 1001, name: "타치구이 아키라", category: "스시", rating: 4.9, description: "신선한 네타와 정교한 샤리가 일품인 서서 먹는 정통 스시 바입니다.", address: "일본 도쿄 미나토구", lat: 35.6662, lng: 139.7583, country: '일본' },
  { id: 1002, name: "긴자 이부키", category: "가이세키", rating: 4.8, description: "긴자의 품격이 느껴지는 제철 식재료 중심의 고급 가이세키 요리입니다.", address: "일본 도쿄 주오구", lat: 35.6720, lng: 139.7710, country: '일본' },
  { id: 1003, name: "텐푸라 미카쿠", category: "텐푸라", rating: 4.7, description: "1931년 창업, 장인의 손길로 튀겨낸 바삭하고 정갈한 텐푸라 전문점입니다.", address: "일본 도쿄 미나토구", lat: 35.6694, lng: 139.7523, country: '일본' },
  { id: 1004, name: "로쿠린샤", category: "츠케멘", rating: 4.6, description: "도쿄역 캐릭터 스트리트의 명물, 진한 육수의 츠케멘 전문점입니다.", address: "일본 도쿄 지요다구", lat: 35.6814, lng: 139.7677, country: '일본' },
  { id: 1005, name: "이마한", category: "스키야키", rating: 4.8, description: "100년 넘는 역사를 가진 최고급 쿠로게와규 스키야키 전문점입니다.", address: "일본 도쿄 니혼바시", lat: 35.6853, lng: 139.7820, country: '일본' },
  { id: 1006, name: "우시하치 키와미", category: "와규", rating: 4.6, description: "시부야 스트리트 전망과 함께 즐기는 프리미엄 와규 야키니쿠입니다.", address: "일본 도쿄 시부야", lat: 35.6595, lng: 139.7005, country: '일본' },
  { id: 1007, name: "피자 스트라다", category: "피자", rating: 4.5, description: "아자부주반의 세계적인 수준으로 평가받는 화덕 피자 맛집입니다.", address: "일본 도쿄 아자부주반", lat: 35.6548, lng: 139.7345, country: '일본' },
  { id: 1008, name: "스시 코시카와", category: "스시", rating: 4.7, description: "아카사카의 고즈넉한 분위기에서 즐기는 정통 오마카세 스시입니다.", address: "일본 도쿄 아카사카", lat: 35.6710, lng: 139.7360, country: '일본' },
  { id: 1009, name: "우동 야마초", category: "우동", rating: 4.4, description: "에비수의 세련된 디자인 공간에서 즐기는 쫄깃하고 담백한 우동입니다.", address: "일본 도쿄 에비수", lat: 35.6468, lng: 139.7118, country: '일본' },
  { id: 1010, name: "세잔 (Sezanne)", category: "프렌치", rating: 4.8, description: "포시즌스 호텔의 미쉐린 3스타, 창의적이고 감각적인 모던 프렌치입니다.", address: "일본 도쿄 마루노우치", lat: 35.6792, lng: 139.7678, country: '일본' },

  { id: 1011, name: "나카타니", category: "스시", rating: 4.8, description: "오사카 호젠지 골목의 정취를 담은 미쉐린 스타 정통 스시야입니다.", address: "일본 오사카 도톤보리", lat: 34.6675, lng: 135.5028, country: '일본' },
  { id: 1012, name: "이자카야 토요", category: "해산물", rating: 4.7, description: "넷플릭스 출연으로 화제가 된, 활기찬 분위기의 노천 해산물 식당입니다.", address: "일본 오사카 미야코지마", lat: 34.6980, lng: 135.5348, country: '일본' },
  { id: 1013, name: "후쿠타로", category: "오코노미야키", rating: 4.6, description: "오사카 3대 명물로 손꼽히는 겉바속촉 식감의 정통 오코노미야키입니다.", address: "일본 오사카 난바", lat: 34.6657, lng: 135.5033, country: '일본' },
  { id: 1014, name: "카니도라쿠", category: "게 요리", rating: 4.5, description: "도톤보리의 상징적인 대게 요리 전문점으로 다양한 게 코스를 즐길 수 있습니다.", address: "일본 오사카 주오구", lat: 34.6687, lng: 135.5013, country: '일본' },
  { id: 1015, name: "쿠시카츠 다루마", category: "쿠시카츠", rating: 4.4, description: "신세카이 명물, 바삭한 튀김옷과 비법 소스가 일품인 쿠시카츠 전문점입니다.", address: "일본 오사카 나니와구", lat: 34.6506, lng: 135.5065, country: '일본' },
  { id: 1016, name: "와규 캇포 토라이치", category: "와규", rating: 4.7, description: "엄선된 최고급 와규를 장인의 손길로 풀어낸 캇포 요리 전문점입니다.", address: "일본 오사카 신사이바시", lat: 34.6715, lng: 135.5011, country: '일본' },
  { id: 1017, name: "지분도키", category: "오코노미야키", rating: 4.7, description: "미쉐린 빕 구르망에 선정된, 독창적이고 섬세한 철판 요리를 선보입니다.", address: "일본 오사카 혼마치", lat: 34.6823, lng: 135.4985, country: '일본' },
  { id: 1018, name: "라멘 촌마게", category: "라멘", rating: 4.5, description: "깔끔하고 깊은 맛의 시오 라멘과 바삭한 가라아게가 유명한 맛집입니다.", address: "일본 오사카 텐쿠", lat: 34.7088, lng: 135.5135, country: '일본' },
  { id: 1019, name: "토미타 규카츠", category: "규카츠", rating: 4.5, description: "부드러운 식감과 풍부한 육즙으로 긴 대기줄을 자랑하는 규카츠 명소입니다.", address: "일본 오사카 난바", lat: 34.6650, lng: 135.5015, country: '일본' },
  { id: 1020, name: "야에카츠", category: "쿠시카츠", rating: 4.5, description: "장인의 정성이 담긴 튀김 기술로 신세카이를 사로잡은 쿠시카츠 전문점입니다.", address: "일본 오사카 신세카이", lat: 34.6515, lng: 135.5055, country: '일본' },

  { id: 1021, name: "텐푸라 마츠", category: "교토요리", rating: 4.8, description: "가츠라 강변의 정취와 함께 즐기는 창의적이고 예술적인 가이세키입니다.", address: "일본 교토 우쿄구", lat: 35.0083, lng: 135.6983, country: '일본' },
  { id: 1022, name: "멘야 이노이치", category: "라멘", rating: 4.7, description: "교토 특유의 맑고 깊은 가다랑어 육수가 매력적인 프리미엄 라멘입니다.", address: "일본 교토 시모교구", lat: 35.0006, lng: 135.7656, country: '일본' },
  { id: 1023, name: "혼케 오와리야", category: "소바", rating: 4.6, description: "550년 역사를 자랑하는 교토에서 가장 오래된 전통의 메밀소바 전문점입니다.", address: "일본 교토 나카교구", lat: 35.0125, lng: 135.7593, country: '일본' },
  { id: 1024, name: "기온 카지로", category: "가이세키", rating: 4.5, description: "전통이 살아있는 기온 거리에서 즐기는 우아하고 고즈넉한 교토 요리입니다.", address: "일본 교토 히가시야마", lat: 35.0034, lng: 135.7735, country: '일본' },
  { id: 1025, name: "이즈우", category: "고등어스시", rating: 4.4, description: "교토 명물 사바스시(고등어 스시)의 원조격인 240년 전통의 노포 맛집입니다.", address: "일본 교토 히가시야마", lat: 35.0045, lng: 135.7720, country: '일본' },
  { id: 1026, name: "카츠쿠라", category: "돈카츠", rating: 4.6, description: "교토역 포르타에서 맛보는 바삭한 튀김옷과 엄선된 돼지고기의 돈카츠입니다.", address: "일본 교토역 포르타", lat: 34.9855, lng: 135.7585, country: '일본' },
  { id: 1027, name: "토쿠라 함바그", category: "함바그", rating: 4.5, description: "나이프를 대는 순간 육즙이 터져 나오는 교토의 줄 서는 함바그 맛집입니다.", address: "일본 교토 산조", lat: 35.0088, lng: 135.7612, country: '일본' },
  { id: 1028, name: "카라세미테이", category: "돈카츠", rating: 4.7, description: "정성스럽게 튀겨낸 두툼하고 부드러운 안심 돈카츠가 일품인 곳입니다.", address: "일본 교토 가와라마치", lat: 35.0042, lng: 135.7685, country: '일본' },
  { id: 1029, name: "혼케 다이이치아사히", category: "라멘", rating: 4.6, description: "교토 라멘의 정석으로 불리는, 이른 아침부터 줄 서는 노포 라멘집입니다.", address: "일본 교토역 근처", lat: 34.9875, lng: 135.7615, country: '일본' },
  { id: 1030, name: "키쿠노이 혼텐", category: "가이세키", rating: 4.9, description: "미쉐린 3스타를 유지해온, 일본 가이세키 요리의 정점으로 평가받는 곳입니다.", address: "일본 교토 히가시야마", lat: 34.9995, lng: 135.7825, country: '일본' },

  { id: 1031, name: "요시즈카 우나기야", category: "장어", rating: 4.8, description: "140년 역사를 자랑하는 후쿠오카 최고의 장어구이 전문점입니다.", address: "일본 후쿠오카 하카타", lat: 33.5910, lng: 130.4070, country: '일본' },
  { id: 1032, name: "하카타 라멘 신신", category: "라멘", rating: 4.6, description: "부드러운 돈코츠 육수와 얇은 면이 조화로운 후쿠오카 대표 맛집입니다.", address: "일본 후쿠오카 텐진", lat: 33.5937, lng: 130.3973, country: '일본' },
  { id: 1033, name: "이치란 본점", category: "라멘", rating: 4.5, description: "전 세계적으로 유명한 돈코츠 라멘의 본고장, 후쿠오카 본점입니다.", address: "일본 후쿠오카 나카스", lat: 33.5932, lng: 130.4017, country: '일본' },
  { id: 1034, name: "텐진 호르몬", category: "철판구이", rating: 4.4, description: "눈앞에서 구워주는 신선한 곱창과 스테이크 철판 요리 전문점입니다.", address: "일본 후쿠오카 텐진", lat: 33.5912, lng: 130.3985, country: '일본' },
  { id: 1035, name: "미즈타키 코류", category: "닭요리", rating: 4.5, description: "후쿠오카의 전통 보양식인 진한 닭 육수 전골, 미즈타키 전문점입니다.", address: "일본 후쿠오카 주오구", lat: 33.5895, lng: 130.4002, country: '일본' },
  { id: 1036, name: "하카타 잇소우", category: "라멘", rating: 4.6, description: "진하고 구수한 돈코츠 거품이 매력적인 후쿠오카의 신흥 라멘 강자입니다.", address: "일본 후쿠오카 하카타", lat: 33.5898, lng: 130.4195, country: '일본' },
  { id: 1037, name: "스시 카라시마", category: "스시", rating: 4.7, description: "후쿠오카의 품격 있는 하이엔드 스시 오마카세를 정성껏 제공합니다.", address: "일본 후쿠오카 주오구", lat: 33.5875, lng: 130.3950, country: '일본' },
  { id: 1038, name: "치카에 (Chikae)", category: "해산물", rating: 4.3, description: "대형 수조가 있는 웅장한 공간에서 즐기는 신선한 해산물 정찬입니다.", address: "일본 후쿠오카 다이묘", lat: 33.5888, lng: 130.3945, country: '일본' },
  { id: 1039, name: "야마나카 아카사카", category: "모츠나베", rating: 4.5, description: "후쿠오카의 대표 향토 요리인 모츠나베를 가장 고급스럽게 풀어낸 곳입니다.", address: "일본 후쿠오카 아카사카", lat: 33.5878, lng: 130.3925, country: '일본' },
  { id: 1040, name: "후쿠짱 라멘", category: "라멘", rating: 4.7, description: "현지인들이 입을 모아 추천하는, 오랜 전통의 깊은 맛을 간직한 라멘집입니다.", address: "일본 후쿠오카 무로미", lat: 33.5815, lng: 130.3345, country: '일본' },

  { id: 1041, name: "니조 시장 오이소", category: "해산물", rating: 4.0, description: "신선한 홋카이도 해산물 덮밥 전문점입니다.", address: "일본 삿포로 주오구", lat: 43.0592, lng: 141.3562, country: '일본' },
  { id: 1042, name: "파르페 사토", category: "디저트", rating: 4.2, description: "삿포로의 밤을 장식하는 시메 파르페입니다.", address: "일본 삿포로 주오구", lat: 43.0565, lng: 141.3540, country: '일본' },
  { id: 1043, name: "다루마", category: "양고기", rating: 4.4, description: "삿포로 특산 징기스칸 양고기 구이입니다.", address: "일본 삿포로 스스키노", lat: 43.0545, lng: 141.3525, country: '일본' },
  { id: 1044, name: "멘야 유키카제", category: "라멘", rating: 4.5, description: "삿포로 최고의 미소 라멘을 맛보는 곳입니다.", address: "일본 삿포로 스스키노", lat: 43.0538, lng: 141.3533, country: '일본' },
  { id: 1045, name: "수프카레 킹", category: "카레", rating: 4.3, description: "진하고 깊은 맛의 삿포로 수프 카레입니다.", address: "일본 삿포로 주오구", lat: 43.0585, lng: 141.3510, country: '일본' },
  { id: 1046, name: "네무로 하나마루", category: "스시", rating: 4.6, description: "신선한 우라카와산 식재료 사용 스시 바입니다.", address: "일본 삿포로역 근처", lat: 43.0685, lng: 141.3505, country: '일본' },
  { id: 1047, name: "야키니쿠 후도", category: "야키니쿠", rating: 4.5, description: "엄선된 홋카이도산 고기 구이 전문점입니다.", address: "일본 삿포로 주오구", lat: 43.0615, lng: 141.3385, country: '일본' },
  { id: 1048, name: "코노요시", category: "경양식", rating: 4.4, description: "부드럽고 육즙 가득한 수제 함바그입니다.", address: "일본 삿포로 기타구", lat: 43.0815, lng: 141.3485, country: '일본' },
  { id: 1049, name: "카니 혼케", category: "게 요리", rating: 4.3, description: "웅장한 분위기에서 즐기는 삿포로 대게입니다.", address: "일본 삿포로 기타구", lat: 43.0665, lng: 141.3515, country: '일본' },
  { id: 1050, name: "라멘 신게츠", category: "라멘", rating: 4.4, description: "심야에도 줄 서는 스스키노 소금 라멘입니다.", address: "일본 삿포로 스스키노", lat: 43.0552, lng: 141.3518, country: '일본' },

  { id: 1051, name: "덤보 피자 팩토리", category: "피자", rating: 4.3, description: "요코하마 항구 근처 세련된 피자 펍입니다.", address: "일본 요코하마 니시구", lat: 35.4655, lng: 139.6225, country: '일본' },
  { id: 1052, name: "만친로 (Manchinro)", category: "중식", rating: 4.4, description: "요코하마 차이나타운의 정통 광동 요리입니다.", address: "일본 요코하마 차이나타운", lat: 35.4418, lng: 139.6455, country: '일본' },
  { id: 1053, name: "카페 토스카", category: "뷔페", rating: 4.3, description: "바다 전망과 함께 즐기는 올 데이 뷔페입니다.", address: "일본 요코하마 미나토미라이", lat: 35.4578, lng: 139.6345, country: '일본' },
  { id: 1054, name: "트라토리아 비콜로레", category: "이탈리안", rating: 4.5, description: "요코하마에서 가장 유명한 이탈리안입니다.", address: "일본 요코하마 니시구", lat: 35.4628, lng: 139.6185, country: '일본' },
  { id: 1055, name: "야케 페판야키", category: "철판구이", rating: 4.6, description: "야경과 함께 즐기는 고품격 데판야키입니다.", address: "일본 요코하마 니시구", lat: 35.4635, lng: 139.6215, country: '일본' },
  { id: 1056, name: "스시 나노우미", category: "스시", rating: 4.5, description: "에도마에 스타일의 정성스러운 스시 코스입니다.", address: "일본 요코하마 카나가와구", lat: 35.4715, lng: 139.6315, country: '일본' },
  { id: 1057, name: "요코하마 야키니쿠 킨탄", category: "야키니쿠", rating: 4.4, description: "최고급 와규와 함께 프라이빗한 다이닝입니다.", address: "일본 요코하마 니시구", lat: 35.4645, lng: 139.6235, country: '일본' },
  { id: 1058, name: "킹 아리스 요코하마", category: "프렌치", rating: 4.4, description: "호화로운 분위기의 정통 프렌치 레스토랑입니다.", address: "일본 요코하마 베이 호텔", lat: 35.4585, lng: 139.6355, country: '일본' },
  { id: 1059, name: "니혼슈 오하코", category: "이자카야", rating: 4.2, description: "다양한 사케와 로컬 안주가 맛있는 곳입니다.", address: "일본 요코하마 혼텐", lat: 35.4615, lng: 139.6210, country: '일본' },
  { id: 1060, name: "테이엔", category: "일식", rating: 4.3, description: "계절감이 살아있는 정갈한 일본 정식입니다.", address: "일본 요코하마 니시구", lat: 35.4658, lng: 139.6220, country: '일본' },

  { id: 1061, name: "아츠타 호라이켄", category: "장어덮밥", rating: 4.7, description: "나고야 명물 히츠마부시의 원조집입니다.", address: "일본 나고야 아츠타구", lat: 35.1265, lng: 136.9065, country: '일본' },
  { id: 1062, name: "야바톤", category: "미소카츠", rating: 4.5, description: "나고야의 대표 소울 푸드, 된장 돈카츠입니다.", address: "일본 나고야 나카구", lat: 35.1610, lng: 136.9075, country: '일본' },
  { id: 1063, name: "야마모토야", category: "우동", rating: 4.4, description: "진한 된장 국물의 미소 니코미 우동입니다.", address: "일본 나고야 나카구", lat: 35.1655, lng: 136.9085, country: '일본' },
  { id: 1064, name: "마루야 혼텐", category: "장어덮밥", rating: 4.6, description: "예술적인 굽기의 히츠마부시 전문점입니다.", address: "일본 나고야역 메이테츠", lat: 35.1705, lng: 136.8845, country: '일본' },
  { id: 1065, name: "카와분 (Kawabun)", category: "일식", rating: 4.5, description: "수백 년 역사를 가진 나고야 정통 요리입니다.", address: "일본 나고야 나카구", lat: 35.1745, lng: 136.9015, country: '일본' },
  { id: 1066, name: "레미니센스", category: "프렌치", rating: 4.8, description: "미쉐린 스타, 나고야 최고의 파인다이닝입니다.", address: "일본 나고야 나카구", lat: 35.1635, lng: 136.8995, country: '일본' },
  { id: 1067, name: "세카이노 야마짱", category: "테바사키", rating: 4.3, description: "매콤한 닭날개 튀김이 유명한 이자카야입니다.", address: "일본 나고야 사카에", lat: 35.1708, lng: 136.9082, country: '일본' },
  { id: 1068, name: "미센 (Misen)", category: "타이완라멘", rating: 4.3, description: "나고야식 매운 타이완 라멘의 본고장입니다.", address: "일본 나고야 이마이케", lat: 35.1695, lng: 136.9385, country: '일본' },
  { id: 1069, name: "큐샤 후시미야", category: "야키니쿠", rating: 4.4, description: "숯불로 구워내는 프리미엄 와규 맛집입니다.", address: "일본 나고야 후시미", lat: 35.1685, lng: 136.8975, country: '일본' },
  { id: 1070, name: "토미타 규카츠", category: "규카츠", rating: 4.5, description: "부드러운 식감과 풍부한 육즙으로 긴 대기줄을 자랑하는 규카츠 명소입니다.", address: "일본 나고야 나카구", lat: 35.1605, lng: 136.9062, country: '일본' },

  { id: 1071, name: "이치파치 스시", category: "스시", rating: 4.6, description: "아오모리산 신선한 가리비와 참치 전문점입니다.", address: "일본 아오모리 신마치", lat: 40.8242, lng: 140.7402, country: '일본' },
  { id: 1072, name: "오사나이 식당", category: "정식", rating: 4.5, description: "아오모리 향토 요리와 가리비 정식 맛집입니다.", address: "일본 아오모리 에키마에", lat: 40.8285, lng: 140.7385, country: '일본' },
  { id: 1073, name: "나가오 중화소바", category: "라멘", rating: 4.4, description: "진한 멸치 육수가 특징인 아오모리 라멘입니다.", address: "일본 아오모리 산나이", lat: 40.8155, lng: 140.6975, country: '일본' },
  { id: 1074, name: "아오모리 교사이 센터", category: "해산물", rating: 4.3, description: "나만의 덮밥 '노케동'을 즐기는 수산시장입니다.", address: "일본 아오모리 후루카와", lat: 40.8265, lng: 140.7365, country: '일본' },
  { id: 1075, name: "시치베이야", category: "야키니쿠", rating: 4.2, description: "신선한 해산물을 석쇠에 구워먹는 곳입니다.", address: "일본 아오모리 혼초", lat: 40.8255, lng: 140.7485, country: '일본' },
  { id: 1076, name: "네부타노쿠니 타카큐", category: "이자카야", rating: 4.3, description: "박력 넘치는 샤미센 공연과 향토 요리입니다.", address: "일본 아오모리 에키마에", lat: 40.8292, lng: 140.7375, country: '일본' },
  { id: 1077, name: "이치파치 즈시", category: "스시", rating: 4.5, description: "장인의 정성이 담긴 아오모리 정통 스시입니다.", address: "일본 아오모리 에키 주변", lat: 40.8278, lng: 140.7390, country: '일본' },
  { id: 1078, name: "사케 사카나 리카리", category: "일식", rating: 4.4, description: "아오모리 식재료와 로컬 사케의 조화입니다.", address: "일본 아오모리 시내", lat: 40.8235, lng: 140.7420, country: '일본' },
  { id: 1079, name: "스시 아스카", category: "스시", rating: 4.6, description: "합리적인 가격의 고품질 회전 초밥입니다.", address: "일본 아오모리 시노노메", lat: 40.8185, lng: 140.7512, country: '일본' },
  { id: 1080, name: "마루타케", category: "생선요리", rating: 4.4, description: "항구 근처의 신선한 생선구이 정식입니다.", address: "일본 아오모리 야스카타", lat: 40.8305, lng: 140.7415, country: '일본' },

  { id: 1081, name: "카마메시 시즈카", category: "솥밥", rating: 4.4, description: "나라 공원 입구의 60년 전통 솥밥 맛집입니다.", address: "일본 나라 공원 부근", lat: 34.6852, lng: 135.8342, country: '일본' },
  { id: 1082, name: "아와 나라마치", category: "야채요리", rating: 4.6, description: "나라 전통 채소를 사용한 건강한 코스입니다.", address: "일본 나라 나라마치", lat: 34.6785, lng: 135.8305, country: '일본' },
  { id: 1083, name: "카메야", category: "오코노미야키", rating: 4.3, description: "나라 현지인들이 사랑하는 노포 오코노미야키입니다.", address: "일본 나라 고후쿠지 근처", lat: 34.6825, lng: 135.8285, country: '일본' },
  { id: 1084, name: "히토시즈쿠", category: "일식", rating: 4.5, description: "정갈하고 섬세한 맛의 일본 가정식 코스입니다.", address: "일본 나라 시내", lat: 34.6815, lng: 135.8265, country: '일본' },
  { id: 1085, name: "모모시키", category: "스키야키", rating: 4.7, description: "나라 한우 '야마토 우시' 전문 스키야키입니다.", address: "일본 나라 히가시무키", lat: 34.6842, lng: 135.8282, country: '일본' },
  { id: 1086, name: "우나 키쿠", category: "장어", rating: 4.5, description: "130년 역사의 고급 장어 요리 전문점입니다.", address: "일본 나라 키쿠스이로", lat: 34.6835, lng: 135.8335, country: '일본' },
  { id: 1087, name: "키츠네 (Kitsune)", category: "가이세키", rating: 4.4, description: "독창적인 프렌치 스타일 가미 가이세키입니다.", address: "일본 나라 시내", lat: 34.6805, lng: 135.8295, country: '일본' },
  { id: 1088, name: "오카루", category: "오코노미야키", rating: 4.2, description: "추억이 깃든 친숙한 느낌의 철판 요리점입니다.", address: "일본 나라역 주변", lat: 34.6838, lng: 135.8275, country: '일본' },
  { id: 1089, name: "니노 (Nino)", category: "이탈리안", rating: 4.5, description: "일본 식재료로 풀어낸 명품 이탈리안입니다.", address: "일본 나라역 근처", lat: 34.6828, lng: 135.8195, country: '일본' },
  { id: 1090, name: "멘투야", category: "우동", rating: 4.4, description: "유부 주머니 속에 우동이 든 독특한 메뉴입니다.", address: "일본 나라 하라", lat: 34.6812, lng: 135.8278, country: '일본' },

  { id: 1091, name: "나카타야", category: "오코노미야키", rating: 4.5, description: "히로시마식 오코노미야키의 대표 주자입니다.", address: "일본 히로시마 중구", lat: 34.3932, lng: 132.4542, country: '일본' },
  { id: 1092, name: "에코히키 (Ekohiiki)", category: "굴요리", rating: 4.5, description: "히로시마 특산 굴 요리와 신선한 해산물입니다.", address: "일본 히로시마역 근처", lat: 34.3975, lng: 132.4755, country: '일본' },
  { id: 1093, name: "츠키 아카리", category: "붕장어", rating: 4.4, description: "풍미 가득한 아나고메시(붕장어 덮밥)입니다.", address: "일본 히로시마 오리즈루", lat: 34.3955, lng: 132.4535, country: '일본' },
  { id: 1094, name: "오코노미무라", category: "오코노미야키", rating: 4.3, description: "20개 이상의 점포가 모인 오코노미야키 촌입니다.", address: "일본 히로시마 중구", lat: 34.3915, lng: 132.4635, country: '일본' },
  { id: 1095, name: "텐푸라 텐코", category: "텐푸라", rating: 4.7, description: "가볍고 바삭한 튀김 옷의 인생 텐푸라입니다.", address: "일본 히로시마 미나미구", lat: 34.3825, lng: 132.4585, country: '일본' },
  { id: 1096, name: "미미테이 (Mimitei)", category: "철판구이", rating: 4.4, description: "부드러운 히로시마 비프 철판 구이입니다.", address: "일본 히로시마 나카구", lat: 34.3905, lng: 132.4625, country: '일본' },
  { id: 1097, name: "나카시마", category: "가이세키", rating: 4.8, description: "미쉐린 3스타, 히로시마 최고의 일식입니다.", address: "일본 히로시마 미나미구", lat: 34.3815, lng: 132.4555, country: '일본' },
  { id: 1098, name: "오코노미야키 주니어", category: "오코노미야키", rating: 4.5, description: "정성스런 레이어링의 오코노미야키 명가입니다.", address: "일본 히로시마 시내", lat: 34.3925, lng: 132.4515, country: '일본' },
  { id: 1099, name: "굿츠리안", category: "이자카야", rating: 4.4, description: "현지인들이 추천하는 가성비 스시 이자카야입니다.", address: "일본 히로시마 서구", lat: 34.3815, lng: 132.4285, country: '일본' },
  { id: 1100, name: "후지모토 라멘", category: "라멘", rating: 4.2, description: "해산물 베이스의 깊은 히로시마 라멘입니다.", address: "일본 히로시마 하쿠시마", lat: 34.4055, lng: 132.4645, country: '일본' },

  { id: 1101, name: "리큐 나카케초", category: "규탄", rating: 4.6, description: "센다이 명물 우설 구이의 선두주자입니다.", address: "일본 센다이역 부근", lat: 38.2612, lng: 140.8822, country: '일본' },
  { id: 1102, name: "우마미 타스케", category: "규탄", rating: 4.7, description: "센다이 우설 구이를 처음 시작한 원조집입니다.", address: "일본 센다이 코쿠분초", lat: 38.2635, lng: 140.8715, country: '일본' },
  { id: 1103, name: "젠지로 (Zenjiro)", category: "규탄", rating: 4.5, description: "센다이 역내에서 즐기는 두툼한 우설 구이입니다.", address: "일본 센다이역 규탄거리", lat: 38.2605, lng: 140.8835, country: '일본' },
  { id: 1104, name: "시오가마 시라하타", category: "스시", rating: 4.4, description: "항구 근처의 신선함을 담은 고품격 스시입니다.", address: "일본 센다이역 부근", lat: 38.2595, lng: 140.8845, country: '일본' },
  { id: 1105, name: "코코로즈쿠시 이나세", category: "이자카야", rating: 4.5, description: "미야기현의 제철 식재료와 사케가 가득입니다.", address: "일본 센다이 시내", lat: 38.2625, lng: 140.8755, country: '일본' },
  { id: 1106, name: "다테나리", category: "야키니쿠", rating: 4.6, description: "최고급 센다이 비프 야키니쿠 전문점입니다.", address: "일본 센다이역 주변", lat: 38.2585, lng: 140.8825, country: '일본' },
  { id: 1107, name: "이치무안 (ICHIMUAN)", category: "가이세키", rating: 4.5, description: "37층 전망과 함께 즐기는 고품격 가이세키입니다.", address: "일본 센다이 트러스트 타워", lat: 38.2565, lng: 140.8755, country: '일본' },
  { id: 1108, name: "미마스 미츠쿠라", category: "이자카야", rating: 4.3, description: "토호쿠 각지의 명물 요리를 한자리에입니다.", address: "일본 센다이역 앞", lat: 38.2615, lng: 140.8812, country: '일본' },
  { id: 1109, name: "사포로 카니혼케", category: "게 요리", rating: 4.4, description: "고급스러운 정원에서 즐기는 대게 코스입니다.", address: "일본 센다이 아오바구", lat: 38.2655, lng: 140.8725, country: '일본' },
  { id: 1110, name: "이즈쿠라", category: "일식", rating: 4.4, description: "정통 미야기 요리와 정갈한 일본 정식입니다.", address: "일본 센다이 이치방초", lat: 38.2645, lng: 140.8718, country: '일본' },

  { id: 1111, name: "우후야 (Ufuya)", category: "오키나와요리", rating: 4.1, description: "100년 된 고가옥에서 느끼는 제철 성찬입니다.", address: "일본 오키나와 나고", lat: 26.6352, lng: 127.9622, country: '일본' },
  { id: 1112, name: "류큐노 우시", category: "야키니쿠", rating: 4.6, description: "부드럽고 고소한 오키나와산 프리미엄 소입니다.", address: "일본 오키나와 차탄", lat: 26.3155, lng: 127.7585, country: '일본' },
  { id: 1113, name: "나카무라 소바", category: "오키나와소바", rating: 4.4, description: "직접 뽑은 면과 진한 국물의 정통 소바입니다.", address: "일본 오키나와 온나", lat: 26.4955, lng: 127.8545, country: '일본' },
  { id: 1114, name: "잭스 스테이크", category: "스테이크", rating: 4.5, description: "오키나와 필수 코스, 가성비 최고의 잭스입니다.", address: "일본 오키나와 나하", lat: 26.2165, lng: 127.6745, country: '일본' },
  { id: 1115, name: "미에 (Mie)", category: "궁중요리", rating: 4.7, description: "류큐 왕실의 품격이 담긴 전통 궁중 요리입니다.", address: "일본 오키나와 나하", lat: 26.2205, lng: 127.6815, country: '일본' },
  { id: 1116, name: "텐 투 텐", category: "라멘", rating: 4.3, description: "오키나와의 자부심, 깔끔한 돈코츠 라멘입니다.", address: "일본 오키나와 나하", lat: 26.2125, lng: 127.7125, country: '일본' },
  { id: 1117, name: "소베 소바", category: "오키나와소바", rating: 4.4, description: "정겨운 가정집 분위기 정통 오키나와 소바입니다.", address: "일본 오키나와 소베", lat: 26.2085, lng: 127.6865, country: '일본' },
  { id: 1118, name: "마에다 식당", category: "정식", rating: 4.2, description: "후추 향 가득한 고기 야채 볶음의 진수입니다.", address: "일본 오키나와 오기미", lat: 26.6855, lng: 128.1145, country: '일본' },
  { id: 1119, name: "담보 라멘", category: "라멘", rating: 4.0, description: "하카타식 돈코츠 라멘으로 유명한 곳입니다.", address: "일본 오키나와 나하", lat: 26.2168, lng: 127.6895, country: '일본' },
  { id: 1120, name: "미야자토 소바", category: "오키나와소바", rating: 4.2, description: "심플하지만 깊은 맛, 현지인 단골 소바입니다.", address: "일본 오키나와 나고 시내", lat: 26.5925, lng: 127.9715, country: '일본' },

  { id: 1121, name: "사와야카", category: "함바그", rating: 4.6, description: "시즈오카 명물, 육즙 가득한 주먹 함바그입니다.", address: "일본 시즈오카 하마마츠", lat: 34.7112, lng: 137.7282, country: '일본' },
  { id: 1122, name: "쵸지야 (Chojiya)", category: "마요리", rating: 4.5, description: "에도 시대 감성, 전통 마 덮밥 전문점입니다.", address: "일본 시즈오카 마리코", lat: 34.9455, lng: 138.3345, country: '일본' },
  { id: 1123, name: "토가쿠시 혼텐", category: "소바", rating: 4.4, description: "메밀 향이 살아있는 정통 수제 소바입니다.", address: "일본 시즈오카 아오이구", lat: 34.9755, lng: 138.3845, country: '일본' },
  { id: 1124, name: "치소 니시", category: "프렌치", rating: 4.7, description: "스루가만 해산물을 사용한 모던 프렌치입니다.", address: "일본 시즈오카 시내", lat: 34.9725, lng: 138.3885, country: '일본' },
  { id: 1125, name: "니혼료리 후지", category: "가이세키", rating: 4.6, description: "시즈오카 식재료의 매력을 살린 가이세키입니다.", address: "일본 시즈오카 아오이구", lat: 34.9785, lng: 138.3815, country: '일본' },
  { id: 1126, name: "온쟈쿠", category: "가이세키", rating: 4.8, description: "심플하고 정갈한 계절 일본 요리 전문점입니다.", address: "일본 시즈오카 시내", lat: 34.9715, lng: 138.3835, country: '일본' },
  { id: 1127, name: "스미야키 우나기 슌", category: "장어", rating: 4.5, description: "숯불로 정성껏 구워낸 겉바속촉 장어입니다.", address: "일본 시즈오카 하마마츠", lat: 34.7214, lng: 137.7315, country: '일본' },
  { id: 1128, name: "텐푸라 나루세", category: "텐푸라", rating: 4.7, description: "가벼운 튀김 옷과 신선한 재료의 조화입니다.", address: "일본 시즈오카 시내", lat: 34.9745, lng: 138.3855, country: '일본' },
  { id: 1129, name: "코바이 테이", category: "가이세키", rating: 4.4, description: "아름다운 바다 조망과 프리미엄 일식입니다.", address: "일본 시즈오카 아타미", lat: 35.0915, lng: 139.0745, country: '일본' },
  { id: 1130, name: "우나기 사쿠라야", category: "장어", rating: 4.5, description: "미시마 시내의 줄 서서 먹는 장어 명가입니다.", address: "일본 시즈오카 미시마", lat: 35.1185, lng: 138.9145, country: '일본' },

  { id: 1131, name: "구마모토 라멘 코쿠테이", category: "라멘", rating: 4.6, description: "마늘 향 가득한 구마모토 정통 라멘입니다.", address: "일본 구마모토 에키마에", lat: 32.7912, lng: 130.6862, country: '일본' },
  { id: 1132, name: "구마모토 라멘 케이카", category: "라멘", rating: 4.5, description: "두툼한 차슈와 진한 돈코츠 육수가 일품입니다.", address: "일본 구마모토 주오구", lat: 32.8015, lng: 130.7085, country: '일본' },
  { id: 1133, name: "스가노야", category: "말고기요리", rating: 4.7, description: "구마모토 명물 바사시(말고기 회) 명가입니다.", address: "일본 구마모토 상가", lat: 32.8025, lng: 130.7105, country: '일본' },
  { id: 1134, name: "드라고니아 T", category: "라멘", rating: 4.4, description: "강렬한 풍미의 구마모토 돈코츠 라멘입니다.", address: "일본 구마모토 시내", lat: 32.7985, lng: 130.7045, country: '일본' },
  { id: 1135, name: "켄조", category: "말고기요리", rating: 4.6, description: "신선한 말고기 회와 전골 요리 전문점입니다.", address: "일본 구마모토 신시가이", lat: 32.8005, lng: 130.7065, country: '일본' },
  { id: 1136, name: "아마켄", category: "이자카야", rating: 4.3, description: "아마쿠사 해산물과 바사시가 맛있는 곳입니다.", address: "일본 구마모토 하라", lat: 32.7915, lng: 130.6985, country: '일본' },
  { id: 1137, name: "아오야기", category: "일식", rating: 4.4, description: "고급스러운 분위기의 로컬 향토 일식입니다.", address: "일본 구마모토 주오구", lat: 32.8035, lng: 130.7105, country: '일본' },
  { id: 1138, name: "카케하시", category: "해산물", rating: 4.5, description: "매일 아침 들어오는 제철 해산물의 신선함입니다.", address: "일본 구마모토 히가시", lat: 32.7845, lng: 130.7315, country: '일본' },
  { id: 1139, name: "미야모토", category: "스테이크", rating: 4.6, description: "아카우시(적우) 스테이크가 일품인 곳입니다.", address: "일본 구마모토 시내", lat: 32.8025, lng: 130.7095, country: '일본' },
  { id: 1140, name: "긴자 후쿠쥬", category: "스시", rating: 4.4, description: "장인의 정성이 깃든 구마모토 정통 스시입니다.", address: "일본 구마모토 주오구", lat: 32.8045, lng: 130.7118, country: '일본' },

  { id: 1141, name: "아지노 돈카츠 마루이치", category: "돈카츠", rating: 4.6, description: "가고시마산 흑돼지로 만든 인생 돈카츠입니다.", address: "일본 가고시마 텐몬칸", lat: 31.5912, lng: 130.5562, country: '일본' },
  { id: 1142, name: "톤토로 라멘", category: "라멘", rating: 4.5, description: "사르르 녹는 항정살 차슈가 매력적인 맛입니다.", address: "일본 가고시마 주오에키", lat: 31.5835, lng: 130.5415, country: '일본' },
  { id: 1143, name: "마와루스시 멧케몬", category: "스시", rating: 4.4, description: "가고시마 항 직송 해산물로 만든 회전스시입니다.", address: "일본 가고시마 돌핀포트", lat: 31.5895, lng: 130.5615, country: '일본' },
  { id: 1144, name: "텐몬칸 무쟈키", category: "디저트", rating: 4.3, description: "가고시마의 상징, 시로쿠마(백곰) 빙수입니다.", address: "일본 가고시마 텐몬칸", lat: 31.5891, lng: 130.5545, country: '일본' },
  { id: 1145, name: "지노 (Zino)", category: "정식", rating: 4.4, description: "흑돼지 샤부샤부와 가고시마 향토 요리입니다.", address: "일본 가고시마 텐몬칸 근처", lat: 31.5905, lng: 130.5525, country: '일본' },
  { id: 1146, name: "쿠로부타 후쿠야", category: "돈카츠", rating: 4.5, description: "최상급 흑돼지 돈카츠와 숯불 구이 전문입니다.", address: "일본 가고시마 주오구", lat: 31.5825, lng: 130.5435, country: '일본' },
  { id: 1147, name: "난사츠노죠", category: "샤부샤부", rating: 4.3, description: "신선한 흑돼지를 마음껏 즐기는 샤부샤부입니다.", address: "일본 가고시마 텐몬칸 부근", lat: 31.5885, lng: 130.5515, country: '일본' },
  { id: 1148, name: "이치후쿠", category: "이자카야", rating: 4.2, description: "역 근처의 고즈넉하고 맛있는 로컬 주점입니다.", address: "일본 가고시마 마쿠라자키", lat: 31.2745, lng: 130.2945, country: '일본' },
  { id: 1149, name: "톤토로 혼텐", category: "라멘", rating: 4.5, description: "가고시마를 사로잡은 톤토로 라멘 본점입니다.", address: "일본 가고시마 텐몬칸 시내", lat: 31.5897, lng: 130.5532, country: '일본' },
  { id: 1150, name: "긴노쿠시", category: "야키토리", rating: 4.6, description: "가고시마산 닭을 정성껏 구워낸 꼬치 구이입니다.", address: "일본 가고시마 시내", lat: 31.5815, lng: 130.5485, country: '일본' }

])

const countries = ['한국', '일본'] as const
const selectedCountry = ref<'한국' | '일본'>('한국')
const selectedId = ref(104)

const regionsByCountry: Record<'한국' | '일본', string[]> = {
  '한국': ['전체', '서울', '경기', '인천', '강원', '충북', '충남', '대전', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '세종', '제주'],
  '일본': ['전체', '도쿄', '오사카', '교토', '후쿠오카', '삿포로', '아오모리', '요코하마', '나고야', '나라', '히로시마', '센다이', '오키나와', '시즈오카', '구마모토', '가고시마']
}
const selectedRegion = ref('전체')

const getRegionCount = (region: string) => {
  if (region === '전체') {
    return restaurantList.value.filter(s => s.country === selectedCountry.value).length
  }
  return restaurantList.value.filter(s => 
    s.country === selectedCountry.value && s.address.includes(region)
  ).length
}

const regionContainer = ref<HTMLElement | null>(null)
let isRegionDragging = false
let regionStartX = 0
let regionScrollLeft = 0
let lastRegionX = 0
let lastRegionTime = 0
let regionVelocity = 0
let regionMomentumRafId: number | null = null
const hasRegionMoved = ref(false)

const applyRegionMomentum = () => {
  const container = regionContainer.value
  if (!container || Math.abs(regionVelocity) < 0.1) return
  
  container.scrollLeft -= regionVelocity
  regionVelocity *= 0.975 // Smoother friction
  
  regionMomentumRafId = requestAnimationFrame(applyRegionMomentum)
}

const stopRegionDrag = () => {
  if (!isRegionDragging) return
  isRegionDragging = false
  window.removeEventListener('mousemove', handleRegionDrag)
  window.removeEventListener('mouseup', stopRegionDrag)
  window.removeEventListener('mouseleave', stopRegionDrag)
  window.removeEventListener('blur', stopRegionDrag)
  document.body.style.userSelect = ''
  
  applyRegionMomentum()
}

const startRegionDrag = (e: MouseEvent) => {
  if (e.button !== 0) return
  isRegionDragging = true
  regionStartX = e.pageX - (regionContainer.value?.offsetLeft || 0)
  regionScrollLeft = regionContainer.value?.scrollLeft || 0
  lastRegionX = e.pageX
  lastRegionTime = performance.now()
  regionVelocity = 0
  hasRegionMoved.value = false
  
  document.body.style.userSelect = 'none'
  
  if (regionMomentumRafId) {
    cancelAnimationFrame(regionMomentumRafId)
    regionMomentumRafId = null
  }
  
  window.addEventListener('mousemove', handleRegionDrag)
  window.addEventListener('mouseup', stopRegionDrag)
  window.addEventListener('mouseleave', stopRegionDrag)
  window.addEventListener('blur', stopRegionDrag)
}

const handleRegionDrag = (e: MouseEvent) => {
  if (!isRegionDragging || !regionContainer.value) return
  e.preventDefault()
  
  const currentTime = performance.now()
  const deltaTime = currentTime - lastRegionTime
  
  const x = e.pageX - (regionContainer.value.offsetLeft || 0)
  const walk = (x - regionStartX) * 1.2
  
  if (Math.abs(walk) > 5) {
    hasRegionMoved.value = true
  }
  
  regionContainer.value.scrollLeft = regionScrollLeft - walk
  
  if (deltaTime > 0) {
    const currentVel = (e.pageX - lastRegionX)
    regionVelocity = regionVelocity * 0.3 + currentVel * 0.7
  }
  
  lastRegionX = e.pageX
  lastRegionTime = currentTime
}

const scrollToShop = async (shopId: number) => {
  await nextTick()
  // DOM 렌더링 및 레이아웃 안정을 위해 짧은 지연 추가
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const container = scrollContainer.value
  if (!container) return
  
  const targetElement = container.querySelector(`[data-id="${shopId}"]`) as HTMLElement
  if (targetElement) {
    container.scrollTo({
      top: targetElement.offsetTop - 8,
      behavior: 'smooth'
    })
  }
}

const selectRegion = async (region: string) => {
  if (hasRegionMoved.value) {
    hasRegionMoved.value = false
    return
  }
  selectedRegion.value = region
  
  // Center scroll the tab
  await nextTick()
  const container = regionContainer.value
  const targetTab = container?.querySelector(`[data-region="${region}"]`) as HTMLElement
  if (targetTab) {
    targetTab.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    })
  }
  
  // Select a random shop in new filtered list to keep it fresh
  const list = filteredRestaurants.value
  if (list.length > 0) {
    const randomIndex = Math.floor(Math.random() * list.length)
    const randomShop = list[randomIndex]
    selectedId.value = randomShop.id
    // Auto-scroll to the selected shop in the list
    await scrollToShop(randomShop.id)
  }
}

// Initial region setup will be handled in onMounted to ensure DOM availability for scrolling

const filteredRestaurants = computed(() => {
  let list = restaurantList.value.filter(s => s.country === selectedCountry.value)
  
  // Region filtering
  if (selectedRegion.value !== '전체') {
    list = list.filter(s => s.address.includes(selectedRegion.value))
  }

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
  selectRegion('전체')
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

  // Initial random pick for Entire Korea - moved here to ensure scrollContainer is ready
  selectRegion('전체')
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
  mouseVelocity.value *= 0.975 // Smoother friction for vertical scroll
  
  momentumRafId = requestAnimationFrame(applyMomentum)
}

const onMouseDrag = (e: MouseEvent) => {
  if (!isMouseDragging.value || isDragging.value) return
  const container = scrollContainer.value
  if (!container) return
  
  const currentTimestamp = performance.now()
  const deltaTime = currentTimestamp - lastTimestamp.value
  const deltaY = e.clientY - mouseStartY.value
  
  if (Math.abs(deltaY) > 3) {
    hasMoved.value = true
    container.scrollTop = mouseScrollTop.value - deltaY
    
    // Smoothly accumulate velocity for better inertia
    if (deltaTime > 0) {
      const currentVel = (e.clientY - lastMouseY.value)
      // High responsiveness for momentum (0.1 prev + 0.9 current)
      mouseVelocity.value = mouseVelocity.value * 0.1 + currentVel * 0.9
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
  
  document.body.style.userSelect = 'none'
  
  window.addEventListener('mousemove', onMouseDrag, { passive: false })
  window.addEventListener('mouseup', stopMouseDrag)
  window.addEventListener('mouseleave', stopMouseDrag)
  window.addEventListener('blur', stopMouseDrag)
}

const stopMouseDrag = () => {
  if (!isMouseDragging.value) return
  isMouseDragging.value = false
  window.removeEventListener('mousemove', onMouseDrag)
  window.removeEventListener('mouseup', stopMouseDrag)
  window.removeEventListener('mouseleave', stopMouseDrag)
  window.removeEventListener('blur', stopMouseDrag)
  document.body.style.userSelect = ''
  
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
  }
  
  // Auto-scroll the selected card to the top
  await scrollToShop(shop.id)
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

// --- Naver Maps Integration ---
declare global {
  interface Window {
    naver: any
  }
}

let naverMap: any = null
let naverMarker: any = null
let naverInfoWindow: any = null

const initNaverMap = () => {
  if (!window.naver || !window.naver.maps) return
  
  const container = document.getElementById('naver-map')
  if (!container) {
    // Retry if the transition/v-if hasn't finished yet
    setTimeout(initNaverMap, 100)
    return
  }

  // If a map instance already exists, we should check if it's attached correctly.
  // When switching tabs with v-if, the container element is recreated.
  const mapOptions = {
    center: new window.naver.maps.LatLng(37.5665, 126.9780),
    zoom: 16,
    mapTypeId: window.naver.maps.MapTypeId.NORMAL,
    zoomControl: true,
    zoomControlOptions: {
      position: window.naver.maps.Position.RIGHT_BOTTOM
    }
  }
  
  naverMap = new window.naver.maps.Map(container, mapOptions)
  
  // Always recreate InfoWindow for the new map instance
  naverInfoWindow = new window.naver.maps.InfoWindow({
    content: '',
    backgroundColor: 'transparent',
    borderWidth: 0,
    disableAnchor: true,
    pixelOffset: new window.naver.maps.Point(0, -50) // Slightly adjusted for pin height
  })

  // After init, if we have a selected shop, update it immediately
  if (selectedShop.value && selectedCountry.value === '한국') {
    updateNaverMap(selectedShop.value)
  }
}

const updateNaverMap = (shop: Shop) => {
  if (!naverMap || !window.naver) return
  
  const latlng = new window.naver.maps.LatLng(shop.lat, shop.lng)
  naverMap.panTo(latlng)
  
  // Marker Update (recreate for new map instance)
  if (naverMarker) {
    naverMarker.setMap(null)
  }
  
  naverMarker = new window.naver.maps.Marker({
    position: latlng,
    map: naverMap,
    icon: {
      content: `
        <div class="relative group" style="width: 34px; height: 42px;">
          <!-- Ping Effect (Centered on the Pin Head 17, 17) -->
          <div class="absolute -top-[3px] -left-[3px] w-10 h-10 bg-[#1a73e8]/20 rounded-full animate-ping"></div>
          <!-- Google Style Pin SVG -->
          <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); display: block;">
            <path d="M17 0C7.61116 0 0 7.61116 0 17C0 26.3888 17 42 17 42C17 42 34 26.3888 34 17C34 7.61116 26.3888 0 17 0Z" fill="#1a73e8"/>
            <path d="M17 23C20.3137 23 23 20.3137 23 17C23 13.6863 20.3137 11 17 11C13.6863 11 11 13.6863 11 17C11 20.3137 13.6863 23 17 23Z" fill="white"/>
          </svg>
        </div>
      `,
      anchor: new window.naver.maps.Point(17, 42) // Accurate anchor at the bottom tip
    }
  })

  // InfoWindow Content Update
  if (naverInfoWindow) {
    const isDark = document.documentElement.classList.contains('dark')
    const naverSearchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(shop.name + ' ' + shop.address)}`
    const content = `
      <div style="
        padding: 18px;
        background: ${isDark ? '#1f1f1f' : '#ffffff'};
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
        border-radius: 16px;
        box-shadow: 0 15px 35px -5px rgba(0,0,0,0.3);
        width: 260px;
        font-family: 'Pretendard Variable', sans-serif;
      ">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #1a73e8; text-transform: uppercase; letter-spacing: 0.05em;">
            ${shop.category}
          </div>
          <div style="display: flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 800; color: ${isDark ? '#f4f4f5' : '#18181b'};">
             <span style="color: #fbbf24;">★</span> ${shop.rating}
          </div>
        </div>
        <div style="font-size: 18px; font-weight: 950; color: ${isDark ? '#f4f4f5' : '#18181b'}; margin-bottom: 6px; line-height: 1.2;">
          ${shop.name}
        </div>
        <div style="font-size: 13px; color: ${isDark ? '#a1a1aa' : '#71717a'}; line-height: 1.5; margin-bottom: 12px;">
          ${shop.description}
        </div>
        <div style="font-size: 12px; color: ${isDark ? '#71717a' : '#a1a1aa'}; margin-bottom: 14px; display: flex; align-items: center; gap: 4px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${shop.address}
        </div>
        <a href="${naverSearchUrl}" target="_blank" style="
          display: block;
          width: 100%;
          padding: 10px 0;
          background: #03c75a;
          color: white;
          text-align: center;
          text-decoration: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          transition: background 0.2s;
        ">
          네이버 지도로 자세히 보기
        </a>
      </div>
    `
    naverInfoWindow.setContent(content)
    
    // Ensure window is closed when switching shops
    naverInfoWindow.close()

    // Add click listener to marker for TOGGLE behavior
    window.naver.maps.Event.addListener(naverMarker, 'click', () => {
      if (naverInfoWindow.getMap()) {
        naverInfoWindow.close()
      } else {
        naverInfoWindow.open(naverMap, naverMarker)
      }
    })
  }
}

// Watch for shop changes to update Naver Map
watch(() => selectedShop.value, (newShop) => {
  if (newShop && selectedCountry.value === '한국') {
    nextTick(() => {
      if (!naverMap) initNaverMap()
      if (naverMap) updateNaverMap(newShop)
    })
  }
}, { immediate: true })

// Watch for country changes to handle map re-initialization
watch(() => selectedCountry.value, (newCountry) => {
  if (newCountry === '한국') {
    // Reset map variable to trigger a fresh init through the watcher or explicit call
    naverMap = null 
    initNaverMap()
  } else {
    // Clear references when leaving Korea tab
    naverMap = null
    naverMarker = null
    naverInfoWindow = null
  }
})

// Watch for theme changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class' && naverMap && window.naver) {
      // NAVY 타입은 GL 인증 오류로 인해 NORMAL 사용하되 CSS 필터로 대체
      naverMap.setMapTypeId(window.naver.maps.MapTypeId.NORMAL)
      
      // 테마 변경 시 정보창도 즉시 다시 그려서 배경색 동기화 (라이트 모드 블랙 오류 해결)
      if (selectedShop.value) {
        updateNaverMap(selectedShop.value)
      }
    }
  })
})

onMounted(() => {
  observer.observe(document.documentElement, { attributes: true })
  if (selectedCountry.value === '한국') {
    nextTick(() => {
      initNaverMap()
      if (selectedShop.value) updateNaverMap(selectedShop.value)
    })
  }
})

onUnmounted(() => {
  observer.disconnect()
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

/* Naver & Google Map Dark Mode Fix: CSS Filter (Subtle adjustments for visibility) */
.dark #naver-map,
.dark .google-map-iframe {
  filter: invert(90%) hue-rotate(185deg) brightness(88%) contrast(92%);
}

#naver-map {
  background: #f9fafb;
}

.dark #naver-map {
  background: #131313;
}

/* Invert overlays back so they look normal (Markers, InfoWindows, Labels) */
.dark #naver-map div:not([style*="background-image"]), 
.dark #naver-map .group,
.dark #naver-map [style*="z-index: 100"],
.dark #naver-map [style*="font-size"] {
  filter: invert(100%) hue-rotate(-185deg) saturate(1.8) brightness(1.3) contrast(1.2);
}

/* Ensure the marker's Brand Blue remains vibrant in Dark Mode */
.dark #naver-map .group svg path[fill="#1a73e8"] {
  fill: #60a5fa !important; /* Brighter vivid blue for better dark contrast */
}
</style>
