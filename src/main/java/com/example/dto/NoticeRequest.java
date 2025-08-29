package com.example.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NoticeRequest {
    private Long id;
    private String title;
    private String content;
    private String priority;
    private String status; // 수정 시에만 사용
    private String noticeStartAt; // 날짜 문자열 (YYYY-MM-DD)
    private String noticeEndAt; // 날짜 문자열 (YYYY-MM-DD)
}
