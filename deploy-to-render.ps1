# Render Pre-Deployment PowerShell Script
# This script helps prepare your code for Render deployment

Write-Host "`n=== EcoPredict Render Deployment Helper ===" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "Error: Git repository not found" -ForegroundColor Red
    Write-Host "Please initialize git first: git init"
    exit 1
}

Write-Host "✓ Git repository found" -ForegroundColor Green

# Check if code is committed
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠ Uncommitted changes found" -ForegroundColor Yellow
    $response = Read-Host "Would you like to commit them? (y/n)"
    if ($response -match '^[Yy]') {
        $commitMsg = Read-Host "Enter commit message"
        git add -A
        git commit -m "$commitMsg"
        Write-Host "✓ Changes committed" -ForegroundColor Green
    } else {
        Write-Host "Please commit changes before deploying"
        exit 1
    }
} else {
    Write-Host "✓ All changes committed" -ForegroundColor Green
}

# Check if remote is set
$remotes = git remote
if (-not ($remotes -contains "origin")) {
    Write-Host "⚠ No remote repository configured" -ForegroundColor Yellow
    $repoUrl = Read-Host "Enter your GitHub repository URL"
    git remote add origin $repoUrl
    Write-Host "✓ Remote repository added" -ForegroundColor Green
} else {
    Write-Host "✓ Remote repository configured" -ForegroundColor Green
}

# Push to remote
Write-Host ""
$pushResponse = Read-Host "Push to GitHub? (y/n)"
if ($pushResponse -match '^[Yy]') {
    try {
        git push -u origin main
    } catch {
        git push -u origin master
    }
    Write-Host "✓ Code pushed to GitHub" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Pre-deployment checks complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Go to https://render.com and sign in"
Write-Host "2. Click 'New' → 'Blueprint'"
Write-Host "3. Connect your GitHub repository"
Write-Host "4. Select this repository"
Write-Host "5. Render will detect render.yaml and create both services"
Write-Host "6. Wait ~10 minutes for deployment"
Write-Host "7. Update API URL in react-frontend/src/pages/search.js"
Write-Host "8. Commit and push the change to redeploy"
Write-Host ""
Write-Host "For detailed instructions, see RENDER_DEPLOY.md"
Write-Host ""
