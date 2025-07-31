package com.example.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QnaPendingItem {
    private Long id;
    private String title;
    private LocalDateTime createdAt;
    private Boolean hasFile;  // 파일 첨부 여부
} 