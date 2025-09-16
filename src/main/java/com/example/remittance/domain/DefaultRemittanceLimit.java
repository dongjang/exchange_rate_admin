package com.example.remittance.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "default_remittance_limit")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DefaultRemittanceLimit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "daily_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal dailyLimit;
    
    @Column(name = "monthly_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyLimit;
    
    @Column(name = "single_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal singleLimit;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "admin_id")
    private Long adminId;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    

} 