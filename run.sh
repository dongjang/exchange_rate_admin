#!/bin/bash

echo "========================================"
echo "   Exchange Rate Management System"
echo "   Production Deployment Script"
echo "========================================"
echo

# 환경변수 설정 (GitHub Actions 환경변수 사용)
# GitHub Actions에서 설정된 환경변수들을 Docker에서 사용

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
docker-compose -f docker-compose.prod.yml down

echo "프로덕션 환경으로 실행 중..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "모니터링 도구 실행 중..."
docker-compose -f docker-compose.monitoring.yml up -d

echo
echo "========================================"
echo "실행 완료!"
echo
echo "Admin App: http://43.201.130.137:8080"
echo "User App:  http://43.201.130.137:8081"
echo
echo "모니터링:"
echo "  Grafana:    http://43.201.130.137:3000"
echo "  Prometheus: http://43.201.130.137:9090"
echo
echo "로그 확인: docker-compose -f docker-compose.prod.yml logs -f"
echo "중지:     docker-compose -f docker-compose.prod.yml down"
echo "========================================"
