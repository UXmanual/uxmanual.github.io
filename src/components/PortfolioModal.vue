<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-white/90 dark:bg-black/95 backdrop-blur-sm pointer-events-auto" @click="$emit('close')"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden pointer-events-auto transition-colors duration-500">
        <!-- Close Button -->
        <button @click="$emit('close')" class="absolute top-5 right-5 z-50 p-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-zinc-900 dark:text-white transition-all backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Image/Video Area -->
        <div class="w-full h-full bg-zinc-100 dark:bg-black flex items-center justify-center overflow-hidden">
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
