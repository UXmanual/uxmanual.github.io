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
  { id: 201, name: "양산왕돼지국밥", category: "돼지국밥", rating: 4.5, description: "진하고 뽀얀 사골 국물과 부드러운 수육의 조화가 일품인 부산의 대표 국밥 전문점입니다.", address: "부산광역시 해운대구 재송동", lat: 35.1912, lng: 129.1235, country: '한국' },
  { id: 202, name: "신발원", category: "만두", rating: 4.1, description: "백종원의 3대천왕 출연, 70년 전통의 수제 만두와 공갈빵이 유명한 곳입니다.", address: "부산광역시 동구 초량동", lat: 35.1223, lng: 129.0410, country: '한국' },
  { id: 203, name: "금수복국", category: "복어", rating: 4.4, description: "1970년부터 이어진 해운대의 상징, 시원한 복국과 다양한 복어 요리를 제공합니다.", address: "부산광역시 해운대구 중동", lat: 35.1636, lng: 129.1764, country: '한국' },
  { id: 204, name: "이재모피자", category: "피자", rating: 4.5, description: "부산 현지인들의 인생 피자집, 아낌없이 들어간 치즈와 담백한 도우가 특징입니다.", address: "부산광역시 중구 신창동1가", lat: 35.1021, lng: 129.0315, country: '한국' },
  { id: 205, name: "상국이네", category: "분식", rating: 4.2, description: "해운대 시장의 명물, 걸쭉하고 매콤한 떡볶이와 바삭한 튀김이 일품입니다.", address: "부산광역시 해운대구 중동", lat: 35.1615, lng: 129.1634, country: '한국' },
  { id: 206, name: "개미집 본점", category: "낙곱새", rating: 4.1, description: "부산 해운대의 줄 서서 먹는 맛집, 중독성 강한 매콤한 낙곱새 볶음 전문점입니다.", address: "부산광역시 해운대구 우동", lat: 35.1587, lng: 129.1598, country: '한국' },
  { id: 701, name: "걸리버막창", category: "막창", rating: 4.6, description: "대구 3대 막창 중 하나, 초벌되어 나오는 고소하고 쫄깃한 막창의 진수를 맛보세요.", address: "대구광역시 북구 노원동", lat: 35.8892, lng: 128.5830, country: '한국' },
  { id: 702, name: "중앙떡볶이", category: "분식", rating: 4.3, description: "대구 동성로의 전설, 두툼한 쌀떡과 카레향이 감도는 중독성 강한 소스가 매력입니다.", address: "대구광역시 중구 남일동", lat: 35.8701, lng: 128.5945, country: '한국' },
  { id: 703, name: "왕거미식당", category: "뭉티기", rating: 4.5, description: "백종원의 3대천왕 출연, 신선한 당일 도축 한우 뭉티기와 오드레기가 유명한 노포입니다.", address: "대구광역시 중구 동인동", lat: 35.8725, lng: 128.6055, country: '한국' },
  { id: 704, name: "삼송빵집 본점", category: "베이커리", rating: 4.2, description: "일명 '마약옥수수빵'의 원조, 입안 가득 톡톡 터지는 옥수수의 달콤한 맛이 일품입니다.", address: "대구광역시 중구 남일동", lat: 35.8695, lng: 128.5935, country: '한국' },
  { id: 705, name: "가창찐빵골목", category: "분식", rating: 4.4, description: "가창면의 명물, 김이 모락모락 나는 담백한 팥소의 수제 찐빵과 만두가 별미입니다.", address: "대구광역시 달성군 가창면", lat: 35.7925, lng: 128.6055, country: '한국' },
  { id: 706, name: "커피명가 본점", category: "카페", rating: 4.5, description: "대구에서 시작된 대한민국 1세대 로스터리 카페, 겨울철 딸기 케이크가 상징적입니다.", address: "대구광역시 중구 삼덕동", lat: 35.8655, lng: 128.6045, country: '한국' },
  { id: 301, name: "숙성도 함덕점", category: "흑돼지", rating: 4.7, description: "제주 흑돼지의 정점, 드라이에이징으로 깊은 맛을 낸 숙성 고기를 선보입니다.", address: "제주특별자치도 제주시 조천읍", lat: 33.5435, lng: 126.6690, country: '한국' },
  { id: 302, name: "명진전복", category: "전복", rating: 4.4, description: "구좌 해안가 위치, 고소한 전복 돌솥밥과 구이가 유명한 제주의 줄 서는 맛집입니다.", address: "제주특별자치도 제주시 구좌읍", lat: 33.5352, lng: 126.8524, country: '한국' },
  { id: 303, name: "자매국수", category: "고기국수", rating: 4.1, description: "제주 고기국수 거리의 대표 주자, 진한 사골 육수에 큼직한 수육이 올라갑니다.", address: "제주특별자치도 제주시 삼도이동", lat: 33.5182, lng: 126.5414, country: '한국' },
  { id: 304, name: "우진해장국", category: "해장국", rating: 4.3, description: "제주식 고사리 해장국으로 유명한 곳, 걸쭉하고 구수한 맛이 독특한 별미입니다.", address: "제주특별자치도 제주시 삼도이동", lat: 33.5115, lng: 126.5201, country: '한국' },
  { id: 305, name: "연돈", category: "돈카츠", rating: 4.6, description: "백종원의 골목식당 출연, 정성껏 튀겨낸 완벽한 식감의 수제 돈카츠 전문점입니다.", address: "제주특별자치도 서귀포시 색달동", lat: 33.2548, lng: 126.4055, country: '한국' },
  { id: 306, name: "올래국수", category: "고기국수", rating: 4.4, description: "제주 공항 인근, 담백하고 깔끔한 육수 맛으로 수많은 단골을 보유한 국수집입니다.", address: "제주특별자치도 제주시 연동", lat: 33.4915, lng: 126.4955, country: '한국' },
  { id: 401, name: "함양집", category: "한우물회", rating: 4.3, description: "90년 전통, 경주를 대표하는 시원하고 매콤한 한우물회가 유명한 노포입니다.", address: "경상북도 경주시 북군동", lat: 35.8415, lng: 129.2155, country: '한국' },
  { id: 402, name: "교리김밥", category: "분식", rating: 4.0, description: "경주의 명물 달걀 김밥, 폭신한 달걀 지단이 가득 들어가 담백한 맛이 일품입니다.", address: "경상북도 경주시 탑동", lat: 35.8295, lng: 129.2155, country: '한국' },
  { id: 501, name: "한국집", category: "비빔밥", rating: 4.2, description: "1952년 창업, 전주 비빔밥의 원조로 불리는 정갈하고 깊은 맛의 맛집입니다.", address: "전북특별자치도 전주시 완산구", lat: 35.8165, lng: 127.1475, country: '한국' },
  { id: 502, name: "베테랑칼국수", category: "칼국수", rating: 4.1, description: "전주 한옥마을의 명물, 들깨가루와 가득한 계란이 어우러진 걸쭉한 칼국수입니다.", address: "전북특별자치도 전주시 완산구", lat: 35.8145, lng: 127.1515, country: '한국' },
  { id: 503, name: "삼백집", category: "콩나물국밥", rating: 4.1, description: "하루 삼백 그릇만 판다는 정신으로 시작된, 전주 정통 콩나물 국밥 명소입니다.", address: "전북특별자치도 전주시 완산구", lat: 35.8185, lng: 127.1425, country: '한국' },
  { id: 601, name: "봉포머구리집", category: "물회", rating: 4.2, description: "속초 바다가 한눈에 보이는 곳에서 즐기는 신선하고 푸짐한 제철 물회입니다.", address: "강원특별자치도 속초시 영랑동", lat: 38.2255, lng: 128.5875, country: '한국' },
  { id: 602, name: "동화가든", category: "짬뽕순두부", rating: 4.3, description: "강릉 초당두부 마을의 명소, 불맛 나는 짬뽕과 부드러운 순두부의 환상적인 만남입니다.", address: "강원특별자치도 강릉시 초당동", lat: 37.7915, lng: 128.9165, country: '한국' },
  { id: 603, name: "엄지네포장마차", category: "꼬막비빔밥", rating: 4.3, description: "강릉 꼬막비빔밥 열풍의 주역, 짭쪼름한 양념과 신선한 꼬막이 어우러진 별미입니다.", address: "강원특별자치도 강릉시 포남동", lat: 37.7655, lng: 128.9085, country: '한국' },
  { id: 1001, name: "타치구이 아키라", category: "스시", rating: 4.9, description: "신선한 네타와 정교한 샤리가 일품인 서서 먹는 정통 스시 바입니다.", address: "도쿄도 미나토구", lat: 35.6662, lng: 139.7583, country: '일본' },
  { id: 1002, name: "긴자 이부키", category: "가이세키", rating: 4.8, description: "긴자의 품격이 느껴지는 제철 식재료 중심의 고급 가이세키 요리입니다.", address: "도쿄도 주오구", lat: 35.6720, lng: 139.7710, country: '일본' },
  { id: 1003, name: "텐푸라 미카쿠", category: "텐푸라", rating: 4.7, description: "1931년 창업, 장인의 손길로 튀겨낸 바삭하고 정갈한 텐푸라 전문점입니다.", address: "도쿄도 미나토구", lat: 35.6694, lng: 139.7523, country: '일본' },
  { id: 1004, name: "로쿠린샤", category: "츠케멘", rating: 4.6, description: "도쿄역 캐릭터 스트리트의 명물, 진한 육수의 츠케멘 전문점입니다.", address: "도쿄도 지요다구", lat: 35.6814, lng: 139.7677, country: '일본' },
  { id: 1005, name: "이마한", category: "스키야키", rating: 4.8, description: "100년 넘는 역사를 가진 최고급 쿠로게와규 스키야키 전문점입니다.", address: "도쿄도 니혼바시", lat: 35.6853, lng: 139.7820, country: '일본' },
  { id: 1006, name: "우시하치 키와미", category: "와규", rating: 4.6, description: "시부야 스트리트 전망과 함께 즐기는 프리미엄 와규 야키니쿠입니다.", address: "도쿄도 시부야", lat: 35.6595, lng: 139.7005, country: '일본' },
  { id: 1007, name: "피자 스트라다", category: "피자", rating: 4.5, description: "아자부주반의 세계적인 수준으로 평가받는 화덕 피자 맛집입니다.", address: "도쿄도 아자부주반", lat: 35.6548, lng: 139.7345, country: '일본' },
  { id: 1008, name: "스시 코시카와", category: "스시", rating: 4.7, description: "아카사카의 고즈넉한 분위기에서 즐기는 정통 오마카세 스시입니다.", address: "도쿄도 아카사카", lat: 35.6710, lng: 139.7360, country: '일본' },
  { id: 1009, name: "우동 야마초", category: "우동", rating: 4.4, description: "에비수의 세련된 디자인 공간에서 즐기는 쫄깃하고 담백한 우동입니다.", address: "도쿄도 에비수", lat: 35.6468, lng: 139.7118, country: '일본' },
  { id: 1010, name: "세잔 (Sezanne)", category: "프렌치", rating: 4.8, description: "포시즌스 호텔의 미쉐린 3스타, 창의적이고 감각적인 모던 프렌치입니다.", address: "도쿄도 마루노우치", lat: 35.6792, lng: 139.7678, country: '일본' }
])

const countries = ['한국', '일본'] as const
const selectedCountry = ref<'한국' | '일본'>('한국')
const selectedId = ref(104)

const regionsByCountry: Record<'한국' | '일본', string[]> = {
  '한국': ['전체', '서울특별시', '경기도', '인천광역시', '강원특별자치도', '충청북도', '충청남도', '대전광역시', '전북특별자치도', '전라남도', '광주광역시', '경상북도', '경상남도', '대구광역시', '울산광역시', '부산광역시', '세종특별자치시', '제주특별자치도'],
  '일본': ['전체', '도쿄도', '오사카부', '교토부', '후쿠오카현', '홋카이도', '아오모리현', '카나가와현', '아이치현', '나라현', '히로시마현', '미야기현', '오키나와현', '시즈오카현', '구마모토현', '가고시마현']
}
const selectedRegion = ref('전체')

const getRegionCount = (region: string) => {
  if (region === '전체') {
    return restaurantList.value.filter(s => s.country === selectedCountry.value).length
  }
  return restaurantList.value.filter(s => {
    if (s.country !== selectedCountry.value) return false
    // 한국/일본 모두 공식 지역명으로 시작하는지 확인 (startsWith)
    return s.address.startsWith(region)
  }).length
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
    list = list.filter(s => s.address.startsWith(selectedRegion.value))
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
