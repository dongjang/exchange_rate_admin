package com.example.repository;

import com.example.domain.UserBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBankAccountRepository extends JpaRepository<UserBankAccount, Long> {
    UserBankAccount findByUserId(Long userId);
} 