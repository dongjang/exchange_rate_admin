package com.example.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.domain.Remittance;
import com.example.dto.RecentRemittanceCount;
import com.example.dto.RemittanceHistoryDto;
import com.example.dto.RemittanceHistoryResponse;
import com.example.dto.RemittanceHistorySearchRequest;
import com.example.dto.RemittanceLimitCheckResponse;
import com.example.dto.RemittanceLimitRequestResponse;
import com.example.dto.RemittanceStats;
import com.example.dto.UserRemittanceHistoryResponse;
import com.example.dto.UserRemittanceHistorySearchRequest;
import com.example.mapper.RemittanceMapper;
import com.example.repository.RemittanceRepository;
import com.example.repository.RemittanceLimitRequestRepository;
import com.example.domain.RemittanceLimitRequest;
import com.example.domain.File;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RemittanceService {
    private final RemittanceRepository remittanceRepository;
    private final RemittanceMapper remittanceMapper;
    private final UserRemittanceLimitService userRemittanceLimitService;
    private final RemittanceLimitRequestRepository remittanceLimitRequestRepository;
    private final FileService fileService;

    // 송금 신청
    @Transactional
    public Remittance create(Remittance remittance) {
        // 한도 체크
        var limitCheck = checkRemittanceLimit(remittance.getUserId(), remittance.getAmount());
        if (!limitCheck.isSuccess()) {
            throw new RuntimeException("LIMIT_EXCEEDED:" + limitCheck.getExceededType() + ":" + limitCheck.getMessage());
        }

        // 환율과 변환된 금액이 설정되지 않은 경우 기본값 설정
        if (remittance.getExchangeRate() == null) {
            remittance.setExchangeRate(BigDecimal.ZERO);
        }
        if (remittance.getConvertedAmount() == null) {
            remittance.setConvertedAmount(BigDecimal.ZERO);
        }

        remittance.setCreatedAt(LocalDateTime.now());
        return remittanceRepository.save(remittance);
    }

    // 송금 한도 체크
    public RemittanceLimitCheckResponse checkRemittanceLimit(Long userId, BigDecimal amount) {
        var userLimit = userRemittanceLimitService.getUserRemittanceLimit(userId);
        
        // 이미 계산된 사용 가능 한도를 사용
        BigDecimal availableDailyLimit = userLimit.getDailyLimit();
        BigDecimal availableMonthlyLimit = userLimit.getMonthlyLimit();
        BigDecimal originalDailyLimit = userLimit.getOriginalDailyLimit();
        BigDecimal originalMonthlyLimit = userLimit.getOriginalMonthlyLimit();        
        boolean dailyExceeded = amount.compareTo(availableDailyLimit) > 0;
        boolean monthlyExceeded = amount.compareTo(availableMonthlyLimit) > 0;
        
        if (dailyExceeded && monthlyExceeded) {
            return RemittanceLimitCheckResponse.builder()
                .success(false)
                .message("일일 한도와 월 한도를 모두 초과했습니다.")
                .errorType("LIMIT_EXCEEDED")
                .exceededType("BOTH")
                .requestedAmount(amount)
                .dailyLimit(availableDailyLimit)
                .monthlyLimit(availableMonthlyLimit)
                .dailyExceededAmount(amount.subtract(availableDailyLimit))
                .monthlyExceededAmount(amount.subtract(availableMonthlyLimit))
                .build();
        } else if (dailyExceeded) {
            return RemittanceLimitCheckResponse.builder()
                .success(false)
                .message("일일 한도를 초과했습니다.")
                .errorType("LIMIT_EXCEEDED")
                .exceededType("DAILY")
                .requestedAmount(amount)
                .dailyLimit(availableDailyLimit)
                .monthlyLimit(availableMonthlyLimit)
                .dailyExceededAmount(amount.subtract(availableDailyLimit))
                .monthlyExceededAmount(BigDecimal.ZERO)
                .build();
        } else if (monthlyExceeded) {
            return RemittanceLimitCheckResponse.builder()
                .success(false)
                .message("월 한도를 초과했습니다.")
                .errorType("LIMIT_EXCEEDED")
                .exceededType("MONTHLY")
                .requestedAmount(amount)
                .dailyLimit(availableDailyLimit)
                .monthlyLimit(availableMonthlyLimit)
                .dailyExceededAmount(BigDecimal.ZERO)
                .monthlyExceededAmount(amount.subtract(availableMonthlyLimit))
                .build();
        } else {
            return RemittanceLimitCheckResponse.builder()
                .success(true)
                .message("한도 내에서 송금 가능합니다.")
                .requestedAmount(amount)
                .dailyLimit(availableDailyLimit)
                .monthlyLimit(availableMonthlyLimit)
                .build();
        }
    }

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


        // 동적 검색 조건으로 송금 이력 조회 (페이징 포함) - 기존 사용자용
    public UserRemittanceHistoryResponse getRemittanceHistory(UserRemittanceHistorySearchRequest params) {
        // 기존 로직을 그대로 유지 (기존 사용자용 API)
        // 파라미터 준비
        BigDecimal minAmount = null;
        BigDecimal maxAmount = null;
        LocalDateTime startDate = null;
        LocalDateTime endDate = null;

        if (StringUtils.hasText(params.getMinAmount())) {
            minAmount = new BigDecimal(params.getMinAmount());
        }
        if (StringUtils.hasText(params.getMaxAmount())) {
            maxAmount = new BigDecimal(params.getMaxAmount());
        }
        if (StringUtils.hasText(params.getStartDate())) {
            startDate = LocalDateTime.parse(params.getStartDate() + "T00:00:00");
        }
        if (StringUtils.hasText(params.getEndDate())) {
            endDate = LocalDateTime.parse(params.getEndDate() + "T23:59:59");
        }

        // 빈 문자열을 null로 변환
        String recipient = StringUtils.hasText(params.getRecipient()) ? params.getRecipient() : null;
        String currency = StringUtils.hasText(params.getCurrency()) ? params.getCurrency() : null;
        String status = StringUtils.hasText(params.getStatus()) ? params.getStatus() : null;

        // 페이징 파라미터 설정
        int page = params.getPage() != 0 ? params.getPage() : 0;
        int size = params.getSize() != 0 ? params.getSize() : 5;
        //int offset = page * size;

        // 정렬 순서 설정 (기본값: 최신순)
        String sortOrder = StringUtils.hasText(params.getSortOrder()) ? params.getSortOrder() : "latest";
        
        // 전체 데이터 조회 (페이징 없이)
        List<Object[]> allResults = remittanceRepository.findRemittanceHistoryWithBankNames(
            params.getUserId(),
            recipient,
            currency,
            status,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            sortOrder
        );
        
        // 전체 데이터를 DTO로 변환
        List<RemittanceHistoryDto> allContent = allResults.stream()
            .map(result -> RemittanceHistoryDto.builder()
                .id((Long) result[0])
                .senderBank((String) result[1])
                .senderAccount((String) result[2])
                .currency((String) result[3])
                .receiverBank((String) result[6])  // rb.name as receiverBank
                .receiverAccount((String) result[5])
                .receiverName((String) result[7])
                .amount((BigDecimal) result[8])
                .exchangeRate((BigDecimal) result[9])
                .convertedAmount((BigDecimal) result[10])
                .status((String) result[11])
                .createdAt((LocalDateTime) result[12])
                .build())
            .collect(Collectors.toList());
        
        // 전체 개수는 정렬된 전체 데이터의 크기로 계산
        Long totalElements = (long) allContent.size();
        
        // 페이징 처리
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, allContent.size());
        List<RemittanceHistoryDto> content = allContent.subList(startIndex, endIndex);

        // 페이징 정보 계산
        int totalPages = (int) Math.ceil((double) totalElements / size);
        boolean hasNext = page < totalPages - 1;
        boolean hasPrevious = page > 0;

        return UserRemittanceHistoryResponse.builder()
            .content(content)
            .page(page)
            .size(size)
            .totalElements(totalElements)
            .totalPages(totalPages)
            .hasNext(hasNext)
            .hasPrevious(hasPrevious)
            .build();
    }
    
    /**
     * 송금 통계 조회
     */
    public RemittanceStats getRemittanceStats() {
        return remittanceMapper.selectRemittanceStats();
    }
    
    /**
     * 최근 7일 송금 건수 조회
     */
    public List<RecentRemittanceCount> getRecent7DaysRemittanceCount() {
        return remittanceMapper.selectRecent7DaysRemittanceCount();
    }
    
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
    
    /**
     * 기존 사용자용 송금 이력 조회 (기존 API 호환성 유지)
     */
    public RemittanceHistoryResponse getUserRemittanceHistory(RemittanceHistorySearchRequest params) {
        // 기존 로직을 그대로 유지
        // 파라미터 준비
        BigDecimal minAmount = null;
        BigDecimal maxAmount = null;
        LocalDateTime startDate = null;
        LocalDateTime endDate = null;

        if (params.getMinAmount() != null) {
            minAmount = params.getMinAmount();
        }
        if (params.getMaxAmount() != null) {
            maxAmount = params.getMaxAmount();
        }
        if (StringUtils.hasText(params.getStartDate())) {
            startDate = LocalDateTime.parse(params.getStartDate() + "T00:00:00");
        }
        if (StringUtils.hasText(params.getEndDate())) {
            endDate = LocalDateTime.parse(params.getEndDate() + "T23:59:59");
        }

        // 빈 문자열을 null로 변환
        String recipient = params.getReceiverName();
        String currency = params.getCurrency();
        String status = params.getStatus();

        // 페이징 파라미터 설정
        int page = params.getPage();
        int size = params.getSize();
        int offset = page * size;

        // 정렬 순서 설정 (기본값: 최신순)
        String sortOrder = params.getSortOrder() != null ? params.getSortOrder() : "DESC";
        
        // 전체 데이터 조회 (페이징 없이)
        List<Object[]> allResults = remittanceRepository.findRemittanceHistoryWithBankNames(
            null, // userId는 기존 로직에서 사용되지 않음
            recipient,
            currency,
            status,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            sortOrder
        );
        
        // 전체 데이터를 DTO로 변환하고 정렬
        List<RemittanceHistoryDto> allContent = allResults.stream()
            .map(result -> RemittanceHistoryDto.builder()
                .id((Long) result[0])
                .senderBank((String) result[1])
                .senderAccount((String) result[2])
                .currency((String) result[3])
                .receiverBank((String) result[6])  // rb.name as receiverBank
                .receiverAccount((String) result[5])
                .receiverName((String) result[7])
                .amount((BigDecimal) result[8])
                .exchangeRate((BigDecimal) result[9])
                .convertedAmount((BigDecimal) result[10])
                .status((String) result[11])
                .createdAt((LocalDateTime) result[12])
                .build())
            .collect(Collectors.toList());
            
        // 전체 데이터 정렬
        if ("ASC".equals(sortOrder)) {
            allContent = allContent.stream()
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .collect(Collectors.toList());
        } else {
            allContent = allContent.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
        }
        
        // 전체 개수는 정렬된 전체 데이터의 크기로 계산
        Long totalElements = (long) allContent.size();
        
        // 페이징 처리
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, allContent.size());
        List<RemittanceHistoryDto> content = allContent.subList(startIndex, endIndex);

        // 기존 사용자용 API는 다른 응답 구조를 사용하므로 임시로 null 반환
        // 실제로는 기존 사용자용 API 로직을 그대로 유지해야 함
        return null; // TODO: 기존 사용자용 API 로직 수정 필요
    }
} 