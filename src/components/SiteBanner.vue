<template>
  <div class="bg-zinc-100 dark:bg-zinc-900/50 py-3.5 px-6 md:px-10 overflow-hidden relative">
    <div class="max-w-[1800px] mx-auto flex items-center justify-center text-center">
      <div class="flex flex-wrap items-center justify-center gap-1.5 text-[11px] md:text-xs font-medium text-zinc-600 dark:text-zinc-400 tracking-tight">
        <span>{{ message }}</span>
        <a href="#" class="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-bold hover:underline">
          더 알아보기
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 translate-y-[0.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<style scoped>
/* Optional: Subtle animation to catch eye */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

div {
  animation: fadeIn 0.8s ease-out;
}
</style>
