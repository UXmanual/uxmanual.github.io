$lastCheckFile = ".agent/last_sync_date.txt"
$today = Get-Date -Format "yyyy-MM-dd"

# .agent 폴더가 없으면 생성
if (-not (Test-Path ".agent")) { New-Item -ItemType Directory -Path ".agent" | Out-Null }

# 오늘 이미 체크했는지 확인
if (Test-Path $lastCheckFile) {
    $lastDate = Get-Content $lastCheckFile
    if ($lastDate -eq $today) {
        Write-Host "✅ 오늘의 동기화 확인이 이미 완료되었습니다." -ForegroundColor Cyan
        exit 0
    }
}

Write-Host "🔍 새로운 하루의 시작입니다. 원격 업데이트를 확인합니다..." -ForegroundColor Yellow

# 원격 정보 가져오기
git fetch origin main | Out-Null

$behindCount = (git rev-list HEAD..origin/main --count).Trim()

if ($behindCount -gt 0) {
    $updates = git log HEAD..origin/main --oneline -n 5
    Write-Host "⚠️  다른 컴퓨터에서 수정된 내용이 있습니다! (새 커밋: $behindCount개)" -ForegroundColor Red
    Write-Host "--- 업데이트 내용 요약 ---" -ForegroundColor Gray
    Write-Host $updates
    Write-Host "--------------------------" -ForegroundColor Gray
    Write-Host "📦 'git pull'을 실행하여 이 PC에 동기화할까요? (y/n): " -NoNewline
    $choice = Read-Host
    if ($choice -eq "y" -or $choice -eq "Y") {
        git pull origin main
        Write-Host "✅ 동기화 완료! 이제 안전하게 작업을 시작할 수 있습니다." -ForegroundColor Green
    }
    else {
        Write-Host "🚧 동기화를 건너띄었습니다. 작업 시 주의해 주세요." -ForegroundColor DarkYellow
    }
}
else {
    Write-Host "✨ 이미 최신 상태입니다. 바로 작업을 시작해도 좋습니다." -ForegroundColor Green
}

# 체크 완료 날짜 저장
$today | Out-File $lastCheckFile -NoNewline
exit 0
