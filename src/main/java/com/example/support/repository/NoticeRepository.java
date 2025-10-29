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
     * 현재 시간보다 noticeEndAt이 이전인 긴급 공지사항들을 대상으로 함
     */
    @Modifying
    @Query("UPDATE Notice n SET n.priority = 'NORMAL', n.noticeStartAt = null, n.noticeEndAt = null WHERE n.priority = 'HIGH' AND n.noticeEndAt < CURRENT_TIMESTAMP")
    int updateExpiredUrgentNotices();    
}
