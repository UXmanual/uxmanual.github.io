<template>
  <div class="bg-zinc-100 dark:bg-[#1f1f1f] px-6 py-4 overflow-hidden relative">
    <div class="max-w-[1800px] mx-auto overflow-hidden relative">
      <div class="marquee-wrapper">
        <div class="marquee-content text-[13px] font-bold text-zinc-500 dark:text-zinc-400 tracking-tight leading-none whitespace-nowrap">
          <span>데이터 정보가 많은 경우 시간이 걸릴 수 있습니다.. ⏳ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span>데이터 정보가 많은 경우 시간이 걸릴 수 있습니다.. ⏳ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
        <div class="marquee-content marquee-content-duplicate text-[13px] font-bold text-zinc-500 dark:text-zinc-400 tracking-tight leading-none whitespace-nowrap">
          <span>데이터 정보가 많은 경우 시간이 걸릴 수 있습니다.. ⏳ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span>데이터 정보가 많은 경우 시간이 걸릴 수 있습니다.. ⏳ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Message is now animated with a seamless, slower marquee effect
</script>

<style scoped>
.marquee-wrapper {
  display: flex;
  overflow: hidden;
  user-select: none;
  gap: 0;
}

.marquee-content {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  min-width: 100%;
  animation: marquee-scroll 45s linear infinite;
}

@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

/* Subtle fade edges to blend with background */
div::before, div::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 120px;
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
