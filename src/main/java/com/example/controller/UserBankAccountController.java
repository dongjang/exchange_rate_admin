package com.example.controller;

import com.example.domain.UserBankAccount;
import com.example.dto.UserBankAccountResponse;
import com.example.service.UserBankAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/userBankAccount")
@RequiredArgsConstructor
public class UserBankAccountController {
    private final UserBankAccountService userBankAccountService;

    @PostMapping
    public ResponseEntity<UserBankAccountResponse> saveOrUpdate(@RequestBody UserBankAccount account) {
        UserBankAccount saved = userBankAccountService.saveOrUpdate(account);
        return ResponseEntity.ok(UserBankAccountService.toResponse(saved));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserBankAccountResponse> getByUserId(@PathVariable Long userId) {
        UserBankAccount account = userBankAccountService.getByUserId(userId);
        if (account == null) return ResponseEntity.ok(null);
        return ResponseEntity.ok(UserBankAccountService.toResponse(account));
    }
} 