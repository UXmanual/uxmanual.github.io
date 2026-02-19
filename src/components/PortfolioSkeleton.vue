<template>
  <div class="relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 break-inside-avoid animate-pulse transition-colors duration-500">
    <!-- Image Placeholder -->
    <div :style="{ height: height + 'px' }" class="w-full bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden transition-colors duration-500">
      <!-- Shimmer effect -->
      <div class="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent"></div>
    </div>
    
    <!-- Content Placeholder -->
    <div class="p-6 space-y-3">
      <div class="h-3 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded transition-colors duration-500"></div>
      <div class="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded transition-colors duration-500"></div>
      <div class="flex gap-4 pt-2">
        <div class="h-3 w-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div class="h-3 w-10 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  height: {
    type: Number,
    default: 300
  }
})
</script>

<style scoped>
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
