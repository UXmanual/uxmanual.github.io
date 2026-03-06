---
description: 안전한 배포 및 버전 관리 워크플로우 (Deploy & Version Sync)
---

이 워크플로우는 모든 코드 변경 사항을 배포하기 전, 버전 누락을 방지하기 위한 필수 절차입니다.

## 🚀 배포 절차 (Deployment Process)

1.  **변경 사항 검토**
    - `git status`를 통해 수정된 파일 목록을 확인합니다.
    - 특히 `src/views/Trends.vue` 및 `src/components/SiteFooter.vue`가 포함되어 있는지 체크합니다.

2.  **버전 업데이트 확인**
    - 현재 사이트 버전이 목표 버전(예: 27.7)으로 두 파일 모두에서 업데이트되었는지 확인합니다.
    - `grep -r "Version" src/components/SiteFooter.vue`
    - `grep -r "CURRENT_CACHE_VERSION" src/views/Trends.vue`

3.  **커밋 및 배포**
    - // turbo
    - `git add .`
    - `git commit -m "작업성격: 작업내용 and bump version to [버전번호]"`
    - `git push origin main`

4.  **최종 보고**
    - 사용자에게 "Version [버전번호] 업데이트 완료"를 가장 먼저 알리며 결과를 보고합니다.
