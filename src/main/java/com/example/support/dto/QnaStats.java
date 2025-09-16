package com.example.support.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QnaStats {
    private Long totalCount;      // 전체 Q&A 수
    private Long pendingCount;    // 답변 대기 중인 Q&A 수
    private Long answeredCount;   // 답변 완료된 Q&A 수
} 