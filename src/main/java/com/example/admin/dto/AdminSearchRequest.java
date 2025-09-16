package com.example.admin.dto;

import lombok.Data;

@Data
public class AdminSearchRequest {
    private String name;
    private String adminId;
    private String email;
    private String role;
    private String status;
    private String sortOrder;
    private int page;
    private int size;
}
