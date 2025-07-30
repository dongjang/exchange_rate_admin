# Exchange Rate & Remittance Application

환율 조회 및 송금 서비스를 제공하는 웹 애플리케이션입니다.

## 🚀 Features

### 환율 조회
- 실시간 환율 정보 조회
- 관심 환율 등록/삭제
- 환율 알림 기능

### 송금 서비스
- 해외 송금 시뮬레이션
- 송금 이력 조회
- 송금 상태 추적

### 사용자 관리
- Google OAuth 로그인
- 사용자 정보 관리
- 은행 계좌 등록

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tool
- **Jotai** for state management
- **React Router** for routing
- **SweetAlert2** for notifications
- **React Select** for dropdowns
- **React Calendar** for date picker

### Backend
- **Spring Boot 3** with Java 17
- **Spring Security** with OAuth2
- **Spring Data JPA** for database access
- **MyBatis** for database access
- **Gradle** for build tool
- **H2 Database** (development)

## 📦 Installation

### Prerequisites
- Node.js 18+
- Java 17+
- Gradle 8+

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
./gradlew bootRun
```

## 🔧 Configuration

### Environment Variables
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret

### Database
- Development: H2 Database (in-memory)
- Production: Configure in `application.yml`
- MySQL

## 📱 Features

### 반응형 디자인
- 모바일/데스크톱 최적화
- 터치 친화적 인터페이스

### 사용자 경험
- 직관적인 네비게이션
- 실시간 데이터 업데이트
- 부드러운 애니메이션

## 🚀 Deployment

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
./gradlew build
java -jar build/libs/exProject-0.0.1-SNAPSHOT.jar
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 