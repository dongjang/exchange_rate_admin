package com.example.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.domain.Remittance;
import com.example.dto.RemittanceHistoryDto;
import com.example.dto.RemittanceHistoryResponse;
import com.example.dto.RemittanceHistorySearchRequest;
import com.example.repository.RemittanceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RemittanceService {
    private final RemittanceRepository remittanceRepository;

    // 송금 신청
    @Transactional
    public Remittance create(Remittance remittance) {

        remittance.setCreatedAt(LocalDateTime.now());
        return remittanceRepository.save(remittance);
    }



        // 동적 검색 조건으로 송금 이력 조회 (페이징 포함)
    public RemittanceHistoryResponse getRemittanceHistory(RemittanceHistorySearchRequest params) {
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
        int page = params.getPage() != null ? params.getPage() : 0;
        int size = params.getSize() != null ? params.getSize() : 5;
        int offset = page * size;

        // 정렬 순서 설정 (기본값: 최신순)
        String sortOrder = StringUtils.hasText(params.getSortOrder()) ? params.getSortOrder() : "DESC";
        
        // 전체 데이터 조회 (페이징 없이)
        List<Object[]> allResults = remittanceRepository.findRemittanceHistoryWithBankNames(
            params.getUserId(),
            recipient,
            currency,
            status,
            minAmount,
            maxAmount,
            startDate,
            endDate
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
                .status((String) result[9])
                .createdAt((LocalDateTime) result[10])
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

        return new RemittanceHistoryResponse(content, page, size, totalElements);
    }
} 