package com.example.support.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "notice")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "status", length = 20)
    private String status = "ACTIVE";
    
    @Column(name = "priority", length = 20)
    private String priority = "NORMAL";
    
    @Column(name = "notice_start_at")
    private LocalDateTime noticeStartAt;
    
    @Column(name = "notice_end_at")
    private LocalDateTime noticeEndAt;
    
    @Column(name = "view_count")
    private Integer viewCount = 0;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_user_id", nullable = false)
    private Long createdUserId;
    
    @Column(name = "updated_user_id")
    private Long updatedUserId;

    @PrePersist
    protected void onCreate() {
        // 한국 시간 기준으로 생성 시간 설정
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        createdAt = now;
        updatedAt = now;
    }
    
    @PreUpdate
    protected void onUpdate() {
        // 한국 시간 기준으로 수정 시간 설정
        updatedAt = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
    }
    
    public void incrementViewCount() {
        this.viewCount++;
    }
}
