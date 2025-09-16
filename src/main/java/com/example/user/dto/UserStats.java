package com.example.user.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserStats {
    private Long totalUsers;
    private Long newUsers;
    private Long activeUsers;
    private Long inactiveUsers;
} 