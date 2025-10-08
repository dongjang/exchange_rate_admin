#!/bin/bash

echo "========================================"
echo "   Complete Docker Cleanup Script"
echo "========================================"
echo

# 1. 모든 컨테이너 강제 중지 및 제거
echo "1. 모든 컨테이너 중지 및 제거 중..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true

# 2. 프로젝트 관련 네트워크 제거
echo "2. 네트워크 정리 중..."
docker network rm shared-network 2>/dev/null || true
docker network rm exchange_rate_admin_exadmin-network 2>/dev/null || true
docker network rm exchange_rate_admin_exchange-rate-network 2>/dev/null || true

# 3. Docker Compose로 완전 정리
echo "3. Docker Compose 정리 중..."
docker-compose -f docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.monitoring.yml down -v --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.redis.yml down -v --remove-orphans 2>/dev/null || true

# 4. 포트 확인
echo "4. 포트 사용 확인 중..."
echo "8080 포트:"
sudo lsof -i :8080 2>/dev/null || echo "  사용 안 함 ✓"
echo "6379 포트:"
sudo lsof -i :6379 2>/dev/null || echo "  사용 안 함 ✓"
echo "3000 포트:"
sudo lsof -i :3000 2>/dev/null || echo "  사용 안 함 ✓"
echo "9090 포트:"
sudo lsof -i :9090 2>/dev/null || echo "  사용 안 함 ✓"

echo
echo "========================================"
echo "정리 완료!"
echo "이제 ./run.sh를 실행하세요."
echo "========================================"
