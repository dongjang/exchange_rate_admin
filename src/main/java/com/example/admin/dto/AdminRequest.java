package com.example.admin.dto;

import lombok.Data;

@Data
public class AdminRequest {
    private String adminId;
    private String password;
    private String name;
    private String email;
    private String role;
    private String status;
}
