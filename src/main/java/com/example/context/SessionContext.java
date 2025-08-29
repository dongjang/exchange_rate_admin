package com.example.context;

import com.example.enums.SessionType;
import lombok.Getter;
import lombok.Setter;

/**
 * 세션 컨텍스트 클래스
 * - ThreadLocal을 사용하여 요청별 세션 정보 저장
 * - 사용자와 관리자 세션 정보를 통합 관리
 */
@Getter
@Setter
public class SessionContext {
    
    private static final ThreadLocal<SessionContext> contextHolder = new ThreadLocal<>();
    
    // 사용자 정보
    private Long userId;
    private String userEmail;
    private String userName;
    
    // 관리자 정보
    private Long adminId;
    private String adminEmail;
    private String adminName;
    private String adminRole;
    private String adminStatus;
    
    private SessionType sessionType;
    
    /**
     * 컨텍스트 설정
     */
    public static void setContext(SessionContext context) {
        contextHolder.set(context);
    }
    
    /**
     * 컨텍스트 조회
     */
    public static SessionContext getContext() {
        return contextHolder.get();
    }
    
    /**
     * 컨텍스트 초기화
     */
    public static void clear() {
        contextHolder.remove();
    }
    
    /**
     * 사용자 ID 조회
     */
    public static Long getCurrentUserId() {
        SessionContext context = getContext();
        return context != null ? context.getUserId() : null;
    }
    
    /**
     * 사용자 이메일 조회
     */
    public static String getCurrentUserEmail() {
        SessionContext context = getContext();
        return context != null ? context.getUserEmail() : null;
    }
    
    /**
     * 사용자 이름 조회
     */
    public static String getCurrentUserName() {
        SessionContext context = getContext();
        return context != null ? context.getUserName() : null;
    }
    
    /**
     * 세션 타입 조회
     */
    public static SessionType getCurrentSessionType() {
        SessionContext context = getContext();
        return context != null ? context.getSessionType() : null;
    }
    
    /**
     * 사용자 세션인지 확인
     */
    public static boolean isUserSession() {
        return SessionType.USER.equals(getCurrentSessionType());
    }
    
    /**
     * 관리자 세션인지 확인
     */
    public static boolean isAdminSession() {
        return SessionType.ADMIN.equals(getCurrentSessionType());
    }
    
    /**
     * 관리자 ID 조회
     */
    public static Long getCurrentAdminId() {
        SessionContext context = getContext();
        return context != null ? context.getAdminId() : null;
    }
    
    /**
     * 관리자 이메일 조회
     */
    public static String getCurrentAdminEmail() {
        SessionContext context = getContext();
        return context != null ? context.getAdminEmail() : null;
    }
    
    /**
     * 관리자 이름 조회
     */
    public static String getCurrentAdminName() {
        SessionContext context = getContext();
        return context != null ? context.getAdminName() : null;
    }
    
    /**
     * 관리자 권한 조회
     */
    public static String getCurrentAdminRole() {
        SessionContext context = getContext();
        return context != null ? context.getAdminRole() : null;
    }
    
    /**
     * 관리자 상태 조회
     */
    public static String getCurrentAdminStatus() {
        SessionContext context = getContext();
        return context != null ? context.getAdminStatus() : null;
    }
}
