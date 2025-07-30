package com.example.service;

import com.example.domain.UserBankAccount;
import com.example.dto.UserBankAccountResponse;
import com.example.repository.UserBankAccountRepository;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserBankAccountService {
    private final UserBankAccountRepository userBankAccountRepository;

    public UserBankAccount saveOrUpdate(UserBankAccount account) {
        UserBankAccount existing = userBankAccountRepository.findByUserId(account.getUserId());
        if (existing != null) {
            existing.setBankCode(account.getBankCode());
            existing.setAccountNumber(account.getAccountNumber());
            existing.setUpdatedAt(LocalDateTime.now());
            return userBankAccountRepository.save(existing);
        } else {
            account.setUpdatedAt(LocalDateTime.now());
            return userBankAccountRepository.save(account);
        }
    }

    public UserBankAccount getByUserId(Long userId) {
        return userBankAccountRepository.findByUserId(userId);
    }

    public static UserBankAccountResponse toResponse(UserBankAccount entity) {
        if (entity == null) return null;
        return UserBankAccountResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .bankCode(entity.getBankCode())
                .accountNumber(entity.getAccountNumber())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
} 