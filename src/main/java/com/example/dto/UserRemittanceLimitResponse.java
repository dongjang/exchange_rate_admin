package com.example.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class UserRemittanceLimitResponse {
    private BigDecimal dailyLimit;
    private BigDecimal monthlyLimit;
    private BigDecimal singleLimit;
    private String limitType; 
} 