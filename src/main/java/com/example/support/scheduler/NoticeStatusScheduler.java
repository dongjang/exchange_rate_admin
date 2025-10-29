package com.example.support.scheduler;

import com.example.support.service.NoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 공지사항 상태 관리 스케줄러
 * - 매일 0시 0분 0초에 실행
 * - 긴급 공지사항 중 날짜가 지난 것을 NORMAL로 변경
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NoticeStatusScheduler {

    private final NoticeService noticeService;

    /**
     * 매일 0시 0분 0초에 실행되는 스케줄러
     * 긴급 공지사항 중 날짜가 지난 것을 NORMAL로 변경
     */
    @Scheduled(cron = "0 0 0 * * *") // 매일 0시 0분 0초
    public void updateExpiredUrgentNotices() {
        try {
            log.info("공지사항 상태 업데이트 스케줄러 시작");
            
            int updatedCount = noticeService.updateExpiredUrgentNotices();
            
            if (updatedCount > 0) {
                log.info("만료된 긴급 공지사항 {}개를 NORMAL로 변경했습니다.", updatedCount);
            } else {
                log.info("만료된 긴급 공지사항이 없습니다.");
            }
            
        } catch (Exception e) {
            log.error("공지사항 상태 업데이트 중 오류 발생: {}", e.getMessage(), e);
        }
    }
}

