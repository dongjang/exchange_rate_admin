#!/bin/bash

# 환경변수 로드
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "========================================"
echo "   Exchange Rate Management System"
echo "   Production Deployment Script"
echo "========================================"
echo

# 필수 환경변수 확인
required_vars=(
    "DB_URL"
    "DB_USERNAME"
    "DB_PASSWORD"
    "GMAIL_USERNAME"
    "GMAIL_APP_PASSWORD"
    "S3_BUCKET_NAME"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "AWS_REGION"
    "EXCHANGE_API_KEY"
    "CORS_ALLOWED_ORIGINS"
    "GRAFANA_ADMIN_PASSWORD"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Warning: $var environment variable is not set!"
        echo "Please check if environment variables are set in GitHub Actions."
        echo
        exit 1
    fi
done

echo "환경변수 설정 완료!"
echo

# ============================================
# 1단계: 완전 정리
# ============================================
echo "1단계: 기존 컨테이너 및 프로세스 완전 정리 중..."

# Java 프로세스 종료 (Docker 외부에서 실행 중인 경우)
# 8080 포트를 사용하는 Java 프로세스만 종료 (사용자 쪽 8081, 3001 포트는 제외)
echo "Admin App Java 프로세스 종료 중..."
PID_8080=$(sudo lsof -ti:8080 2>/dev/null || true)
if [ ! -z "$PID_8080" ]; then
    echo "8080 포트 사용 프로세스 종료 중... (PID: $PID_8080)"
    sudo kill -9 $PID_8080 2>/dev/null || true
    sleep 2
else
    echo "8080 포트를 사용하는 프로세스가 없습니다."
fi

# 모든 관련 컨테이너 중지 및 제거
docker stop exadmin-admin-app exchange-rate-grafana exchange-rate-prometheus exchange-rate-node-exporter shared-redis 2>/dev/null || true
docker rm -f exadmin-admin-app exchange-rate-grafana exchange-rate-prometheus exchange-rate-node-exporter shared-redis 2>/dev/null || true

# Docker Compose로 정리
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.monitoring.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.redis.yml down --remove-orphans 2>/dev/null || true

# 네트워크 정리
docker network rm shared-network 2>/dev/null || true

echo "정리 완료!"
echo

# ============================================
# 2단계: Redis 시작
# ============================================
echo "2단계: Redis 서비스 시작 중..."
docker-compose -f docker-compose.redis.yml up -d

# Redis 시작 대기
echo "Redis 시작 대기 중..."
sleep 5

# Redis 상태 확인
if docker ps | grep -q "shared-redis"; then
    echo "✓ Redis 시작 성공!"
else
    echo "✗ Redis 시작 실패!"
    docker logs shared-redis
    exit 1
fi
echo

# ============================================
# 3단계: Admin App 시작
# ============================================
echo "3단계: Admin App 시작 중..."
docker-compose -f docker-compose.prod.yml up -d

# Admin App 시작 대기
echo "Admin App 시작 대기 중..."
sleep 10

# Admin App 상태 확인
if docker ps | grep -q "exadmin-admin-app"; then
    echo "✓ Admin App 시작 성공!"
else
    echo "✗ Admin App 시작 실패!"
    docker logs exadmin-admin-app 2>/dev/null || echo "컨테이너가 생성되지 않았습니다."
    exit 1
fi
echo

# ============================================
# 4단계: 모니터링 도구 시작
# ============================================
echo "4단계: 모니터링 도구 시작 중..."
docker-compose -f docker-compose.monitoring.yml up -d

# 모니터링 도구 시작 대기
echo "모니터링 도구 시작 대기 중..."
sleep 5

echo "✓ 모니터링 도구 시작 완료!"
echo

# ============================================
# 최종 상태 확인
# ============================================
echo "========================================"
echo "최종 상태 확인:"
echo "========================================"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo

echo "========================================"
echo "실행 완료!"
echo
echo "Admin App: http://43.201.130.137:8080"
echo
echo "모니터링:"
echo "  Grafana:    http://43.201.130.137:3000"
echo "  Prometheus: http://43.201.130.137:9090"
echo
echo "로그 확인: docker logs -f exadmin-admin-app"
echo "중지:     docker-compose -f docker-compose.prod.yml down"
echo "========================================"