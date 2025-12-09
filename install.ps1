# SoundProfit Market - Automated Installation Script for Windows
# Run this script with PowerShell as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SoundProfit Market - Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Please run this script as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ Node.js not found. Installing..." -ForegroundColor Red
    Write-Host "Please download and install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Start-Process "https://nodejs.org/en/download/"
    pause
    exit 1
}

# Check PostgreSQL
Write-Host ""
Write-Host "[2/6] Checking PostgreSQL..." -ForegroundColor Yellow
$pgInstalled = Get-Command psql -ErrorAction SilentlyContinue
if (-not $pgInstalled) {
    Write-Host "✗ PostgreSQL not found." -ForegroundColor Red
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  1. Install PostgreSQL locally (https://www.postgresql.org/download/)" -ForegroundColor Yellow
    Write-Host "  2. Use cloud database (Railway, Supabase, Render)" -ForegroundColor Yellow
    Write-Host ""
    $choice = Read-Host "Continue with cloud database? (Y/N)"
    if ($choice -ne "Y" -and $choice -ne "y") {
        exit 1
    }
}
else {
    Write-Host "✓ PostgreSQL found" -ForegroundColor Green
}

# Install dependencies
Write-Host ""
Write-Host "[3/6] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Root dependencies installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Root dependencies installed" -ForegroundColor Green

Set-Location backend_api
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend dependencies installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Set-Location ..

# Configure environment
Write-Host ""
Write-Host "[4/6] Configuring environment..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}
else {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file from template" -ForegroundColor Green
}

Write-Host ""
Write-Host "IMPORTANT: Please configure your .env file with:" -ForegroundColor Yellow
Write-Host "  - DATABASE_URL (PostgreSQL connection string)" -ForegroundColor Yellow
Write-Host "  - JWT_SECRET (secure random string)" -ForegroundColor Yellow
Write-Host "  - Admin wallet is already set to: 0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402" -ForegroundColor Cyan
Write-Host ""
$configured = Read-Host "Have you configured the .env file? (Y/N)"
if ($configured -ne "Y" -and $configured -ne "y") {
    Write-Host "Please edit .env file and run this script again" -ForegroundColor Yellow
    notepad .env
    exit 0
}

# Initialize database
Write-Host ""
Write-Host "[5/6] Initializing database..." -ForegroundColor Yellow
Set-Location backend_api
node init-db.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Database initialization failed" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL and try again" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}
Write-Host "✓ Database initialized successfully" -ForegroundColor Green
Set-Location ..

# Complete
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Installation Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start the server: npm start" -ForegroundColor White
Write-Host "  2. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "  3. Login as admin:" -ForegroundColor White
Write-Host "     Email: admin@soundprofit.market" -ForegroundColor Yellow
Write-Host "     Password: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Admin wallet for commissions:" -ForegroundColor Cyan
Write-Host "  0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to start the server..." -ForegroundColor Green
pause

# Start server
npm start
