# GitHub Secrets 설정 가이드

## 필요한 Secrets 목록

### AWS 관련
- `AWS_ACCESS_KEY_ID`: AWS IAM 사용자의 Access Key ID
- `AWS_SECRET_ACCESS_KEY`: AWS IAM 사용자의 Secret Access Key

### 데이터베이스 관련
- `DB_USERNAME`: RDS MySQL 사용자명
- `DB_PASSWORD`: RDS MySQL 비밀번호

### Redis 관련
- `REDIS_PASSWORD`: ElastiCache Redis 비밀번호 (선택사항)

### OAuth 관련
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret

### 이메일 관련
- `GMAIL_USERNAME`: Gmail 계정 (예: your-app@gmail.com)
- `GMAIL_APP_PASSWORD`: Gmail 앱 비밀번호

### API 관련
- `EXCHANGE_API_KEY`: 환율 API 키

### S3 관련
- `S3_BUCKET_NAME`: S3 버킷 이름
- `AWS_REGION`: AWS 리전 (예: ap-northeast-2)

### 알림 관련 (선택사항)
- `SLACK_WEBHOOK`: Slack 웹훅 URL

## GitHub Secrets 설정 방법

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. Name과 Secret Value 입력
4. "Add secret" 클릭

## 환경별 Secrets 관리

### Production 환경
- `DB_HOST`: exadmin-mysql.abc123.ap-northeast-2.rds.amazonaws.com
- `REDIS_HOST`: exadmin-redis.abc123.cache.amazonaws.com
- `S3_BUCKET_NAME`: exadmin-uploads-20241214

### Staging 환경
- `DB_HOST`: exadmin-staging-mysql.abc123.ap-northeast-2.rds.amazonaws.com
- `REDIS_HOST`: exadmin-staging-redis.abc123.cache.amazonaws.com
- `S3_BUCKET_NAME`: exadmin-staging-uploads

## 보안 주의사항

1. **절대 코드에 하드코딩하지 마세요**
2. **환경변수 파일을 Git에 커밋하지 마세요**
3. **정기적으로 Secrets를 로테이션하세요**
4. **최소 권한 원칙을 적용하세요**

