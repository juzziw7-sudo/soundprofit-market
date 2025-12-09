# SoundProfit Market - Automated Deploy Script
# Run this after you have your GitHub token

Write-Host "🚀 SoundProfit Market - Deploy Automation" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Check if git is configured
$gitUser = git config user.name
if (-not $gitUser) {
    git config user.name "SoundProfit"
    git config user.email "deploy@soundprofit.market"
    Write-Host "✅ Git configured" -ForegroundColor Green
}

# Check if we're in a git repo
if (-not (Test-Path .git)) {
    Write-Host "❌ Not a git repository. Run this from the project root." -ForegroundColor Red
    exit 1
}

# Check for changes
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Changes detected. Committing..." -ForegroundColor Yellow
    git add .
    $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
    if (-not $commitMsg) {
        $commitMsg = "Update - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    git commit -m $commitMsg
    Write-Host "✅ Changes committed" -ForegroundColor Green
}
else {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
}

# Push to GitHub
Write-Host "`n🔄 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "You will be prompted for your GitHub credentials:" -ForegroundColor Cyan
Write-Host "  Username: juzziw7-sudo" -ForegroundColor White
Write-Host "  Password: [Your Personal Access Token]`n" -ForegroundColor White

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor White
    Write-Host "2. Click 'New +' → 'Blueprint'" -ForegroundColor White
    Write-Host "3. Select 'soundprofit-market' repository" -ForegroundColor White
    Write-Host "4. Choose branch 'main'" -ForegroundColor White
    Write-Host "5. Click 'Apply' and wait for deployment`n" -ForegroundColor White
    
    Write-Host "🌐 Your app will be live at: https://soundprofit-backend.onrender.com" -ForegroundColor Green
}
else {
    Write-Host "`n❌ Push failed. Please check your credentials." -ForegroundColor Red
    Write-Host "Remember to use your Personal Access Token as password!" -ForegroundColor Yellow
}
