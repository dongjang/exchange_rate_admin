package com.example.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.domain.UserRemittanceLimit;

@Repository
public interface UserRemittanceLimitRepository extends JpaRepository<UserRemittanceLimit, Long> {
    
    Optional<UserRemittanceLimit> findByUserId(Long userId);
    
    boolean existsByUserId(Long userId);
} 