<template>
  <header 
    class="px-6 md:px-10 mx-auto transition-opacity duration-300"
    :class="[paddingTop, marginBottom, maxWidth]"
  >
    <div class="space-y-4">
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
        {{ title }}
      </h1>
      <p 
        class="text-zinc-600 dark:text-zinc-400 text-base md:text-lg leading-relaxed max-w-2xl"
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
  maxWidth?: string
}

withDefaults(defineProps<Props>(), {
  paddingTop: 'pt-28',
  marginBottom: 'mb-8',
  maxWidth: 'max-w-[1800px]'
})
</script>
