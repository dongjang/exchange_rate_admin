package com.example.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class UserRemittanceLimitResponse {
    // 실제 이체 가능한 한도
    private BigDecimal dailyLimit;
    private BigDecimal monthlyLimit;
    private BigDecimal singleLimit;
    private String limitType;
    
    // 원본 한도 (실제 이체 가능한 한도 계산용)
    private BigDecimal originalDailyLimit;
    private BigDecimal originalMonthlyLimit;
    
    // 오늘/이번 달 송금한 금액
    private BigDecimal todayAmount;
    private BigDecimal monthAmount;
} 