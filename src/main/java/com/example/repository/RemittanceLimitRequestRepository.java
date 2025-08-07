package com.example.repository;

import com.example.domain.RemittanceLimitRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RemittanceLimitRequestRepository extends JpaRepository<RemittanceLimitRequest, Long> {
    
    List<RemittanceLimitRequest> findByUserId(Long userId);
    
    List<RemittanceLimitRequest> findByStatus(RemittanceLimitRequest.RequestStatus status);
    
    List<RemittanceLimitRequest> findByUserIdAndStatus(Long userId, RemittanceLimitRequest.RequestStatus status);
    
    // 사용자의 최신 한도 상향 신청 조회
    @Query("SELECT r FROM RemittanceLimitRequest r WHERE r.userId = :userId ORDER BY r.createdAt DESC")
    List<RemittanceLimitRequest> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
} 