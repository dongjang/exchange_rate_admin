# Spring Boot 프로파일 테스트

## 🧪 테스트 시나리오

### 시나리오 1: application.yml 있음
```yaml
# application.yml
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}

# 실행 결과
./gradlew bootRun
# → application-local.yml 자동 로드 ✅
```

### 시나리오 2: application.yml 없음
```yaml
# application.yml 삭제 후
./gradlew bootRun
# → 어떤 프로파일도 로드되지 않음 ❌
# → 기본 설정만 사용 (데이터베이스 연결 실패)
```

## 📋 현재 파일 구조 분석

### 필요한 파일들
```
src/main/resources/
├── application.yml          # ✅ 필요 (기본 프로파일 + 공통 설정)
├── application-local.yml    # ✅ 필요 (로컬 개발환경)
├── application-prod.yml     # ✅ 필요 (운영환경)
└── application-docker.yml   # ✅ 필요 (Docker환경)
```

### 제거 가능한 파일들
```
❌ 없음 (모든 파일이 필요)
```

## 🎯 application.yml이 필요한 이유

### 1. 기본 프로파일 지정
```yaml
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}
```
- **환경변수 없을 때**: `local` 프로파일 사용
- **환경변수 있을 때**: 해당 프로파일 사용

### 2. 공통 설정 제공
```yaml
mybatis:
  mapper-locations: classpath:mapper/**/*.xml
  type-aliases-package: com.example.domain

mvc:
  throw-exception-if-no-handler-found: true
```
- **모든 환경에서 동일**: 중복 제거
- **유지보수 용이**: 한 곳에서 관리

### 3. Spring Boot 표준
- **Spring Boot 권장사항**: application.yml + application-{profile}.yml
- **업계 표준**: 대부분의 프로젝트에서 사용
- **문서화**: Spring Boot 공식 문서에서 권장

## 🔄 대안 방안

### 방안 1: application.yml 제거 (권장하지 않음)
```yaml
# application-local.yml에 모든 설정 포함
spring:
  profiles:
    active: local  # 하드코딩
  # ... 모든 설정
```
**문제점**: 환경변수로 프로파일 변경 불가능

### 방안 2: application.yml 유지 (권장)
```yaml
# application.yml (공통 설정)
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}

# application-local.yml (로컬 전용)
spring:
  devtools: ...
  datasource: ...
```
**장점**: 유연성과 유지보수성 확보

## 🎯 결론

**application.yml은 반드시 필요합니다!**

### 이유:
1. **기본 프로파일 지정**: 환경변수 없을 때 기본값 제공
2. **공통 설정**: 모든 환경에서 공유되는 설정
3. **Spring Boot 표준**: 권장되는 구조
4. **유연성**: 환경변수로 프로파일 변경 가능

### 최종 구조:
```
src/main/resources/
├── application.yml          # 기본 프로파일 + 공통 설정
├── application-local.yml    # 로컬 개발환경
├── application-prod.yml     # 운영환경
└── application-docker.yml   # Docker환경
```

**4개 파일 모두 필요하며, 각각 고유한 역할을 합니다!** 🚀
