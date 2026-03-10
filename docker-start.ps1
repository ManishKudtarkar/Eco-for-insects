# EcoPredict Docker Startup Script for Windows
# Usage: .\docker-start.ps1 [production|development]

param(
    [string]$Mode = "production"
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  EcoPredict Docker Startup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
docker version > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
    Write-Host "WARNING: Please update SECRET_KEY in .env for production!" -ForegroundColor Yellow
    Write-Host ""
}

# Check if models exist
if (-not (Test-Path "models/ecopredict.pkl")) {
    Write-Host "WARNING: ML models not found. Training model..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    python src/train_model.py
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Model training failed. Check src/train_model.py" -ForegroundColor Red
        Write-Host "You can continue, but predictions will fail until models are trained." -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "✓ Models trained successfully" -ForegroundColor Green
        Write-Host ""
    }
}

# Start Docker Compose
Write-Host "Starting services in $Mode mode..." -ForegroundColor Yellow
Write-Host ""

if ($Mode -eq "development") {
    Write-Host "Running in DEVELOPMENT mode with hot reload..." -ForegroundColor Cyan
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d --build
} else {
    Write-Host "Running in PRODUCTION mode..." -ForegroundColor Cyan
    docker-compose up -d --build
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  Services Started Successfully!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your services:" -ForegroundColor Cyan
    Write-Host "  Frontend:     http://localhost:8080" -ForegroundColor White
    Write-Host "  API:          http://localhost:8000" -ForegroundColor White
    Write-Host "  API Docs:     http://localhost:8000/docs" -ForegroundColor White
    Write-Host "  Prometheus:   http://localhost:9090" -ForegroundColor White
    Write-Host "  Grafana:      http://localhost:3000 (admin/admin)" -ForegroundColor White
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Cyan
    Write-Host "  docker-compose logs -f" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Stop services:" -ForegroundColor Cyan
    Write-Host "  docker-compose down" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to start services" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose logs" -ForegroundColor Yellow
    exit 1
}
