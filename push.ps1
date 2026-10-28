param(
    [string]$Message = ""
)

Write-Host "[BPS] Staging all files..." -ForegroundColor Cyan
git add -A

$status = git status --porcelain
if ($status) {
    if (-not $Message) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $Message = "Update project changes ($timestamp)"
    }
    Write-Host "[BPS] Committing: $Message" -ForegroundColor Green
    git commit -m $Message
} else {
    Write-Host "[BPS] No new changes to commit." -ForegroundColor Yellow
}

Write-Host "[BPS] Pushing to GitHub (origin/main)..." -ForegroundColor Cyan
git push origin main

Write-Host "[BPS] Push completed successfully!" -ForegroundColor Green
