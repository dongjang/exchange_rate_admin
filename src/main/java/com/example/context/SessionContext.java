package com.example.context;

import lombok.Getter;
import lombok.Setter;

/**
 * 세션 컨텍스트 클래스
 * - ThreadLocal을 사용하여 요청별 세션 정보 저장
 * - 관리자 세션 정보만 관리
 */
@Getter
@Setter
public class SessionContext {
    
    private static final ThreadLocal<SessionContext> contextHolder = new ThreadLocal<>();
    
    // 관리자 정보
    private Long adminId;
    private String adminEmail;
    private String adminName;
    private String adminStatus;
    
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
     * 관리자 세션인지 확인
     */
    public static boolean isAdminSession() {
        SessionContext context = getContext();
        return context != null && context.getAdminId() != null;
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
     * 관리자 상태 조회
     */
    public static String getCurrentAdminStatus() {
        SessionContext context = getContext();
        return context != null ? context.getAdminStatus() : null;
    }
}
