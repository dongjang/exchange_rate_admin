package com.example.dto;

import com.example.domain.User;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private String pictureUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
    private String status;

    public UserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.pictureUrl = user.getPictureUrl();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
        this.lastLoginAt = user.getLastLoginAt();
        this.status = user.getStatus();
    }
} 