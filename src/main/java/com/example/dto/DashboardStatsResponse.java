package com.example.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    private RemittanceStats remittanceStats;
    private List<RecentRemittanceCount> recentRemittanceCount;
    private UserStats userStats;
    private ExchangeRateStats exchangeRateStats;
    private List<FavoriteCurrencyTop5> favoriteCurrencyTop5;
    private QnaStats qnaStats;
    private List<QnaPendingItem> pendingQnaList;
} 