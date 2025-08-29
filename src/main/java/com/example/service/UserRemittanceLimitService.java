package com.example.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dto.UserLimitsResponse;
import com.example.dto.UserRemittanceLimitResponse;
import com.example.mapper.RemittanceMapper;
import com.example.repository.DefaultRemittanceLimitRepository;
import com.example.repository.RemittanceRepository;
import com.example.repository.UserRemittanceLimitRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserRemittanceLimitService {
    
    private final UserRemittanceLimitRepository userRemittanceLimitRepository;
    private final DefaultRemittanceLimitRepository defaultRemittanceLimitRepository;
    private final RemittanceRepository remittanceRepository;
    private final RemittanceMapper remittanceMapper;
    
    /**
     * 사용자의 송금 한도를 조회합니다.
     * 새로운 쿼리를 사용하여 정확한 한도 계산을 수행합니다.
     */
    @Transactional(readOnly = true)
    public UserRemittanceLimitResponse getUserRemittanceLimit(Long userId) {
        // 새로운 쿼리로 일일 한도와 월 한도 조회
        BigDecimal availableDailyLimit = remittanceMapper.getDailyLimit(userId);
        BigDecimal availableMonthlyLimit = remittanceMapper.getMonthlyLimit(userId);
        
        // 사용자별 한도 조회 (단일 한도용)
        UserLimitsResponse userLimits = remittanceMapper.getUserLimits(userId);
        
        UserRemittanceLimitResponse response = new UserRemittanceLimitResponse();
        
        // 0보다 작으면 0으로 설정
        if (availableDailyLimit.compareTo(BigDecimal.ZERO) < 0) {
            availableDailyLimit = BigDecimal.ZERO;
        }
        if (availableMonthlyLimit.compareTo(BigDecimal.ZERO) < 0) {
            availableMonthlyLimit = BigDecimal.ZERO;
        }
        
        // 응답 설정
        response.setDailyLimit(availableDailyLimit);
        response.setMonthlyLimit(availableMonthlyLimit);
        response.setOriginalDailyLimit(userLimits.getDailyLimit());
        response.setOriginalMonthlyLimit(userLimits.getMonthlyLimit());
        response.setSingleLimit(userLimits.getSingleLimit());
        
        // 한도 타입 설정
        String limitType = userLimits.getLimitType();
        response.setLimitType(limitType);
        
        return response;
    }
    
    /**
     * 사용자별 한도 존재 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean existsUserLimit(Long userId) {
        return userRemittanceLimitRepository.existsByUserId(userId);
    }
} 