package com.example.service;

import com.example.domain.DefaultRemittanceLimit;
import com.example.domain.UserRemittanceLimit;
import com.example.dto.UserRemittanceLimitResponse;
import com.example.repository.DefaultRemittanceLimitRepository;
import com.example.repository.UserRemittanceLimitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserRemittanceLimitService {
    
    private final UserRemittanceLimitRepository userRemittanceLimitRepository;
    private final DefaultRemittanceLimitRepository defaultRemittanceLimitRepository;
    
    /**
     * 사용자의 송금 한도를 조회합니다.
     * 사용자별 한도가 없으면 기본 한도를 반환합니다.
     */
    @Transactional(readOnly = true)
    public UserRemittanceLimitResponse getUserRemittanceLimit(Long userId) {
        // 사용자별 한도 조회
        UserRemittanceLimit userLimit = userRemittanceLimitRepository.findByUserId(userId).orElse(null);
        
        UserRemittanceLimitResponse response = new UserRemittanceLimitResponse();
        
        if (userLimit != null) {
            // 사용자별 한도가 있는 경우
            response.setDailyLimit(userLimit.getDailyLimit());
            response.setMonthlyLimit(userLimit.getMonthlyLimit());
            response.setSingleLimit(userLimit.getSingleLimit());
            response.setLimitType("USER_LIMIT");
        } else {
            // 기본 한도 조회
            DefaultRemittanceLimit defaultLimit = defaultRemittanceLimitRepository.findByIsActiveTrue().orElse(null);
            
            if (defaultLimit != null) {
                response.setDailyLimit(defaultLimit.getDailyLimit());
                response.setMonthlyLimit(defaultLimit.getMonthlyLimit());
                response.setSingleLimit(defaultLimit.getSingleLimit());
                response.setLimitType("DEFAULT_LIMIT");
            } else {
                // 기본 한도도 없으면 기본값 설정
                response.setDailyLimit(BigDecimal.valueOf(1000000)); // 100만원
                response.setMonthlyLimit(BigDecimal.valueOf(5000000)); // 500만원
                response.setSingleLimit(BigDecimal.valueOf(1000000)); // 100만원
                response.setLimitType("DEFAULT_LIMIT");
            }
        }
        
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