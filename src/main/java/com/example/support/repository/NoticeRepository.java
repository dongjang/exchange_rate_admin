package com.example.support.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.support.domain.Notice;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    
    @Modifying
    @Query("UPDATE Notice n SET n.priority = 'NORMAL', n.noticeStartAt = null, n.noticeEndAt = null WHERE n.priority = 'HIGH'")
    void updateHighPriorityToNormal();
    
    /**
     * 만료된 긴급 공지사항을 NORMAL로 변경
     * 한국 시간(KST) 기준으로 현재 날짜보다 noticeEndAt 날짜가 이전인 긴급 공지사항들을 대상으로 함
     * 네이티브 쿼리이므로 updated_at도 직접 업데이트
     * CONVERT_TZ를 사용하여 UTC에서 한국 시간(Asia/Seoul)으로 변환
     */
    @Modifying
    @Query(value = "UPDATE notice n SET n.priority = 'NORMAL', n.notice_start_at = NULL, n.notice_end_at = NULL, n.updated_at = CONVERT_TZ(NOW(), 'UTC', 'Asia/Seoul') WHERE n.priority = 'HIGH' AND DATE(n.notice_end_at) < DATE(CONVERT_TZ(NOW(), 'UTC', 'Asia/Seoul'))", nativeQuery = true)
    int updateExpiredUrgentNotices();
}
