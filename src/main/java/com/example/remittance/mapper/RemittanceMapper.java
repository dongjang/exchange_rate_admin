package com.example.remittance.mapper;

import java.math.BigDecimal;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.remittance.dto.RecentRemittanceCount;
import com.example.remittance.dto.RemittanceHistoryResponse;
import com.example.remittance.dto.RemittanceHistorySearchRequest;
import com.example.remittance.dto.RemittanceStats;

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
     * 송금 이력 조회
     */
    List<RemittanceHistoryResponse> selectRemittanceHistory(RemittanceHistorySearchRequest search);
    
    /**
     * 송금 이력 개수 조회
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
    
} 