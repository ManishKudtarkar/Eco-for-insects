# Docker Health Check Script for Windows

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  EcoPredict Health Check" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
docker version > $null 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker is running" -ForegroundColor Green
} else {
    Write-Host "✗ Docker is not running" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Checking services..." -ForegroundColor Yellow
Write-Host ""

# Check each service
$services = @(
    @{Name="API"; URL="http://localhost:8000/health"; Port=8000},
    @{Name="Frontend"; URL="http://localhost:8080/health"; Port=8080},
    @{Name="Redis"; Port=6379},
    @{Name="PostgreSQL"; Port=5432},
    @{Name="Prometheus"; Port=9090},
    @{Name="Grafana"; Port=3000}
)

$allHealthy = $true

foreach ($service in $services) {
    Write-Host "$($service.Name):" -NoNewline -ForegroundColor White
    Write-Host " (Port $($service.Port))" -NoNewline -ForegroundColor Gray
    
    if ($service.URL) {
        try {
            $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host " ✓" -ForegroundColor Green
            } else {
                Write-Host " ✗" -ForegroundColor Red
                $allHealthy = $false
            }
        } catch {
            Write-Host " ✗ (Not responding)" -ForegroundColor Red
            $allHealthy = $false
        }
    } else {
        # Check if port is listening
        $connection = Test-NetConnection -ComputerName localhost -Port $service.Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host " ✓" -ForegroundColor Green
        } else {
            Write-Host " ✗" -ForegroundColor Red
            $allHealthy = $false
        }
    }
}

Write-Host ""

if ($allHealthy) {
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  All Services Healthy!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your application:" -ForegroundColor Cyan
    Write-Host "  http://localhost:8080" -ForegroundColor White
} else {
    Write-Host "==================================" -ForegroundColor Yellow
    Write-Host "  Some Services Need Attention" -ForegroundColor Yellow
    Write-Host "==================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Check logs with:" -ForegroundColor Cyan
    Write-Host "  docker-compose logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "Restart services with:" -ForegroundColor Cyan
    Write-Host "  docker-compose restart" -ForegroundColor White
}

Write-Host ""
Write-Host "Container Status:" -ForegroundColor Cyan
docker-compose ps
