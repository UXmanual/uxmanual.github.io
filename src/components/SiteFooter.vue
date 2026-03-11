<template>
  <footer class="pt-20 pb-12 bg-white dark:bg-[#131313]">
    <div class="max-w-[1800px] mx-auto px-6 md:px-10 flex flex-col gap-12">
      <!-- Top Section: Navigators & Menu -->
      <div class="flex flex-col md:flex-row gap-8 md:gap-24 items-start md:items-center">
        <span class="text-[32px] font-black uppercase text-zinc-900 dark:text-zinc-200 tracking-[0]">Navigators</span>
        <nav class="flex flex-wrap gap-x-8 gap-y-4 text-[14px] font-bold text-zinc-400 dark:text-zinc-500">
          <router-link to="/" class="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Trends</router-link>
          <router-link to="/eats" class="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Eats</router-link>
          <router-link to="/feed" class="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Feed</router-link>
        </nav>
      </div>

      <!-- Legal & Copyright Group -->
      <div class="flex flex-col gap-6">
        <!-- Middle Section: Legal & Info -->
        <div class="max-w-4xl">
          <p class="text-[14px] leading-[150%] text-zinc-400 dark:text-zinc-600 font-medium">
            본 서비스에서 제공하는 모든 뉴스 및 데이터의 저작권은 각 원본 언론사와 제공처에 있으며, <br class="hidden sm:block">
            각 기사의 제목이나 썸네일 클릭 시 해당 언론사의 원문 서비스 페이지로 직접 연결됩니다.
          </p>
        </div>

        <!-- Bottom Section: Copyright & Version -->
        <div class="flex flex-col gap-1">
          <p class="text-[24px] font-black text-zinc-300 dark:text-zinc-700 tracking-tight">
            © DUXX
          </p>
          <div class="text-[12px] font-bold text-zinc-300 dark:text-zinc-700">
            Ver. 56.9
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * SiteFooter.vue
 * 
 * © DUXX - Delivering Unified Xperience eXtended
 * Includes RSS legal notice and development version history.
 */
</script>

<style scoped>
footer {
  font-family: "Pretendard Variable", "Pretendard", sans-serif;
}
</style>
