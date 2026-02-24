<template>
  <div class="bg-zinc-100 dark:bg-zinc-900/50 py-2.5 px-6 md:px-10 overflow-hidden relative">
    <div class="max-w-[1800px] mx-auto flex items-center justify-center text-center">
      <p class="text-[11px] md:text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-tight leading-none">
        {{ message }}
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
