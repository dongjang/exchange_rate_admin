package com.example.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdminResponse {
    private Long id;
    private String adminId;
    private String password;
    private String name;
    private String email;
    private String role;
    private String status;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String updatedAdminName;
    private Long updatedAdminId;
}
