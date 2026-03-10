# EcoPredict Docker Stop Script for Windows

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Stopping EcoPredict Services" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ All services stopped successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "To remove all data (volumes), run:" -ForegroundColor Yellow
    Write-Host "  docker-compose down -v" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to stop services" -ForegroundColor Red
    exit 1
}
