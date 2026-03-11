<template>
  <footer class="border-t border-zinc-200 dark:border-white/5 py-16 bg-white dark:bg-[#131313]">
    <div class="max-w-[1800px] mx-auto px-6 md:px-10 flex flex-col items-start text-left space-y-5">
      <!-- Copyright Section -->
      <p class="text-[14px] font-black text-zinc-400 dark:text-zinc-600 tracking-tight">
        © NUXA
      </p>

      <!-- RSS Guidance Section -->
      <div>
        <p class="text-[12px] leading-tight text-zinc-400 dark:text-zinc-600 font-medium">
          본 서비스에서 제공하는 모든 뉴스 및 데이터의 저작권은 각 원본 언론사와 제공처에 있으며, <br class="hidden sm:block">
          각 기사의 제목이나 썸네일 클릭 시 해당 언론사의 원문 서비스 페이지로 직접 연결됩니다.
        </p>
      </div>

      <!-- Version Section -->
      <div class="flex justify-start items-center text-[10px] font-bold">
        <span class="text-zinc-400 dark:text-zinc-600">ver. 47.6</span>
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
