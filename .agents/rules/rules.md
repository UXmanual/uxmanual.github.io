---
description: uxmanual.github.io Technical & UI constraints (Workspace Rules)
---

# 📋 워크스페이스 프로젝트 수칙 (Technical Standards)

이 저장소(`uxmanual.github.io`)의 코드를 수정하거나 기능을 추가할 때 준수해야 하는 기술적 제약 사항 및 필수 작업 절차입니다.

---

## 🚀 1. 작업 시작 필수 프로세스 (Mandatory Workflow)

모든 작업은 반드시 다음 단계를 순차적으로 수행한다.

1.  **저장소 동기화**: 에이전트 실행 후 **최초 1회 작업 시작 시**에만 `git pull`을 통해 최신 코드를 확보한다. 매 명령어마다 반복할 필요는 없다.
2.  **선택적 의도 파악**: 레이아웃이 크게 변경되거나 구조적 변화가 생겨 **디자인에 직접적인 영향이 가는 경우**에만 작업을 시작하기 전 이해한 바를 한 문장으로 요약하여 확인받는다. 일상적인 작업 시에는 생략 가능하다.
3.  **환경 확인**: `npm run dev` 등을 통해 현재 프로젝트가 정상 빌드되는 상태인지 체크한다.
4.  **규칙 준수**: 아래 정의된 기술 및 UI 원칙을 위반하지 않는 범위 내에서 작업을 설계하고 수행한다.

---

## 🏗 2. 기술 스택 및 명명 규칙 (Tech Stack & Naming)

프로젝트의 일관성을 위해 다음의 기술 규격을 준수한다.

*   **컴포넌트 구조**: Vue 3 (Composition API, `<script setup lang="ts">`) 형식을 유지한다.
*   **스타일링**: Tailwind CSS v4를 기본으로 사용하며, 인라인 스타일링보다는 유틸리티 클래스를 우선한다.
*   **명명 규칙 (Naming)**:
    *   **컴포넌트 파일**: `PascalCase` (예: `SiteHeader.vue`)
    *   **CSS 클래스 및 데이터 파일**: `kebab-case` (예: `.news-card`, `data-v1.json`)
    *   **변수 및 함수**: `camelCase` (예: `fetchNewsData`)
*   **문서화**: 모든 공개 함수 및 복잡한 컴포넌트에는 **JSDoc** 형식의 주석을 작성한다.

---

## 🧱 2. UI/UX 및 디자인 품질 (Design Quality)

사용자 경험의 일관성을 위해 다음 원칙을 절대 준수한다.

*   **스켈레톤(Skeleton) 유지**: 로딩 또는 결과 부재 시 임의의 텍스트 안내를 추가하지 않고, 기존의 스켈레톤 UI를 노출한다.
*   **임의 변경 금지**: 요청되지 않은 UI 요소(알림창, 문구 변경 등)를 개발자 임의로 추가하지 않는다.
*   **에스테틱(Aesthetics) 준수**: 다크/라이트 모드 대응 및 플로팅 스크롤바 등 기존의 프리미엄 디자인 디테일을 훼손하지 않는다.

---

## 🔢 3. 버전 관리 및 운영 (Operations)

모든 작업은 추적 가능해야 하며 버전 번호 업데이트가 수반된다.

*   **버전 업데이트 (`SiteFooter.vue`)**:
    *   작업 완료 시 `Major.Minor` 형식을 준수하여 버전을 업데이트한다 (예: 27.4 -> 27.5).
    *   반드시 소수점 한 자리까지만 사용하며, 대규모 구조 변경 시에만 사용자 확인 후 정수(Major)를 올린다.
*   **커밋 메시지**: 작업 성격(`feat:`, `fix:`, `style:`, `chore:`)과 업데이트된 버전 번호를 명시한다.
    *   *예시: `feat: add new RSS source and bump version to 27.5`*

---

## 🚀 4. RSS 소스 관리 (RSS Management)

*   **구조 유지**: `src/views/Trends.vue` 내의 `RSS_SOURCES` 배열 구조를 유지한다.
*   **최적화**: 해외 소스 추가 시 `translate: true` 옵션의 적절성을 검토한다.

---

## 🏁 5. 작업 완료 체크리스트 (Self-Checklist)

모든 작업 보고 및 배포 전, 에이전트는 다음 사항을 반드시 자가 점검한다.

1.  **버전 업데이트**: `SiteFooter.vue`와 `Trends.vue`의 버전이 현재 작업 내용을 반영하여 `Major.Minor` 단위로 갱신되었는가?
2.  **커밋 메시지**: 커밋 메시지에 작업 성격과 업데이트된 버전 번호가 명확히 포함되었는가? (예: `feat: ... and bump version to 27.x`)
3.  **코드 품질**: 복잡한 로직에 JSDoc 주석이 작성되었으며, Tailwind CSS v4 원칙을 준수했는가?
4.  **UI 검증**: 스켈레톤 UI를 유지하고, 임의의 텍스트 알림창 등을 추가하지 않았는가?

---
---

## 🧩 6. 영역별 독립 관리 정책 (Area Isolation Policy)

프로젝트의 안정적인 관리를 위해 에이전트는 다음 세 영역을 엄격히 구분하여 작업한다. 사용자가 프롬프트에서 특정 영역을 명시하여 수정을 요청하지 않는 한, 다른 영역의 코드를 임의로 수정하거나 간섭하지 않는다.

1.  **상단 영역 (Header/Nav)**: `SiteNavbar.vue`, `SiteHeader.vue`, `SiteBanner.vue` 등 상단 공통 컴포넌트.
2.  **중앙 콘텐츠 영역 (Content)**: `Trends.vue`, `Eats.vue` 등 페이지 메인 레이아웃 및 뉴스/데이터 처리 로직.
3.  **하단 영역 (Footer)**: `SiteFooter.vue`. 버전 업데이트 및 뉴스 저작권 안내 영역.

*   **수정 원칙**: 요청받은 영역 외의 파일은 읽기(Read)는 가능하나, 쓰기(Write) 작업은 오직 요청된 영역에 한정한다.

---

## 💎 7. 글로벌 스킬을 활용한 고도화 (Global Skills Integration)

모든 새로운 페이지 개발 및 대규모 리팩토링 시, 다음의 글로벌 전문 스킬(Global Skills) 지침을 우선적으로 반영하여 구현의 정교함을 극대화한다.

*   **UI/UX Sophistication**: `ui-ux-pro-max`, `frontend-design`, `ui-styling` 스킬을 참조하여 마이크로 애니메이션, 세밀한 타이포그래피, 고해상도 에스테틱을 구현한다.
*   **Design System Integrity**: `design-system` 스킬을 통해 컴포넌트의 재사용성과 일관된 토큰 관리를 유지한다.
*   **Quality Assurance**: `moai-workflow-testing` 및 `webapp-testing` 스킬을 활용하여 배포 전 무결성을 검증한다.

---

> [!IMPORTANT]
> **준수 사항**: 위 원칙은 글로벌 대화 규칙보다 우선하며, 저장소의 안정성을 위해 최우선으로 적용된다. 모든 보고 시 업데이트된 버전 번호를 가장 먼저 언급한다.
