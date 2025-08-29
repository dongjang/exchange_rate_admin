package com.example.mapper;

import com.example.dto.RemittanceHistoryResponse;
import com.example.dto.RemittanceHistorySearchRequest;
import com.example.dto.RemittanceStats;
import com.example.dto.RecentRemittanceCount;
import com.example.dto.UserLimitsResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface RemittanceMapper {
    
    /**
     * 송금 통계 조회
     */
    RemittanceStats selectRemittanceStats();
    
    /**
     * 최근 7일 송금 건수 조회
     */
    List<RecentRemittanceCount> selectRecent7DaysRemittanceCount();
    
    /**
     * 관리자용 송금 이력 조회
     */
    List<RemittanceHistoryResponse> selectRemittanceHistory(RemittanceHistorySearchRequest search);
    
    /**
     * 관리자용 송금 이력 개수 조회
     */
    int countRemittanceHistory(RemittanceHistorySearchRequest search);
    
    /**
     * 일일 한도 조회
     */
    BigDecimal getDailyLimit(@Param("userId") Long userId);
    
    /**
     * 월 한도 조회
     */
    BigDecimal getMonthlyLimit(@Param("userId") Long userId);
    
    /**
     * 사용자별 한도 조회
     */
    UserLimitsResponse getUserLimits(@Param("userId") Long userId);
} 