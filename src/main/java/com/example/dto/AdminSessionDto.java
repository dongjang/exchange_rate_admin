package com.example.dto;

import lombok.Data;

/**
 * Admin 세션 정보를 담는 DTO
 * HttpSession에 저장되는 관리자 인증 정보를 관리합니다.
 */
@Data
public class AdminSessionDto {
    private Long adminId;           // 관리자 ID
    private String email;           // 관리자 이메일
    private String name;            // 관리자 이름
    private String role;            // 관리자 역할 (ADMIN, SUPER_ADMIN)
    private String status;          // 관리자 상태 (ACTIVE, INACTIVE)
    private Long loginTime;         // 로그인 시간 (timestamp)
}
