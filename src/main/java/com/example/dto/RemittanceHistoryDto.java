package com.example.dto;

import com.example.domain.Remittance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RemittanceHistoryDto {
    private Long id;
    private String senderBank;
    private String senderAccount;
    private String receiverBank;
    private String receiverAccount;
    private String receiverName;
    private String receiverCountry;
    private BigDecimal amount;
    private String currency;
    private String status;
    private LocalDateTime createdAt;
    
    public static RemittanceHistoryDto from(Remittance remittance) {
        return RemittanceHistoryDto.builder()
                .id(remittance.getId())
                .senderBank(remittance.getSenderBank())
                .senderAccount(remittance.getSenderAccount())
                .receiverBank(remittance.getReceiverBank())
                .receiverAccount(remittance.getReceiverAccount())
                .receiverName(remittance.getReceiverName())
                .receiverCountry(remittance.getReceiverCountry())
                .amount(remittance.getAmount())
                .currency(remittance.getCurrency())
                .status(remittance.getStatus())
                .createdAt(remittance.getCreatedAt())
                .build();
    }
    
    public String getFormattedCreatedAt() {
        if (createdAt == null) return "";
        return createdAt.format(DateTimeFormatter.ofPattern("yy.MM.dd HH:mm"));
    }
} 