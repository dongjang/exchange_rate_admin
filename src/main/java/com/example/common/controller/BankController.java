package com.example.common.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.common.dto.BankRequest;
import com.example.common.dto.BankResponse;
import com.example.common.dto.BankSearchRequest;
import com.example.common.service.BankService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/banks")
@RequiredArgsConstructor
public class BankController {
    
    private final BankService bankService;
    
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchBanks(@RequestBody BankSearchRequest searchRequest) {
        int count = bankService.getBankCount(searchRequest);
        if(count > 0){
            List<BankResponse> result = bankService.searchBanks(searchRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("totalElements", count);
            response.put("content", result);
            response.put("totalPages", (int) Math.ceil((double) count / searchRequest.getSize()));
            return ResponseEntity.ok(response);
        }else{
            Map<String, Object> response = new HashMap<>();
            response.put("totalElements", 0);
            response.put("content", new java.util.ArrayList<>());
            response.put("totalPages", 0);
            return ResponseEntity.ok(response);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BankResponse> getBankById(@PathVariable("id") Long id) {
        BankResponse bank = bankService.getBankById(id);
        if (bank == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(bank);
    }
    
    @PostMapping
    public ResponseEntity<Void> createBank(@RequestBody BankRequest request) {
        bankService.createBank(request);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateBank(@PathVariable("id") Long id, @RequestBody BankRequest request) {
        bankService.updateBank(id, request);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBank(@PathVariable("id") Long id) {
        bankService.deleteBank(id);
        return ResponseEntity.ok().build();
    }

} 