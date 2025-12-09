# SoundProfit Market - Local Launcher
# Double click to run!

Write-Host "🎵 Initializing SoundProfit Market..." -ForegroundColor Cyan

# Check for Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed! Please install it from nodejs.org"
    Pause
    Exit
}

# Install Deps
Write-Host "📦 Installing dependencies..."
npm install
cd backend_api
npm install
cd ..

# Setup Env
if (-not (Test-Path .env)) {
    Write-Host "⚙️ Creating default .env for local testing..."
    Copy-Item .env.example .env
}

# Fix missing DB URL for local if needed (Mock logic or local PG)
# For this script we assume local Postgres is tricky, so we warn if not set
# But actually, let's try to run the frontend-only mode if DB fails or warn user.
Write-Host "🚀 Starting Application..."
Write-Host "   -> Open your browser to http://localhost:3000"

npm start
