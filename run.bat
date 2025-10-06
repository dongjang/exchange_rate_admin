@echo off
echo ========================================
echo    Exchange Rate Management System
echo    Production Deployment Script
echo ========================================
echo.

REM Environment variables setup (using GitHub Actions environment variables)
REM Environment variables set in GitHub Actions are used in Docker

REM Environment variable validation
if "%DB_URL%"=="" (
    echo Warning: DB_URL environment variable is not set!
    echo Please check if environment variables are set in GitHub Actions.
    echo.
    pause
    exit /b 1
)

if "%DB_USERNAME%"=="" (
    echo Warning: DB_USERNAME environment variable is not set!
    echo Please check if environment variables are set in GitHub Actions.
    echo.
    pause
    exit /b 1
)

if "%GMAIL_USERNAME%"=="" (
    echo Warning: GMAIL_USERNAME environment variable is not set!
    echo Please check if environment variables are set in GitHub Actions.
    echo.
    pause
    exit /b 1
)

if "%GRAFANA_ADMIN_PASSWORD%"=="" (
    echo Warning: GRAFANA_ADMIN_PASSWORD environment variable is not set!
    echo Please check if environment variables are set in GitHub Actions.
    echo.
    pause
    exit /b 1
)

echo Environment variables setup complete!
echo.

echo Cleaning up existing containers...
docker-compose -f docker-compose.prod.yml down

echo Running in production environment...
docker-compose -f docker-compose.prod.yml up -d --build

echo Starting monitoring tools...
docker-compose -f docker-compose.monitoring.yml up -d

echo.
echo ========================================
echo Execution completed!
echo.
echo Admin App: http://43.201.130.137:8080
echo User App:  http://43.201.130.137:8081
echo.
echo Monitoring:
echo   Grafana:    http://43.201.130.137:3000
echo   Prometheus: http://43.201.130.137:9090
echo.
echo Check logs: docker-compose -f docker-compose.prod.yml logs -f
echo Stop:      docker-compose -f docker-compose.prod.yml down
echo ========================================
pause
