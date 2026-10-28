@echo off
setlocal enabledelayedexpansion

echo [BPS] Staging all changes...
git add -A

git status --porcelain > nul
for /f %%i in ('git status --porcelain') do set HAS_CHANGES=1

if defined HAS_CHANGES (
    set "COMMIT_MSG=%*"
    if "!COMMIT_MSG!"=="" (
        set "COMMIT_MSG=Update project changes (%DATE% %TIME%)"
    )
    echo [BPS] Committing: "!COMMIT_MSG!"
    git commit -m "!COMMIT_MSG!"
) else (
    echo [BPS] No new changes to commit.
)

echo [BPS] Pushing to GitHub (origin/main)...
git push origin main

echo [BPS] Push completed successfully!
