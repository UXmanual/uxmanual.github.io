<template>
  <div class="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0c] transition-colors duration-500">
    <!-- Hero Section -->
    <section class="relative pt-32 px-5 pb-20 text-center bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.05),transparent)]">
      <div class="inline-block px-4 py-2 mb-6 text-sm font-semibold text-indigo-600 bg-white/70 border border-white/30 backdrop-blur-md rounded-full shadow-sm animate-fade-in-down">
        Welcome to 2026 Digital Lab (Vue + Tailwind)
      </div>
      <h1 class="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 bg-gradient-to-b from-[#1d1d1f] to-[#434343] bg-clip-text text-transparent animate-fade-in-up">
        UXmanual
      </h1>
      <p class="text-lg md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
        사용자 경험의 표준을 제시하고 최고의 디지털 서비스를 설계하는 UX/UI 매뉴얼 연구소입니다.
      </p>
    </section>

    <!-- Cards Grid -->
    <div class="max-w-6xl mx-auto px-5 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
      <router-link to="/portfolio" class="group relative bg-white/70 dark:bg-zinc-900/70 border border-white/30 dark:border-white/10 backdrop-blur-2xl rounded-[32px] p-10 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-400/30">
        <div>
          <div class="text-4xl mb-6">✨</div>
          <h2 class="text-2xl font-bold mb-3 text-gray-900 dark:text-white">디자인 포트폴리오</h2>
          <p class="text-gray-500 leading-relaxed mb-6">Midjourney 스타일의 메이슨리 레이아웃으로 구현된 UXmanual만의 차별화된 프로젝트 결과를 확인하세요.</p>
        </div>
        <div class="text-indigo-600 font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
          포토폴리오 구경하기
          <span>→</span>
        </div>
      </router-link>

      <div class="group relative bg-white/70 dark:bg-zinc-900/70 border border-white/30 dark:border-white/10 backdrop-blur-2xl rounded-[32px] p-10 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
        <div>
          <div class="text-4xl mb-6">🏦</div>
          <h2 class="text-2xl font-bold mb-3 text-gray-900 dark:text-white">보험 서비스 UI</h2>
          <p class="text-gray-500 leading-relaxed mb-6">복잡한 보험 정보도 한눈에 파악할 수 있는 고도의 시각적 계층 구조가 적용된 설계안입니다.</p>
        </div>
        <div class="text-indigo-600 font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
          서비스 보기
          <span>→</span>
        </div>
      </div>

      <div class="group relative bg-white/70 dark:bg-zinc-900/70 border border-white/30 dark:border-white/10 backdrop-blur-2xl rounded-[32px] p-10 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
        <div>
          <div class="text-4xl mb-6">🚀</div>
          <h2 class="text-2xl font-bold mb-3 text-gray-900 dark:text-white">인재 채용</h2>
          <p class="text-gray-500 leading-relaxed mb-6">혁신을 현실로 만드는 UX/UI 설계자와 엔지니어를 기다립니다. 매뉴얼의 미래에 합류하세요.</p>
        </div>
        <div class="text-indigo-600 font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
          공고 확인
          <span>→</span>
        </div>
      </div>
    </div>

    <footer class="py-10 text-center text-gray-400 border-t border-gray-100 dark:border-white/5">
      &copy; 2026 UXmanual. Built with Vue & Tailwind CSS.
    </footer>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
.animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
.delay-200 { animation-delay: 0.2s; }
</style>
