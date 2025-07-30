package com.example.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RemittanceHistorySearchRequest {
    private Long userId; // 필수
    private String recipient;
    private String currency;
    private String status;
    private String minAmount;
    private String maxAmount;
    private String startDate;
    private String endDate;
    private Integer page; // 페이징: 페이지 번호 (0부터 시작)
    private Integer size; // 페이징: 페이지 크기
    private String sortOrder; // 정렬 순서: "DESC" (최신순), "ASC" (과거순)
} 