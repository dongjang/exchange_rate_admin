package com.example.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    private RemittanceStats remittanceStats;
    private UserStats userStats;
    private ExchangeRateStats exchangeRateStats;
    private QnaStats qnaStats;
} 