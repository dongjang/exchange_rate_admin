package com.example.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "remittance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Remittance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "sender_bank", length = 20)
    private String senderBank;

    @Column(name = "sender_account", length = 100)
    private String senderAccount;

    @Column(name = "receiver_bank", length = 20)
    private String receiverBank;

    @Column(name = "receiver_account", length = 100)
    private String receiverAccount;

    @Column(name = "receiver_name", length = 100)
    private String receiverName;

    @Column(name = "receiver_country", length = 50)
    private String receiverCountry;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(length = 10, nullable = false)
    private String currency;

    @Column(length = 20, nullable = false)
    private String status = "COMPLETED";

    @Column(name = "created_at", columnDefinition = "TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP")
    private LocalDateTime updatedAt;
} 