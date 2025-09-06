package com.example.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Async;
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

    // 기본 한도 체크 (빠른 검증용)
    public RemittanceLimitCheckResponse checkBasicLimit(Long userId, BigDecimal amount) {
        // 기존 checkRemittanceLimit과 동일하지만 더 가벼운 버전
        // 실제로는 동일한 로직을 사용하지만, 나중에 더 복잡한 검증을 분리할 수 있음
        return checkRemittanceLimit(userId, amount);
    }

    // 송금 신청 통합 처리 (한도 체크 + 저장 + 비동기 처리)
    public Map<String, Object> createRemittanceWithAsyncProcessing(Remittance remittance) {
        // 1단계: 기본 한도 체크
        var limitCheck = checkBasicLimit(remittance.getUserId(), remittance.getAmount());
        if (!limitCheck.isSuccess()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "LIMIT_EXCEEDED");
            errorResponse.put("message", limitCheck.getMessage());
            errorResponse.put("exceededType", limitCheck.getExceededType());
            return errorResponse;
        }
        
        // 2단계: PENDING 상태로 송금 저장
        remittance.setStatus("PENDING");
        if (remittance.getExchangeRate() == null) {
            remittance.setExchangeRate(BigDecimal.ZERO);
        }
        if (remittance.getConvertedAmount() == null) {
            remittance.setConvertedAmount(BigDecimal.ZERO);
        }
        remittance.setCreatedAt(LocalDateTime.now());
        Remittance saved = remittanceRepository.save(remittance);
        
        // 3단계: 비동기 상세 검증 시작
        processRemittanceAsync(saved.getId());
        
        // 4단계: 성공 응답 반환
        Map<String, Object> successResponse = new HashMap<>();
        successResponse.put("success", true);
        successResponse.put("message", "송금 신청이 접수되었습니다. 송금이력에서 확인해 주세요.");
        successResponse.put("remittanceId", saved.getId());
        successResponse.put("status", "PENDING");
        return successResponse;
    }

    // PENDING 상태로 송금 저장 (개별 메서드 - 필요시 사용)
    @Transactional
    public Remittance savePending(Remittance remittance) {
        // PENDING 상태로 설정
        remittance.setStatus("PENDING");
        
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

    // 비동기 송금 처리 (상세 검증 포함)
    @Async("remittanceTaskExecutor")  // 위에서 정의한 스레드 풀 사용
    // @Transactional 제거: 비동기 처리에서는 트랜잭션 분리
    public CompletableFuture<Void> processRemittanceAsync(Long remittanceId) {
        try {
            // 1단계: 송금 정보 조회
            Remittance remittance = remittanceRepository.findById(remittanceId)
                .orElseThrow(() -> new RuntimeException("송금 정보를 찾을 수 없습니다: " + remittanceId));
            
            // 2단계: PROCESSING 상태로 변경
            remittance.setStatus("PROCESSING");
            remittance.setUpdatedAt(LocalDateTime.now());
            remittanceRepository.save(remittance);
            
            // 3단계: 상세 검증 수행
            boolean validationPassed = performDetailedValidation(remittance);
            
            if (validationPassed) {
                // 4단계: 검증 통과 시 COMPLETED 상태로 변경
                remittance.setStatus("COMPLETED");
                remittance.setUpdatedAt(LocalDateTime.now());
                remittanceRepository.save(remittance);
                
                System.out.println("송금 처리 완료: " + remittanceId);
            } else {
                // 5단계: 검증 실패 시 FAILED 상태로 변경
                remittance.setStatus("FAILED");
                remittance.setFailureReason("상세 검증 실패");
                remittance.setUpdatedAt(LocalDateTime.now());
                remittanceRepository.save(remittance);
                
                System.out.println("송금 처리 실패: " + remittanceId);
            }
            
        } catch (Exception e) {
            // 6단계: 예외 발생 시 FAILED 상태로 변경
            try {
                Remittance remittance = remittanceRepository.findById(remittanceId).orElse(null);
                if (remittance != null) {
                    remittance.setStatus("FAILED");
                    remittance.setFailureReason("처리 중 오류 발생: " + e.getMessage());
                    remittance.setUpdatedAt(LocalDateTime.now());
                    remittanceRepository.save(remittance);
                }
            } catch (Exception saveException) {
                System.err.println("송금 상태 저장 실패: " + saveException.getMessage());
            }
            
            System.err.println("송금 처리 중 오류 발생: " + e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }

    // 상세 검증 로직 (실제 비즈니스 로직)
    private boolean performDetailedValidation(Remittance remittance) {
        try {
            // 1. 실시간 한도 재계산 (다른 송금이 동시에 진행될 수 있음)
            var limitCheck = checkRemittanceLimit(remittance.getUserId(), remittance.getAmount());
            if (!limitCheck.isSuccess()) {
                System.out.println("실시간 한도 체크 실패: " + limitCheck.getMessage());
                return false;
            }
            
            // 2. 은행 정보 검증 (실제로는 외부 API 호출)
            Thread.sleep(500); // 0.5초 대기 (외부 API 호출 시뮬레이션)
            if (!isValidBankAccount(remittance.getReceiverBank(), remittance.getReceiverAccount())) {
                System.out.println("은행 계좌 검증 실패");
                return false;
            }
            
            // 3. 수신자 정보 검증
            if (!isValidReceiver(remittance.getReceiverName(), remittance.getReceiverCountry())) {
                System.out.println("수신자 정보 검증 실패");
                return false;
            }
            
            // 4. 외부 시스템 검증 (실제로는 외부 API 호출)
            Thread.sleep(300); // 0.3초 대기
            if (!validateWithExternalSystem(remittance)) {
                System.out.println("외부 시스템 검증 실패");
                return false;
            }
            
            System.out.println("상세 검증 완료: " + remittance.getId());
            return true;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("검증 중 인터럽트 발생: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.err.println("상세 검증 중 오류 발생: " + e.getMessage());
            return false;
        }
    }

    // 은행 계좌 검증 (시뮬레이션)
    private boolean isValidBankAccount(String bank, String account) {
        // 실제로는 외부 은행 API를 호출하여 계좌 유효성 검증
        // 여기서는 간단한 시뮬레이션
        
        // 기본적인 유효성 검증만 수행
        if (bank == null || bank.trim().isEmpty()) {
            System.out.println("은행명이 비어있습니다");
            return false;
        }
        
        if (account == null || account.trim().isEmpty()) {
            System.out.println("계좌번호가 비어있습니다");
            return false;
        }
        
        // 계좌번호는 5자리 이상이면 유효하다고 가정 (전세계적으로 다양함)
        if (account.trim().length() < 5) {
            System.out.println("계좌번호가 너무 짧습니다: " + account);
            return false;
        }
        
        // 실제로는 외부 은행 API를 호출하여 계좌 유효성 검증
        // 여기서는 시뮬레이션으로 항상 통과
        System.out.println("은행 계좌 검증 완료: " + bank + " - " + account);
        return true;
    }

    // 수신자 정보 검증 (시뮬레이션)
    private boolean isValidReceiver(String name, String country) {
        // 실제로는 외부 검증 서비스를 호출
        // 여기서는 간단한 시뮬레이션
        return name != null && !name.trim().isEmpty() && 
               country != null && !country.trim().isEmpty();
    }

    // 외부 시스템 검증 (시뮬레이션)
    private boolean validateWithExternalSystem(Remittance remittance) {
        // 실제로는 외부 금융 시스템, AML(자금세탁방지) 시스템 등을 호출
        // 여기서는 간단한 시뮬레이션
        
        // 1. AML 검증 (자금세탁방지)
        if (!validateAML(remittance)) {
            return false;
        }
        
        // 2. 외환거래 신고 검증
        if (!validateForeignExchange(remittance)) {
            return false;
        }
        
        // 3. 수신자 국가 검증
        if (!validateReceiverCountry(remittance.getReceiverCountry())) {
            return false;
        }
        
        return true;
    }

    // AML 검증 (자금세탁방지)
    private boolean validateAML(Remittance remittance) {
        // 실제로는 외부 AML 시스템 API 호출
        // 여기서는 간단한 시뮬레이션
        // AML은 보통 높은 금액에서 발동하므로 5만달러 이상에서만 체크
        if (remittance.getAmount().compareTo(new BigDecimal("50000")) >= 0) {
            // 5만달러 이상일 때만 AML 검증 (실제로는 외부 API 호출)
            // 여기서는 시뮬레이션으로 항상 통과
            System.out.println("AML 검증 수행: " + remittance.getAmount() + "달러");
        }
        return true; // 시뮬레이션에서는 항상 통과
    }

    // 외환거래 신고 검증
    private boolean validateForeignExchange(Remittance remittance) {
        // 실제로는 외환거래 신고 시스템 API 호출
        // 여기서는 간단한 시뮬레이션
        // 외환거래 신고는 특정 금액 이상에서 신고 의무 (차단이 아님)
        if (remittance.getAmount().compareTo(new BigDecimal("10000")) >= 0) {
            // 1만달러 이상일 때 신고 의무 (실제로는 신고 시스템에 등록)
            System.out.println("외환거래 신고 대상: " + remittance.getAmount() + "달러");
        }
        return true; // 신고 의무는 있지만 송금 자체는 허용
    }

    // 수신자 국가 검증
    private boolean validateReceiverCountry(String country) {
        // 실제로는 제재 국가 목록과 비교
        // 여기서는 간단한 시뮬레이션
        return !"NORTH_KOREA".equals(country) && !"IRAN".equals(country);
    }

    // 송금 정보 조회
    public Remittance findById(Long id) {
        return remittanceRepository.findById(id).orElse(null);
    }

    // 송금 한도 체크
    public RemittanceLimitCheckResponse checkRemittanceLimit(Long userId, BigDecimal amount) {
        var userLimit = userRemittanceLimitService.getUserRemittanceLimit(userId);
        
        // 이미 계산된 사용 가능 한도를 사용
        BigDecimal availableDailyLimit = userLimit.getDailyLimit();
        BigDecimal availableMonthlyLimit = userLimit.getMonthlyLimit();
               
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
                .currency((String) result[3])
                .receiverName((String) result[7])
                .amount((BigDecimal) result[8])
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