package com.example.mapper;

import com.example.dto.RemittanceHistoryResponse;
import com.example.dto.RemittanceHistorySearchRequest;
import com.example.dto.RemittanceStats;
import com.example.dto.RecentRemittanceCount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

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
} 