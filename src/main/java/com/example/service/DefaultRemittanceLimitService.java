package com.example.service;

import com.example.context.SessionContext;
import com.example.domain.DefaultRemittanceLimit;
import com.example.dto.DefaultRemittanceLimitRequest;
import com.example.dto.DefaultRemittanceLimitResponse;
import com.example.mapper.DefaultRemittanceLimitMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DefaultRemittanceLimitService {
    
    private final DefaultRemittanceLimitMapper defaultRemittanceLimitMapper;
    
    /**
     * 현재 기본 한도 조회
     */
    public DefaultRemittanceLimitResponse getDefaultLimit() {
        return defaultRemittanceLimitMapper.selectDefaultLimit();
    }
    
    /**
     * 기본 한도 업데이트
     */
    @Transactional
    public void updateDefaultLimit(DefaultRemittanceLimitRequest request) {
        Long adminId = SessionContext.getCurrentAdminId();
        DefaultRemittanceLimit defaultLimit = DefaultRemittanceLimit.builder()
                .dailyLimit(request.getDailyLimit())
                .monthlyLimit(request.getMonthlyLimit())
                .singleLimit(request.getSingleLimit())
                .description(request.getDescription())
                .adminId(adminId)
                .isActive(true)
                .build();
        
        int updatedRows = defaultRemittanceLimitMapper.updateDefaultLimit(defaultLimit);
        
        if (updatedRows == 0) {
            log.warn("기본 한도 업데이트 실패: 활성화된 기본 한도가 없습니다.");
            throw new RuntimeException("기본 한도 업데이트에 실패했습니다.");
        }
        
        log.info("기본 한도 업데이트 완료: adminId={}, dailyLimit={}, monthlyLimit={}, singleLimit={}", 
                request.getAdminId(), request.getDailyLimit(), request.getMonthlyLimit(), request.getSingleLimit());
    }
} 