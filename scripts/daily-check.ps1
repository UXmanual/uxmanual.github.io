# 윈도우 콘솔 팝업 방지를 위한 환경 변수 및 설정
$env:GIT_TERMINAL_PROMPT = "0"
$env:GCM_INTERACTIVE = "never"
$env:GIT_EDITOR = "true"

$lastCheckFile = ".agent/last_sync_date.txt"
$today = Get-Date -Format "yyyy-MM-dd"

# .agent 폴더가 없으면 생성
if (-not (Test-Path ".agent")) { New-Item -ItemType Directory -Path ".agent" | Out-Null }

# 오늘 이미 체크했는지 확인
if (Test-Path $lastCheckFile) {
    try {
        $lastDate = Get-Content $lastCheckFile -ErrorAction SilentlyContinue
        if ($lastDate -eq $today) {
            Write-Output "✅ 오늘의 동기화 확인이 이미 완료되었습니다."
            exit 0
        }
    }
    catch {}
}

Write-Output "🔍 원격 업데이트 확인 중 (Silent Mode)..."

# 원격 정보 가져오기 (외부 창을 띄울 수 있는 에러 가시성 최소화)
& git fetch origin main --quiet --no-recurse-submodules 2>$null

$behindCount = (git rev-list HEAD..origin/main --count).Trim()

if ([int]$behindCount -gt 0) {
    Write-Output "⚠️  원격에 새 커밋이 있습니다 ($behindCount개)."
    Write-Output "🤖 안티그래비티 대화 세션 내에서 자동 동기화를 진행합니다..."
    
    # --no-edit을 통해 편집기 창(메모장 등)이 뜨는 것 방지
    & git pull origin main --no-edit --quiet --no-rebase 2>$null
    Write-Output "✅ 동기화 완료."
}
else {
    Write-Output "✨ 이미 최신 상태입니다."
}

# 체크 완료 날짜 저장
$today | Out-File $lastCheckFile -NoNewline -Encoding utf8
exit 0
