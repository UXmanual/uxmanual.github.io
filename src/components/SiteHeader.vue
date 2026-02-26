<template>
  <header 
    class="px-6 md:px-10 max-w-[1800px] mx-auto transition-opacity duration-300"
    :class="[paddingTop, marginBottom]"
  >
    <div class="space-y-4" :class="innerMaxWidth">
      <h1 
        class="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white" 
        :class="{ 'gradient-text': enableGradient }"
        style="font-family: 'Pretendard Variable', 'Pretendard', sans-serif; font-weight: 800 !important;"
      >
        {{ title }}
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
    120deg, 
    #00AF50, 
    #34d399, 
    #86efac, 
    #10b981, 
    #00AF50
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 10s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
</style>
