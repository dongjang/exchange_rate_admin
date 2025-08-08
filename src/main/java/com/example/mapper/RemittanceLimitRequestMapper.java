package com.example.mapper;

import com.example.domain.RemittanceLimitRequest;
import com.example.dto.RemittanceLimitRequestResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface RemittanceLimitRequestMapper {
    
    List<RemittanceLimitRequestResponse> selectRemittanceLimitRequests(@Param("userId") Long userId,
                                                             @Param("status") String status,
                                                             @Param("searchTerm") String searchTerm,
                                                             @Param("offset") int offset,
                                                             @Param("limit") int limit);
    
    int countRemittanceLimitRequests(@Param("userId") Long userId,
                                   @Param("status") String status,
                                   @Param("searchTerm") String searchTerm);
    
    RemittanceLimitRequestResponse selectRemittanceLimitRequestById(@Param("id") Long id);
    
    int insertRemittanceLimitRequest(RemittanceLimitRequest request);
    
    int updateRemittanceLimitRequest(RemittanceLimitRequest request);
    
    int updateRemittanceLimitRequestStatus(@Param("id") Long id,
                                         @Param("status") String status,
                                         @Param("adminId") Long adminId,
                                         @Param("adminComment") String adminComment);
    
    int clearFileIds(@Param("id") Long id);

    int insertUserRemittanceLimit(
        @Param("userId") Long userId,
        @Param("dailyLimit") BigDecimal dailyLimit,
        @Param("monthlyLimit") BigDecimal monthlyLimit,
        @Param("singleLimit") BigDecimal singleLimit,
        @Param("requestId") Long requestId
    );

    int deleteUserRemittanceLimit(@Param("userId") Long userId);
    
    int hasUserRemittanceLimit(@Param("userId") Long userId);
} 