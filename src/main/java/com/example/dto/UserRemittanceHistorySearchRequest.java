package com.example.dto;

import lombok.Data;

@Data
public class UserRemittanceHistorySearchRequest {
    private Long userId;
    private String recipient;
    private String currency;
    private String status;
    private String minAmount;
    private String maxAmount;
    private String startDate;
    private String endDate;
    private String sortOrder;
    private Integer page;
    private Integer size;
} 