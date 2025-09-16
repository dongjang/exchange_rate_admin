package com.example.common.service;

import com.example.common.dto.DashboardStatsResponse;
import com.example.common.dto.ExchangeRateStats;
import com.example.common.dto.FavoriteCurrencyTop5;
import com.example.common.mapper.DashboardMapper;
import com.example.remittance.dto.RecentRemittanceCount;
import com.example.remittance.dto.RemittanceStats;
import com.example.support.dto.QnaPendingItem;
import com.example.support.dto.QnaStats;
import com.example.user.dto.UserStats;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final DashboardMapper dashboardMapper;

    /**
     * 대시보드 통합 통계 조회
     */
    public DashboardStatsResponse getDashboardStats() {

        try {
            // 송금 통계
            RemittanceStats remittanceStats = dashboardMapper.selectRemittanceStats();
            List<RecentRemittanceCount> recentRemittanceCount = dashboardMapper.selectRecent7DaysRemittanceCount();
                        
            // 환율 통계
            ExchangeRateStats exchangeRateStats = dashboardMapper.selectExchangeRateStats();
            List<FavoriteCurrencyTop5> favoriteCurrencyTop5 = dashboardMapper.selectFavoriteCurrencyTop5();

            // 사용자 통계
            UserStats userStats = dashboardMapper.selectUserStats();

            // Q&A 통계
            QnaStats qnaStats = dashboardMapper.selectQnaStats();
            List<QnaPendingItem> pendingQnaList = dashboardMapper.selectPendingQnaList();

            DashboardStatsResponse response = DashboardStatsResponse.builder()
                    .remittanceStats(remittanceStats)
                    .recentRemittanceCount(recentRemittanceCount)
                    .exchangeRateStats(exchangeRateStats)
                    .favoriteCurrencyTop5(favoriteCurrencyTop5)
                    .userStats(userStats)
                    .qnaStats(qnaStats)
                    .pendingQnaList(pendingQnaList)
                    .build();
            
            return response;
        } catch (Exception e) {
            log.error("대시보드 통계 조회 중 오류 발생: ", e);
            throw e;
        }
    }
} 