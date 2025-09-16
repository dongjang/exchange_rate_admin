package com.example.remittance.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.common.domain.File;
import com.example.common.service.EmailService;
import com.example.common.service.FileService;
import com.example.context.SessionContext;
import com.example.remittance.domain.DefaultRemittanceLimit;
import com.example.remittance.domain.RemittanceLimitRequest;
import com.example.remittance.dto.DefaultRemittanceLimitRequest;
import com.example.remittance.dto.DefaultRemittanceLimitResponse;
import com.example.remittance.dto.RemittanceHistoryResponse;
import com.example.remittance.dto.RemittanceHistorySearchRequest;
import com.example.remittance.dto.RemittanceLimitRequestResponse;
import com.example.remittance.mapper.DefaultRemittanceLimitMapper;
import com.example.remittance.mapper.RemittanceLimitRequestMapper;
import com.example.remittance.mapper.RemittanceMapper;
import com.example.remittance.repository.RemittanceLimitRequestRepository;
import com.example.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class RemittanceService {
    private final RemittanceMapper remittanceMapper;
    private final RemittanceLimitRequestRepository remittanceLimitRequestRepository;
    private final FileService fileService;
    private final RemittanceLimitRequestMapper remittanceLimitRequestMapper;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final DefaultRemittanceLimitMapper defaultRemittanceLimitMapper;



    // 한도 변경 신청 목록 조회 (관리자용)
    @Transactional(readOnly = true)
    public List<RemittanceLimitRequestResponse> getLimitRequests() {
        List<RemittanceLimitRequest> requests = remittanceLimitRequestRepository.findAllByOrderByCreatedAtDesc();
        return requests.stream()
                .map(this::convertToLimitRequestResponse)
                .collect(Collectors.toList());
    }

    private RemittanceLimitRequestResponse convertToLimitRequestResponse(RemittanceLimitRequest request) {
        RemittanceLimitRequestResponse.RemittanceLimitRequestResponseBuilder builder = RemittanceLimitRequestResponse.builder()
                .id(request.getId())
                .userId(request.getUserId())
                .newDailyLimit(request.getDailyLimit().longValue())
                .newMonthlyLimit(request.getMonthlyLimit().longValue())
                .dailyLimit(request.getDailyLimit())
                .monthlyLimit(request.getMonthlyLimit())
                .singleLimit(request.getSingleLimit())
                .reason(request.getReason())
                .status(request.getStatus().name())
                .incomeFileId(request.getIncomeFileId())
                .bankbookFileId(request.getBankbookFileId())
                .businessFileId(request.getBusinessFileId())
                .adminId(request.getAdminId())
                .adminComment(request.getAdminComment())
                .processedAt(request.getProcessedAt())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt());

        // 파일 정보 추가
        if (request.getIncomeFileId() != null) {
            File incomeFile = fileService.getFileById(request.getIncomeFileId());
            if (incomeFile != null) {
                builder.incomeFileName(incomeFile.getOriginalName())
                       .incomeFileSize(incomeFile.getFileSize().intValue())
                       .incomeFileType(incomeFile.getFileType());
            } else {
                System.out.println("Income File Not Found for ID: " + request.getIncomeFileId());
            }
        }

        if (request.getBankbookFileId() != null) {
            File bankbookFile = fileService.getFileById(request.getBankbookFileId());
            if (bankbookFile != null) {
                builder.bankbookFileName(bankbookFile.getOriginalName())
                       .bankbookFileSize(bankbookFile.getFileSize().intValue())
                       .bankbookFileType(bankbookFile.getFileType());
            } else {
                System.out.println("Bankbook File Not Found for ID: " + request.getBankbookFileId());
            }
        }

        if (request.getBusinessFileId() != null) {
            File businessFile = fileService.getFileById(request.getBusinessFileId());
            if (businessFile != null) {
                builder.businessFileName(businessFile.getOriginalName())
                       .businessFileSize(businessFile.getFileSize().intValue())
                       .businessFileType(businessFile.getFileType());
            } else {
                System.out.println("Business File Not Found for ID: " + request.getBusinessFileId());
            }
        }

        return builder.build();
    }
    
    /**
     * 최근 7일 송금 건수 조회
     */
    /*
    public List<RecentRemittanceCount> getRecent7DaysRemittanceCount() {
        return remittanceMapper.selectRecent7DaysRemittanceCount();
    }
     */
    
    /**
     * 관리자용 송금 이력 조회
     */
    public List<RemittanceHistoryResponse> getAdminRemittanceHistory(RemittanceHistorySearchRequest searchRequest) {
        return remittanceMapper.selectRemittanceHistory(searchRequest);
    }
    
    /**
     * 관리자용 송금 이력 개수 조회
     */
    public int getAdminRemittanceHistoryCount(RemittanceHistorySearchRequest searchRequest) {
        return remittanceMapper.countRemittanceHistory(searchRequest);
    }
    
    public List<RemittanceLimitRequestResponse> getAdminRequests(Map<String, Object> searchRequest) {
        return remittanceLimitRequestMapper.selectRemittanceLimitRequests(searchRequest);
    }
    
    public int countAdminRequests(Map<String, Object> searchRequest) {
        return remittanceLimitRequestMapper.countRemittanceLimitRequests(searchRequest);
    }

        // 관리자 승인/반려 처리
    @Transactional
    public void processRequest(Long requestId, Map<String, Object> request) {
            RemittanceLimitRequest.RequestStatus status = RemittanceLimitRequest.RequestStatus.valueOf(request.get("status").toString().toUpperCase());
            Long adminId = SessionContext.getCurrentAdminId();
            String adminComment = request.get("adminComment").toString();
            Long userId = Long.parseLong(request.get("userId").toString());
            BigDecimal dailyLimit = new BigDecimal(request.get("dailyLimit").toString());
            BigDecimal monthlyLimit = new BigDecimal(request.get("monthlyLimit").toString());
            BigDecimal singleLimit = new BigDecimal(request.get("singleLimit").toString());
            remittanceLimitRequestMapper.updateRemittanceLimitRequestStatus(requestId, status.name(), adminId, adminComment);
            //승인일 때만 추가
            if(RemittanceLimitRequest.RequestStatus.APPROVED.equals(status)){
            //사용자 별로 한 개만 존재하도록 삭제 후 추가
            remittanceLimitRequestMapper.deleteUserRemittanceLimit(userId);
            remittanceLimitRequestMapper.insertUserRemittanceLimit(userId, dailyLimit, monthlyLimit, singleLimit, requestId);
            }
            
            // 이메일 발송
            try {
                // userId가 null인 경우 요청 ID로부터 조회
                Long targetUserId = userId;
                if (targetUserId == null) {
                    RemittanceLimitRequestResponse requestResponse = remittanceLimitRequestMapper.selectRemittanceLimitRequestById(requestId);
                    if (requestResponse != null) {
                        targetUserId = requestResponse.getUserId();
                    }
                }
                
                // 사용자 정보 조회
                if (targetUserId != null) {
                    var user = userRepository.findById(targetUserId);
                    if (user.isPresent()) {
                        String userEmail = user.get().getEmail();
                        String userName = user.get().getName();
                    
                        // 이메일 발송 - 한도 정보 포함
                        emailService.sendRemittanceLimitNotification(userEmail, userName, status.name(), adminComment,dailyLimit, monthlyLimit, singleLimit);
    
                    }
                }
            } catch (Exception e) {
                System.err.println("이메일 발송 중 오류 발생: " + e.getMessage());
                // 이메일 발송 실패해도 트랜잭션은 롤백하지 않음
            }
        }
        
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