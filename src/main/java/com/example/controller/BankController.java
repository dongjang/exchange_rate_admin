package com.example.controller;

import com.example.dto.BanksInfoResponse;
import com.example.repository.BankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bank")
@RequiredArgsConstructor
public class BankController {
    private final BankRepository bankRepository;

    @GetMapping
    public List<BanksInfoResponse> getBanks(@RequestParam String currencyCode) {
        return bankRepository.findBanksByCurrencyCode(currencyCode);
    }
} 