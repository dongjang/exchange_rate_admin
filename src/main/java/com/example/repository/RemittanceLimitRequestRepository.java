package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.domain.RemittanceLimitRequest;

@Repository
public interface RemittanceLimitRequestRepository extends JpaRepository<RemittanceLimitRequest, Long> {
    
    List<RemittanceLimitRequest> findByUserId(Long userId);
    
    List<RemittanceLimitRequest> findByStatus(RemittanceLimitRequest.RequestStatus status);
    
    List<RemittanceLimitRequest> findByUserIdAndStatus(Long userId, RemittanceLimitRequest.RequestStatus status);
    
    // 사용자의 최신 한도 변경 신청 조회
    @Query("SELECT r FROM RemittanceLimitRequest r WHERE r.userId = :userId ORDER BY r.createdAt DESC")
    List<RemittanceLimitRequest> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    List<RemittanceLimitRequest> findAllByOrderByCreatedAtDesc();
} 