<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-white/90 dark:bg-black/95 backdrop-blur-sm pointer-events-auto" @click="$emit('close')"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col md:flex-row transition-colors duration-500">
        <!-- Close Button -->
        <button @click="$emit('close')" class="absolute top-5 right-5 z-50 p-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-zinc-900 dark:text-white transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Image/Video Area -->
        <div class="flex-1 bg-zinc-100 dark:bg-black flex items-center justify-center overflow-hidden">
          <template v-if="item?.youtubeId">
            <div class="w-full aspect-video">
              <iframe 
                class="w-full h-full border-0"
                :src="`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1`"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </template>
          <template v-else>
            <img :src="item?.image" :alt="item?.title" class="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-500">
          </template>
        </div>

        <!-- Info Area -->
        <div class="w-full md:w-80 p-8 flex flex-col justify-between bg-white dark:bg-zinc-900 border-l border-zinc-100 dark:border-white/5 transition-colors">
          <div>
            <span class="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-3 block">{{ item?.category }}</span>
            <h2 class="text-3xl font-bold mb-4 text-zinc-900 dark:text-white leading-tight uppercase tracking-tighter">{{ item?.title }}</h2>
            <p class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-8">
              이 작품은 미드저니의 예술적 알고리즘과 현대적 디자인 미학이 만난 결과물입니다. 다중 레이어 구조와 조명 효과를 활용하여 몰입감 있는 시각적 경험을 제공합니다.
            </p>
          </div>

          <div class="space-y-6">
            <div class="flex items-center justify-between py-4 border-y border-zinc-100 dark:border-white/5">
              <div class="flex flex-col">
                <span class="text-[10px] uppercase font-bold text-zinc-400 mb-1">Views</span>
                <span class="text-lg font-bold text-zinc-900 dark:text-white">{{ item?.views }}</span>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-[10px] uppercase font-bold text-zinc-400 mb-1">Appreciation</span>
                <span class="text-lg font-bold text-zinc-900 dark:text-white">{{ item?.likes }}</span>
              </div>
            </div>

            <button class="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all">
              Download Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

interface PortfolioItem {
  image: string
  title: string
  category: string
  views: string
  likes: string
  youtubeId?: string
}

const props = defineProps<{
  isOpen: boolean
  item: PortfolioItem | null
}>()

defineEmits(['close'])

// Disable scroll when modal is open
onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
