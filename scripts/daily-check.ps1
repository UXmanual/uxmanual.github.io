param([switch]$AutoSync)

# Git 팝업 방지를 위한 환경 변수 설정
$env:GIT_TERMINAL_PROMPT = "0"
$env:GCM_INTERACTIVE = "never"

$lastCheckFile = ".agent/last_sync_date.txt"
$today = Get-Date -Format "yyyy-MM-dd"

# 자동 동기화 여부 판단 (플래그, 환경변수, 또는 비대화형 환경 확인)
$isAutoSync = $AutoSync -or $env:AG_AUTO_SYNC -eq "true" -or ($null -eq [Console]::Out)

# .agent 폴더가 없으면 생성
if (-not (Test-Path ".agent")) { New-Item -ItemType Directory -Path ".agent" | Out-Null }

# 오늘 이미 체크했는지 확인
if (Test-Path $lastCheckFile) {
    try {
        $lastDate = Get-Content $lastCheckFile -ErrorAction SilentlyContinue
        if ($lastDate -eq $today) {
            Write-Host "✅ 오늘의 동기화 확인이 이미 완료되었습니다." -ForegroundColor Cyan
            exit 0
        }
    }
    catch {}
}

Write-Host "🔍 원격 업데이트를 확인합니다 (Silent Mode)..." -ForegroundColor Yellow

# 원격 정보 가져오기 (에러 출력 억제)
git fetch origin main 2>$null | Out-Null

$behindCount = (git rev-list HEAD..origin/main --count).Trim()

if ($behindCount -gt 0) {
    $updates = git log HEAD..origin/main --oneline -n 5
    Write-Host "⚠️  원격에 새 커밋이 있습니다 ($behindCount개)." -ForegroundColor Yellow
    
    if ($isAutoSync -or $true) {
        # 안티그래비티 환경에서는 자동으로 진행하도록 강제 (팝업 방지)
        Write-Host "🤖 자동 동기화를 진행합니다..." -ForegroundColor Green
        git pull origin main --no-edit --quiet
        Write-Host "✅ 동기화 완료." -ForegroundColor Green
    }
}
else {
    Write-Host "✨ 이미 최신 상태입니다." -ForegroundColor Green
}

# 체크 완료 날짜 저장
$today | Out-File $lastCheckFile -NoNewline -Encoding utf8
exit 0
