package com.example.dto;

import lombok.Data;

@Data
public class UserSearchRequest {
    private String name;
    private String email;
    private String limitType;
    private String status;
    private String sortOrder;
    private int page;
    private int size;
}
