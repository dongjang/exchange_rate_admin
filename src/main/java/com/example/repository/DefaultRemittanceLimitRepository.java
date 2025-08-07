package com.example.repository;

import com.example.domain.DefaultRemittanceLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DefaultRemittanceLimitRepository extends JpaRepository<DefaultRemittanceLimit, Long> {
    
    Optional<DefaultRemittanceLimit> findByIsActiveTrue();
} 