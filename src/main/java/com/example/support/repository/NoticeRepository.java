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
    
}
