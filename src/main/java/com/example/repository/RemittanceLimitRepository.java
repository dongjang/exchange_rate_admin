package com.example.repository;

import com.example.domain.RemittanceLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RemittanceLimitRepository extends JpaRepository<RemittanceLimit, Long> {
    
    Optional<RemittanceLimit> findByUserId(Long userId);
    
    boolean existsByUserId(Long userId);
} 