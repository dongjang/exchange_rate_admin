#!/bin/bash

# EC2 자동 배포 스크립트
# 사용법: ./deploy.sh [admin|user|both]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경변수 파일 확인
check_env_file() {
    if [ ! -f ".env" ]; then
        log_error ".env 파일이 없습니다!"
        log_info "환경변수를 설정해주세요:"
        echo ""
        echo "# 데이터베이스 설정"
        echo "DB_URL=\"jdbc:mysql://your-rds-endpoint:3306/database_name?useSSL=false&allowPublicKeyRetrieval=true\""
        echo "DB_USERNAME=\"your_username\""
        echo "DB_PASSWORD=\"your_password\""
        echo ""
        echo "# CORS 설정"
        echo "CORS_ALLOWED_ORIGINS=\"http://localhost:5173,https://your-vercel-app.vercel.app\""
        echo ""
        echo "# 이메일 설정"
        echo "GMAIL_USERNAME=\"your_email@gmail.com\""
        echo "GMAIL_APP_PASSWORD=\"your_app_password\""
        echo ""
        echo "# Exchange API"
        echo "EXCHANGE_API_KEY=\"your_exchange_api_key\""
        echo ""
        echo "# AWS S3 설정"
        echo "S3_BUCKET_NAME=\"your_s3_bucket\""
        echo "AWS_ACCESS_KEY_ID=\"your_access_key\""
        echo "AWS_SECRET_ACCESS_KEY=\"your_secret_key\""
        echo "AWS_REGION=\"ap-northeast-2\""
        echo ""
        echo "# Google OAuth (User 프로젝트용)"
        echo "GOOGLE_CLIENT_ID=\"your_google_client_id\""
        echo "GOOGLE_CLIENT_SECRET=\"your_google_client_secret\""
        echo ""
        log_info "위 내용을 .env 파일로 저장하세요: nano .env"
        exit 1
    fi
    log_success ".env 파일 확인 완료"
}

# 기존 프로세스 종료
stop_existing_processes() {
    local app_type=$1
    
    if [ "$app_type" = "admin" ] || [ "$app_type" = "both" ]; then
        log_info "Admin 애플리케이션 프로세스 확인 중..."
        if pgrep -f "server.port=8080" > /dev/null; then
            log_warning "실행 중인 Admin 프로세스 발견, 종료 중..."
            pkill -f "server.port=8080"
            sleep 3
        else
            log_info "실행 중인 Admin 프로세스 없음"
        fi
    fi
    
    if [ "$app_type" = "user" ] || [ "$app_type" = "both" ]; then
        log_info "User 애플리케이션 프로세스 확인 중..."
        if pgrep -f "server.port=8081" > /dev/null; then
            log_warning "실행 중인 User 프로세스 발견, 종료 중..."
            pkill -f "server.port=8081"
            sleep 3
        else
            log_info "실행 중인 User 프로세스 없음"
        fi
    fi
}

# Docker 기반 배포
deploy_with_docker() {
    local app_type=$1
    
    log_info "Docker 기반 배포 시작..."
    
    # 환경변수 로드
    set -a
    source .env
    set +a
    
    if [ "$app_type" = "admin" ]; then
        log_info "Admin 애플리케이션만 배포..."
        docker-compose -f docker-compose.prod.yml up -d admin-app
    elif [ "$app_type" = "user" ]; then
        log_info "User 애플리케이션만 배포..."
        docker-compose -f docker-compose.prod.yml up -d user-app
    else
        log_info "Admin & User 애플리케이션 배포..."
        docker-compose -f docker-compose.prod.yml up -d
    fi
    
    log_success "Docker 배포 완료!"
    
    # 상태 확인
    sleep 10
    docker-compose -f docker-compose.prod.yml ps
}

# JAR 기반 배포
deploy_with_jar() {
    local app_type=$1
    
    log_info "JAR 기반 배포 시작..."
    
    # 프로젝트 빌드
    log_info "프로젝트 빌드 중..."
    ./gradlew clean build -x test
    
    # 환경변수 로드
    set -a
    source .env
    set +a
    
    if [ "$app_type" = "admin" ] || [ "$app_type" = "both" ]; then
        log_info "Admin 애플리케이션 시작..."
        nohup java -jar build/libs/exProject-0.0.1-SNAPSHOT.jar \
            --spring.profiles.active=prod \
            --server.port=8080 > admin_app.log 2>&1 &
        log_success "Admin 애플리케이션 시작됨 (PID: $!)"
    fi
    
    if [ "$app_type" = "user" ] || [ "$app_type" = "both" ]; then
        log_info "User 애플리케이션 시작..."
        nohup java -jar build/libs/exProject-0.0.1-SNAPSHOT.jar \
            --spring.profiles.active=prod \
            --server.port=8081 > user_app.log 2>&1 &
        log_success "User 애플리케이션 시작됨 (PID: $!)"
    fi
    
    # 상태 확인
    sleep 15
    check_application_status $app_type
}

# 애플리케이션 상태 확인
check_application_status() {
    local app_type=$1
    
    log_info "애플리케이션 상태 확인 중..."
    
    if [ "$app_type" = "admin" ] || [ "$app_type" = "both" ]; then
        if pgrep -f "server.port=8080" > /dev/null; then
            log_success "Admin 애플리케이션 실행 중 (포트 8080)"
        else
            log_error "Admin 애플리케이션 실행 실패"
        fi
        
        if netstat -tlnp | grep :8080 > /dev/null; then
            log_success "포트 8080 열림"
        else
            log_error "포트 8080이 열려있지 않음"
        fi
    fi
    
    if [ "$app_type" = "user" ] || [ "$app_type" = "both" ]; then
        if pgrep -f "server.port=8081" > /dev/null; then
            log_success "User 애플리케이션 실행 중 (포트 8081)"
        else
            log_error "User 애플리케이션 실행 실패"
        fi
        
        if netstat -tlnp | grep :8081 > /dev/null; then
            log_success "포트 8081 열림"
        else
            log_error "포트 8081이 열려있지 않음"
        fi
    fi
}

# 로그 확인
show_logs() {
    local app_type=$1
    local lines=${2:-30}
    
    log_info "최근 로그 확인 (최근 $lines 줄)..."
    
    if [ "$app_type" = "admin" ] || [ "$app_type" = "both" ]; then
        if [ -f "admin_app.log" ]; then
            log_info "=== Admin 애플리케이션 로그 ==="
            tail -$lines admin_app.log
        fi
    fi
    
    if [ "$app_type" = "user" ] || [ "$app_type" = "both" ]; then
        if [ -f "user_app.log" ]; then
            log_info "=== User 애플리케이션 로그 ==="
            tail -$lines user_app.log
        fi
    fi
}

# 도움말
show_help() {
    echo "사용법: $0 [옵션] [앱타입]"
    echo ""
    echo "옵션:"
    echo "  -d, --docker    Docker 기반 배포"
    echo "  -j, --jar       JAR 기반 배포 (기본값)"
    echo "  -l, --logs      로그 확인"
    echo "  -s, --status    상태 확인"
    echo "  -h, --help      도움말"
    echo ""
    echo "앱타입:"
    echo "  admin          Admin 애플리케이션만"
    echo "  user           User 애플리케이션만"
    echo "  both           Admin & User 애플리케이션 (기본값)"
    echo ""
    echo "예시:"
    echo "  $0                    # JAR로 Admin & User 배포"
    echo "  $0 -d admin           # Docker로 Admin만 배포"
    echo "  $0 -j user            # JAR로 User만 배포"
    echo "  $0 -l admin           # Admin 로그 확인"
    echo "  $0 -s                 # 전체 상태 확인"
}

# 메인 함수
main() {
    local deploy_method="jar"
    local app_type="both"
    local action="deploy"
    
    # 인자 파싱
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d|--docker)
                deploy_method="docker"
                shift
                ;;
            -j|--jar)
                deploy_method="jar"
                shift
                ;;
            -l|--logs)
                action="logs"
                shift
                ;;
            -s|--status)
                action="status"
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            admin|user|both)
                app_type=$1
                shift
                ;;
            *)
                log_error "알 수 없는 옵션: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    log_info "=== EC2 자동 배포 스크립트 ==="
    log_info "배포 방법: $deploy_method"
    log_info "앱 타입: $app_type"
    log_info "액션: $action"
    
    case $action in
        "deploy")
            check_env_file
            stop_existing_processes $app_type
            
            if [ "$deploy_method" = "docker" ]; then
                deploy_with_docker $app_type
            else
                deploy_with_jar $app_type
            fi
            ;;
        "logs")
            show_logs $app_type
            ;;
        "status")
            check_application_status $app_type
            ;;
    esac
    
    log_success "작업 완료!"
}

# 스크립트 실행
main "$@"
