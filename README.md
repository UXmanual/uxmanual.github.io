# UXManual Design Portfolio Archive

미드저니(Midjourney)의 탐색 페이지 스타일을 벤치마킹하여 제작된, 고해상도 디자인 작업물 및 영상 아카이브 포트폴리오 사이트입니다. Vue 3와 Tailwind CSS v4를 기반으로 현대적이고 직관적인 사용자 경험을 제공합니다.

🔗 **라이브 프리뷰:** [https://uxmanual.github.io/](https://uxmanual.github.io/)

---

## ✨ 핵심 기능 (Key Features)

### 1. Midjourney 스타일 메이슨리 그리드 (Masonry Grid)
- **압축된 레이아웃:** 카드 간의 간격을 촘촘하게 배치하여 미드저니 특유의 풍성한 시각적 아카이브 느낌을 구현했습니다.
- **반응형 최적화:** 화면 너비에 따라 1단에서 4단까지 유연하게 변화하는 반응형 그리드를 지원합니다.
- **부드러운 인터랙션:** 마우스 오버 시 정보를 노출하는 세련된 오버레이 효과를 적용했습니다.

### 2. 컨텐츠 중심의 고해상도 모달 (Content-Focused Modal)
- **몰입형 디자인:** 불필요한 텍스트 영역을 과감히 제거하고 작품(이미지/영상)의 시각적 요소를 최대화한 풀스크린 모달을 제공합니다.
- **유튜브 임베드:** 영상 프로젝트의 경우 모달 내에서 즉시 재생 가능한 고화질 유튜브 플레이어를 연동했습니다.

### 3. 멀티 테마 시스템 (Dark / Light Mode)
- **실시간 전환:** 헤더의 토글 버튼을 통해 다크 모드와 라이트 모드를 즉시 전환할 수 있습니다.
- **테마 영속성:** `localStorage`를 활용하여 사용자가 설정한 테마가 다음 방문 시에도 유지되도록 설계했습니다.
- **미세 조정:** 각 테마에 최적화된 배경색, 텍스트 대비, 테두리 효과를 통해 눈이 편안한 감상 환경을 제공합니다.

### 4. 하이엔드 디테일 및 최적화
- **플로팅 투명 스크롤바:** 윈도우 환경에서도 레이아웃 밀림 현상이 발생하지 않도록 `overflow: overlay`와 투명 트랙 스타일을 적용했습니다.
- **스켈레톤 로딩:** 데이터 로딩 시 실제 레이아웃과 유사한 형태의 스켈레톤(Skeleton UI)을 노출하여 체감 속도를 높였습니다.
- **클린 URL:** Vue Router의 `createWebHistory`를 적용하여 깔끔한 경로를 지원합니다.

---

## 🛠 기술 스택 (Tech Stack)

- **Framework:** Vue 3 (Composition API, Setup script)
- **Styling:** Tailwind CSS v4 (Modern Engine)
- **Build Tool:** Vite
- **Language:** TypeScript
- **Deployment:** GitHub Pages (via GitHub Actions)

---

## 🚀 시작하기 (Get Started)

### 설치 및 실행
```bash
# 레포지토리 클론
git clone https://github.com/UXmanual/uxmanual.github.io.git

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 📁 프로젝트 구조 (Structure)

- `src/views/Portfolio.vue`: 전체 포트폴리오 로직 및 메인 그리드 구현
- `src/components/PortfolioModal.vue`: 이미지/영상 상세 보기 모달 컴포넌트
- `src/components/PortfolioSkeleton.vue`: 로딩 상태 시각화 컴포넌트
- `src/assets/main.css`: 다크 모드 변수 및 플로팅 스크롤바 등 글로벌 스타일링
- `src/router/index.js`: 클린 URL 설정 및 경로 라우팅

---

## 🚢 배포 및 운영

이 프로젝트는 **GitHub Actions**를 통해 자동화된 CI/CD 파이프라인으로 운영됩니다.
- `main` 브랜치에 코드가 push되면 자동으로 빌드 및 배포가 수행됩니다.
- 404 페이지 방지 및 클린 URL 유지를 위한 설정이 포함되어 있습니다.

---

© 2026 UXManual. Built with Love & Vue.js.