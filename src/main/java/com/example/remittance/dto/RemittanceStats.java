package com.example.remittance.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RemittanceStats {
    private Long totalCount;
    private Double averageAmount;
    private Long maxAmount;
    private Long totalAmount;
    private Long dailyCount;
    private Long monthlyCount;
    private Long yearlyCount;
    private Long dailyAverageAmount;
    private Long monthlyAverageAmount;
    private Long yearlyAverageAmount;
    private Long dailyMaxAmount;
    private Long monthlyMaxAmount;
    private Long yearlyMaxAmount;
} 