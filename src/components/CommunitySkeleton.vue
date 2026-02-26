<template>
  <div class="space-y-6">
    <div v-for="i in 3" :key="i" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl p-8 animate-pulse">
      <div class="flex justify-between items-start mb-6">
        <div class="flex items-center gap-4">
          <!-- Avatar Skeleton -->
          <div class="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
          <div class="space-y-2">
            <!-- Name Skeleton -->
            <div class="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <!-- Date Skeleton -->
            <div class="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>
      </div>
      <!-- Title Skeleton -->
      <div class="h-6 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded mb-3"></div>
      <!-- Message Skeleton -->
      <div class="space-y-2">
        <div class="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div class="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
