package com.example.service;

import com.example.domain.DefaultRemittanceLimit;
import com.example.domain.Remittance;
import com.example.domain.UserRemittanceLimit;
import com.example.dto.UserRemittanceLimitResponse;
import com.example.repository.DefaultRemittanceLimitRepository;
import com.example.repository.RemittanceRepository;
import com.example.repository.UserRemittanceLimitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserRemittanceLimitService {
    
    private final UserRemittanceLimitRepository userRemittanceLimitRepository;
    private final DefaultRemittanceLimitRepository defaultRemittanceLimitRepository;
    private final RemittanceRepository remittanceRepository;
    
    /**
     * 사용자의 송금 한도를 조회합니다.
     * 사용자별 한도가 없으면 기본 한도를 반환합니다.
     * 실제 이체 가능한 한도는 한도에서 한도 승인일 이후 송금한 금액을 뺀 값입니다.
     */
    @Transactional(readOnly = true)
    public UserRemittanceLimitResponse getUserRemittanceLimit(Long userId) {
        // 사용자별 한도 조회
        UserRemittanceLimit userLimit = userRemittanceLimitRepository.findByUserId(userId).orElse(null);
        
        UserRemittanceLimitResponse response = new UserRemittanceLimitResponse();
        
        BigDecimal dailyLimit, monthlyLimit, singleLimit;
        LocalDateTime limitStartDate = null;
        
        if (userLimit != null) {
            // 사용자별 한도가 있는 경우
            dailyLimit = userLimit.getDailyLimit();
            monthlyLimit = userLimit.getMonthlyLimit();
            singleLimit = userLimit.getSingleLimit();
            response.setLimitType("USER_LIMIT");
            
            // 한도 승인일 또는 수정일을 기준으로 설정
            limitStartDate = userLimit.getUpdatedAt();
        } else {
            // 기본 한도 조회
            DefaultRemittanceLimit defaultLimit = defaultRemittanceLimitRepository.findByIsActiveTrue().orElse(null);
            
            if (defaultLimit != null) {
                dailyLimit = defaultLimit.getDailyLimit();
                monthlyLimit = defaultLimit.getMonthlyLimit();
                singleLimit = defaultLimit.getSingleLimit();
            } else {
                // 기본 한도도 없으면 기본값 설정
                dailyLimit = BigDecimal.valueOf(1000000); // 100만원
                monthlyLimit = BigDecimal.valueOf(5000000); // 500만원
                singleLimit = BigDecimal.valueOf(1000000); // 100만원
            }
            response.setLimitType("DEFAULT_LIMIT");
            
            // 기본 한도의 경우 이번 달 1일부터 계산
            limitStartDate = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);
        }
        
        // 오늘 송금한 금액 계산 (오전 0시 0분 0초부터)
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime todayEnd = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        BigDecimal todayAmount = remittanceRepository.sumAmountByUserIdAndDateRange(
            userId, todayStart, todayEnd);
        
        // 이번 달 송금한 금액 계산 (월 1일 0시 0분 0초부터)
        LocalDateTime monthStart = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);
        LocalDateTime monthEnd = LocalDateTime.of(LocalDate.now().withDayOfMonth(
            LocalDate.now().lengthOfMonth()), LocalTime.MAX);
        BigDecimal monthAmount = remittanceRepository.sumAmountByUserIdAndDateRange(
            userId, monthStart, monthEnd);
        
        // 실제 이체 가능한 한도 계산 (0보다 작으면 0으로 설정)
        BigDecimal availableDailyLimit = dailyLimit.subtract(todayAmount != null ? todayAmount : BigDecimal.ZERO);
        BigDecimal availableMonthlyLimit = monthlyLimit.subtract(monthAmount != null ? monthAmount : BigDecimal.ZERO);
        
        if (availableDailyLimit.compareTo(BigDecimal.ZERO) < 0) {
            availableDailyLimit = BigDecimal.ZERO;
        }
        if (availableMonthlyLimit.compareTo(BigDecimal.ZERO) < 0) {
            availableMonthlyLimit = BigDecimal.ZERO;
        }
        
        // 응답 설정
        response.setDailyLimit(availableDailyLimit);
        response.setMonthlyLimit(availableMonthlyLimit);
        response.setSingleLimit(singleLimit);
        response.setOriginalDailyLimit(dailyLimit);
        response.setOriginalMonthlyLimit(monthlyLimit);
        response.setTodayAmount(todayAmount != null ? todayAmount : BigDecimal.ZERO);
        response.setMonthAmount(monthAmount != null ? monthAmount : BigDecimal.ZERO);
        
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