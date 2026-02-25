<template>
  <div class="bg-zinc-100 dark:bg-zinc-900 px-6 py-4 overflow-hidden relative">
    <div class="max-w-[1800px] mx-auto flex items-center justify-center text-center">
      <p class="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 tracking-tight leading-none">
        더 똑똑해지는 중... 🤖
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Message is now fixed as per request
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
