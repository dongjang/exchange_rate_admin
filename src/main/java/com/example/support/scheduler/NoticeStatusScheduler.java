package com.example.support.scheduler;

import com.example.support.service.NoticeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import jakarta.annotation.PostConstruct;

/**
 * 공지사항 상태 관리 스케줄러
 * - 서버 시작 시 최초 1회 실행
 * - 매일 0시 0분 0초에 정기 실행
 * - 긴급 공지사항 중 날짜가 지난 것을 NORMAL로 변경
 */
@Slf4j
@Component
public class NoticeStatusScheduler {

    private final NoticeService noticeService;

    public NoticeStatusScheduler(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    /**
     * 스케줄러 초기화 확인용 (빈 생성 후 초기화 시점 확인)
     */
    @PostConstruct
    public void init() {
        log.info("===== NoticeStatusScheduler 빈 생성 및 초기화 완료 =====");
    }

    /**
     * 서버가 완전히 시작된 후 최초 1회 실행
     * 만료된 긴급 공지사항을 즉시 처리
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("===== ApplicationReadyEvent 발생: 서버 준비 완료 =====");
        log.info("서버 준비 완료: 만료된 긴급 공지사항 초기 확인 시작");
        updateExpiredUrgentNotices();
    }

    /**
     * 매일 0시 0분 0초에 실행되는 스케줄러
     * 긴급 공지사항 중 날짜가 지난 것을 NORMAL로 변경
     */
    @Scheduled(cron = "0 0 0 * * *") // 매일 0시 0분 0초
    public void scheduledUpdateExpiredUrgentNotices() {
        log.info("스케줄러 실행: 만료된 긴급 공지사항 확인 시작");
        updateExpiredUrgentNotices();
    }

    /**
     * 만료된 긴급 공지사항을 NORMAL로 변경하는 공통 로직
     */
    private void updateExpiredUrgentNotices() {
        try {
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

