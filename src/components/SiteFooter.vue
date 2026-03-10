<template>
  <footer class="border-t border-zinc-200 dark:border-white/5 py-16 px-6 md:px-10 bg-zinc-50 dark:bg-[#131313]">
    <div class="max-w-[1800px] mx-auto flex flex-col items-center text-center space-y-6">
      <!-- Copyright Section -->
      <p class="text-[13px] font-bold text-zinc-900 dark:text-zinc-400 tracking-tight">
        © NUXA
      </p>

      <!-- RSS Guidance Section -->
      <div class="max-w-xl">
        <p class="text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-600 font-medium">
          본 서비스에서 제공하는 모든 뉴스 및 데이터의 저작권은 각 원본 언론사와 제공처에 있으며, <br class="hidden sm:block">
          각 기사의 제목이나 썸네일 클릭 시 해당 언론사의 원문 서비스 페이지로 직접 연결됩니다.
        </p>
      </div>

      <!-- Version History Section -->
      <div class="pt-2 border-t border-zinc-200 dark:border-white/5 w-full flex justify-center gap-x-2 text-[10px] font-bold text-zinc-300 dark:text-zinc-700 uppercase">
        <span class="text-zinc-400 dark:text-zinc-500">VERSION</span>
        <span class="text-zinc-600 dark:text-white/40 italic pointer-events-none">v47.0 (LATEST)</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * SiteFooter.vue
 * 
 * © NUXA - Clean Minimal Footer
 * Includes RSS legal notice and development version history.
 */
</script>

<style scoped>
footer {
  font-family: "Pretendard Variable", "Pretendard", sans-serif;
}
</style>
