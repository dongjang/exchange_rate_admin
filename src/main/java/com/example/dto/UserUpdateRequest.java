package com.example.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String email;
    private String name;
    private String pictureUrl;
} 