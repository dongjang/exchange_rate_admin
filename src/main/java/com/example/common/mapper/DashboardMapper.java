package com.example.common.mapper;

import com.example.user.dto.UserStats;
import com.example.common.dto.DashboardStatsResponse;
import com.example.common.dto.ExchangeRateStats;
import com.example.common.dto.FavoriteCurrencyTop5;
import com.example.remittance.dto.RecentRemittanceCount;
import com.example.remittance.dto.RemittanceStats;
import com.example.support.dto.QnaPendingItem;
import com.example.support.dto.QnaStats;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DashboardMapper {
    
    /**
     * 대시보드 통합 통계 조회
     */
    DashboardStatsResponse selectDashboardStats();
    
    /**
     * 송금 통계 조회
     */
    RemittanceStats selectRemittanceStats();
    
    /**
     * 최근 7일 송금 건수 조회
     */
    List<RecentRemittanceCount> selectRecent7DaysRemittanceCount();
    
    /**
     * 사용자 통계 조회
     */
    UserStats selectUserStats();
    
    /**
     * 환율 통계 조회
     */
    ExchangeRateStats selectExchangeRateStats();
    
    /**
     * 관심 환율 TOP5 조회
     */
    List<FavoriteCurrencyTop5> selectFavoriteCurrencyTop5();
    
    /**
     * Q&A 통계 조회
     */
    QnaStats selectQnaStats();
    
    /**
     * 답변 대기 중인 Q&A 리스트 조회
     */
    List<QnaPendingItem> selectPendingQnaList();
} 