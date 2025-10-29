package com.example.support.scheduler;

import com.example.support.service.NoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 공지사항 상태 관리 스케줄러
 * - 서버 시작 시 최초 1회 실행
 * - 매일 0시 0분 0초에 정기 실행
 * - 긴급 공지사항 중 날짜가 지난 것을 NORMAL로 변경
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NoticeStatusScheduler implements CommandLineRunner {

    private final NoticeService noticeService;

    /**
     * CommandLineRunner - 애플리케이션 시작 시 실행되는 대체 방법
     * ApplicationReadyEvent가 발생하지 않는 경우를 대비
     */
    @Override
    public void run(String... args) {
        log.info("===== CommandLineRunner 실행: NoticeStatusScheduler 초기화 =====");
        // ApplicationReadyEvent가 발생할 때까지 대기하지 않고, 
        // 여기서는 로그만 출력하고 실제 실행은 ApplicationReadyEvent에서 처리
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

