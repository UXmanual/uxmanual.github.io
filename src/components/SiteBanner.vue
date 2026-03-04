<template>
  <div class="bg-zinc-100 dark:bg-[#1f1f1f] px-6 py-4 overflow-hidden relative">
    <div class="max-w-[1800px] mx-auto overflow-hidden relative">
      <div class="marquee-wrapper">
        <p class="marquee-content text-[13px] font-bold text-zinc-500 dark:text-zinc-400 tracking-tight leading-none whitespace-nowrap">
          데이터 정보가 많은 경우 시간이 걸릴 수 있습니다.. ⏳
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Message is now animated with marquee effect (singular pass)
</script>

<style scoped>
.marquee-wrapper {
  display: flex;
  overflow: hidden;
  user-select: none;
}

.marquee-content {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 20s linear infinite;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-200%); }
}

/* Subtle fade edges to blend with background */
div::before, div::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100px;
  z-index: 2;
  pointer-events: none;
}

div::before {
  left: 0;
  background: linear-gradient(to right, rgb(244 245 247), transparent);
}

.dark div::before {
  background: linear-gradient(to right, #1f1f1f, transparent);
}

div::after {
  right: 0;
  background: linear-gradient(to left, rgb(244 245 247), transparent);
}

.dark div::after {
  background: linear-gradient(to left, #1f1f1f, transparent);
}
</style>
