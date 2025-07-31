package com.example.mapper;

import com.example.dto.DashboardStatsResponse;
import com.example.dto.RemittanceStats;
import com.example.dto.UserStats;
import com.example.dto.ExchangeRateStats;
import com.example.dto.QnaStats;
import org.apache.ibatis.annotations.Mapper;

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
     * 사용자 통계 조회
     */
    UserStats selectUserStats();
    
    /**
     * 환율 통계 조회
     */
    ExchangeRateStats selectExchangeRateStats();
    
    /**
     * Q&A 통계 조회
     */
    QnaStats selectQnaStats();
} 