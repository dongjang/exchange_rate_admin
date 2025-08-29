package com.example.controller.user;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.domain.UserBankAccount;
import com.example.dto.BankResponse;
import com.example.dto.BanksInfoResponse;
import com.example.dto.UserBankAccountResponse;
import com.example.repository.BankRepository;
import com.example.service.UserBankAccountService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/banks")
@RequiredArgsConstructor
public class UserBankController {
    
    private final BankRepository bankRepository;
    private final UserBankAccountService userBankAccountService;

    @GetMapping("/currency_bank_info")
    public ResponseEntity<List<BankResponse>> getBanksByCurrency(@RequestParam String currencyCode) {
        List<BanksInfoResponse> banks = bankRepository.findBanksByCurrencyCode(currencyCode);
        List<BankResponse> responses = banks.stream()
                .map(bank -> BankResponse.builder()
                        .id(null) // BanksInfoResponse에는 id가 없음
                        .name(bank.getName())
                        .bankCode(bank.getBankCode())
                        .currencyCode(currencyCode) // 파라미터로 받은 currencyCode 사용
                        .countryName(null) // BanksInfoResponse에는 countryName이 없음
                        .codeName(null) // BanksInfoResponse에는 codeName이 없음
                        .build())
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    
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