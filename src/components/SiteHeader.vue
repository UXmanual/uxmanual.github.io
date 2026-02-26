<template>
  <header 
    class="px-6 md:px-10 max-w-[1800px] mx-auto transition-opacity duration-300"
    :class="[paddingTop, marginBottom]"
  >
    <div class="space-y-4" :class="innerMaxWidth">
      <h1 
        class="text-4xl md:text-5xl font-extrabold tracking-tight"
        style="font-family: 'Pretendard Variable', 'Pretendard', sans-serif; font-weight: 800 !important;"
      >
        <span :class="{ 'gradient-text': enableGradient }" class="text-zinc-900 dark:text-white">
          {{ title }}
        </span>
      </h1>
      <p 
        class="text-zinc-600 dark:text-zinc-400 text-base md:text-lg leading-relaxed"
        v-html="description"
      ></p>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  paddingTop?: string
  marginBottom?: string
  innerMaxWidth?: string
  enableGradient?: boolean
}

withDefaults(defineProps<Props>(), {
  paddingTop: 'pt-28',
  marginBottom: 'mb-8',
  innerMaxWidth: 'max-w-2xl',
  enableGradient: false
})
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(
    110deg,
    #6366f1 20%,
    #a855f7 40%,
    #ec4899 60%,
    #a855f7 80%,
    #6366f1 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
</style>
