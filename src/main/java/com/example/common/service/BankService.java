package com.example.common.service;

import java.util.List;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.common.domain.Bank;
import com.example.common.dto.BankRequest;
import com.example.common.dto.BankResponse;
import com.example.common.dto.BankSearchRequest;
import com.example.common.mapper.BankMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BankService {
    
    private final BankMapper bankMapper;
    
    public List<BankResponse> searchBanks(BankSearchRequest searchRequest) {
        List<BankResponse> banks = bankMapper.getBankList(searchRequest);
        return banks;
    }
    
    public int getBankCount(BankSearchRequest searchRequest) {
        return bankMapper.getBankCount(searchRequest);
    }
    
    public BankResponse getBankById(Long id) {
        Bank bank = bankMapper.getBankById(id);
        return bank != null ? convertToResponse(bank) : null;
    }
    
    @Transactional
    public void createBank(BankRequest request) {
        Bank bank = new Bank();
        bank.setName(request.getName());
        bank.setCurrencyCode(request.getCurrencyCode());
        bank.setBankCode(generateBankCode());
        bankMapper.insertBank(bank);
    }
    
    @Transactional
    public void updateBank(Long id, BankRequest request) {
        Bank bank = new Bank();
        bank.setId(id);
        bank.setName(request.getName());
        bank.setCurrencyCode(request.getCurrencyCode());
        bankMapper.updateBank(bank);
    }
    
    @Transactional
    public void deleteBank(Long id) {
        bankMapper.deleteBank(id);
    }

    private String generateBankCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        String bankCode;
        
        do {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            bankCode = sb.toString();
        } while (bankMapper.existsByBankCode(bankCode));
        
        return bankCode;
    }
    
    private BankResponse convertToResponse(Bank bank) {
        return BankResponse.builder()
                .id(bank.getId())
                .name(bank.getName())
                .bankCode(bank.getBankCode())
                .currencyCode(bank.getCurrencyCode())
                .countryName(bank.getCountryName())
                .build();
    }
}
