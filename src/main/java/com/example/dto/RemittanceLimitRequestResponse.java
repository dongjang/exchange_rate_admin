package com.example.dto;

import com.example.domain.RemittanceLimitRequest;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RemittanceLimitRequestResponse {
    
    private Long id;
    private Long userId;
    private String userName;
    private BigDecimal dailyLimit;
    private BigDecimal monthlyLimit;
    private BigDecimal singleLimit;
    private String reason;
    private RemittanceLimitRequest.RequestStatus status;
    private Long adminId;
    private String adminComment;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 파일 정보
    private Long incomeFileId;
    private String incomeFileName;
    private Long incomeFileSize;
    private String incomeFileType;
    
    private Long bankbookFileId;
    private String bankbookFileName;
    private Long bankbookFileSize;
    private String bankbookFileType;
    
    private Long businessFileId;
    private String businessFileName;
    private Long businessFileSize;
    private String businessFileType;
} 