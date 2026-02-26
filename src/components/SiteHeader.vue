<template>
  <header 
    class="px-6 md:px-10 max-w-[1800px] mx-auto transition-opacity duration-300"
    :class="[paddingTop, marginBottom]"
  >
    <div class="space-y-4" :class="innerMaxWidth">
      <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white" style="font-family: 'Pretendard', sans-serif;">
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
}

withDefaults(defineProps<Props>(), {
  paddingTop: 'pt-28',
  marginBottom: 'mb-8',
  innerMaxWidth: 'max-w-2xl'
})
</script>
