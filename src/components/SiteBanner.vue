<template>
  <div class="bg-zinc-100 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-white/5 py-3 px-6 md:px-10 overflow-hidden relative">
    <div class="max-w-[1800px] mx-auto flex items-center justify-center text-center">
      <p class="text-[11px] md:text-xs font-medium text-zinc-600 dark:text-zinc-400 tracking-tight leading-snug">
        {{ message }}
        <a href="#" class="inline-flex items-center gap-0.5 ml-1.5 text-blue-600 dark:text-blue-400 font-bold hover:underline">
          더 알아보기
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </p>
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
