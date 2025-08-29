package com.example.enums;

/**
 * 세션 타입 enum
 * - 사용자와 관리자 세션을 구분
 */
public enum SessionType {
    USER("user"),
    ADMIN("admin");
    
    private final String value;
    
    SessionType(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}
