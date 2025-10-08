#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Warning: .env file not found!"
    echo "Please create .env file with required environment variables."
    exit 1
fi

echo "========================================"
echo "   Exchange Rate Management System"
echo "   Production Deployment Script"
echo "========================================"
echo

# 환경변수 검증
if [ -z "$DB_URL" ]; then
    echo "경고: DB_URL 환경변수가 설정되지 않았습니다!"
    echo "GitHub Actions에서 환경변수를 설정했는지 확인하세요."
    echo
    exit 1
fi

if [ -z "$DB_USERNAME" ]; then
    echo "경고: DB_USERNAME 환경변수가 설정되지 않았습니다!"
    echo "GitHub Actions에서 환경변수를 설정했는지 확인하세요."
    echo
    exit 1
fi

if [ -z "$GMAIL_USERNAME" ]; then
    echo "경고: GMAIL_USERNAME 환경변수가 설정되지 않았습니다!"
    echo "GitHub Actions에서 환경변수를 설정했는지 확인하세요."
    echo
    exit 1
fi

echo "환경변수 설정 완료!"
echo

echo "기존 컨테이너 정리 중..."
# 모든 관련 컨테이너와 네트워크 정리
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.monitoring.yml down --remove-orphans
docker-compose -f docker-compose.redis.yml down --remove-orphans

# 포트 충돌 방지를 위한 추가 정리 (이 프로젝트 컨테이너만)
echo "포트 충돌 방지를 위한 정리 중..."
docker stop exadmin-admin-app 2>/dev/null || true
docker stop exchange-rate-grafana 2>/dev/null || true
docker stop exchange-rate-prometheus 2>/dev/null || true
docker stop exchange-rate-node-exporter 2>/dev/null || true
docker stop shared-redis 2>/dev/null || true
docker rm shared-redis 2>/dev/null || true

echo "Redis 서비스 확인 중..."
# Redis가 실행 중이 아니면 시작
if ! docker ps | grep -q "shared-redis"; then
    echo "Redis 서비스 시작 중..."
    docker-compose -f docker-compose.redis.yml up -d
    sleep 5
fi

echo "프로덕션 환경으로 실행 중..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "모니터링 도구 실행 중..."
docker-compose -f docker-compose.monitoring.yml up -d

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
echo "로그 확인: docker-compose -f docker-compose.prod.yml logs -f"
echo "중지:     docker-compose -f docker-compose.prod.yml down"
echo "========================================"
