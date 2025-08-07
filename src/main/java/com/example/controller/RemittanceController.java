package com.example.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.domain.Remittance;
import com.example.dto.RemittanceHistoryDto;
import com.example.dto.RemittanceHistorySearchRequest;
import com.example.dto.RemittanceHistoryResponse;
import com.example.dto.UserRemittanceHistoryResponse;
import com.example.dto.UserRemittanceHistorySearchRequest;
import com.example.service.RemittanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/remittances")
@RequiredArgsConstructor
public class RemittanceController {
    private final RemittanceService remittanceService;

    // 송금 신청
    @PostMapping
    public ResponseEntity<Remittance> createRemittance(@RequestBody Remittance remittance) {
        Remittance saved = remittanceService.create(remittance);
        return ResponseEntity.ok(saved);
    }



    // 동적 검색 조건으로 송금 이력 조회 (페이징 포함)
    @PostMapping("/history")
    public ResponseEntity<UserRemittanceHistoryResponse> getRemittanceHistory(@RequestBody UserRemittanceHistorySearchRequest params) {
        UserRemittanceHistoryResponse response = remittanceService.getRemittanceHistory(params);
        return ResponseEntity.ok(response);
    }

    // 관리자용 송금 이력 조회
    @PostMapping("/admin/search")
    public ResponseEntity<List<com.example.dto.RemittanceHistoryResponse>> searchAdminRemittanceHistory(@RequestBody com.example.dto.RemittanceHistorySearchRequest searchRequest) {
        List<com.example.dto.RemittanceHistoryResponse> result = remittanceService.getAdminRemittanceHistory(searchRequest);
        return ResponseEntity.ok(result);
    }
    
    // 관리자용 송금 이력 개수 조회
    @PostMapping("/admin/count")
    public ResponseEntity<Integer> countAdminRemittanceHistory(@RequestBody com.example.dto.RemittanceHistorySearchRequest searchRequest) {
        int count = remittanceService.getAdminRemittanceHistoryCount(searchRequest);
        return ResponseEntity.ok(count);
    }

} 