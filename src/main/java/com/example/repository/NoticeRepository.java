package com.example.repository;

import com.example.domain.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    
    @Modifying
    @Query("UPDATE Notice n SET n.priority = 'NORMAL', n.noticeStartAt = null, n.noticeEndAt = null WHERE n.priority = 'HIGH'")
    void updateHighPriorityToNormal();
    
    @Modifying
    @Query("UPDATE Notice n SET n.viewCount = n.viewCount + 1 WHERE n.id = :noticeId")
    void incrementViewCount(@Param("noticeId") Long noticeId);
}
