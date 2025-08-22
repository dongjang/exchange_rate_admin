package com.example.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.domain.Remittance;
import com.example.dto.RemittanceHistoryResponse;
import com.example.dto.RemittanceHistorySearchRequest;
import com.example.dto.UserRemittanceHistoryResponse;
import com.example.dto.UserRemittanceHistorySearchRequest;
import com.example.dto.RemittanceLimitCheckResponse;
import com.example.dto.RemittanceLimitRequestResponse;
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

    // 송금 한도 체크
    @PostMapping("/check-limit")
    public ResponseEntity<RemittanceLimitCheckResponse> checkRemittanceLimit(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        
        RemittanceLimitCheckResponse response = remittanceService.checkRemittanceLimit(userId, amount);
        return ResponseEntity.ok(response);
    }

    // 한도 변경 신청 목록 조회 (관리자용)
    @GetMapping("/limit-requests")
    public ResponseEntity<List<RemittanceLimitRequestResponse>> getLimitRequests() {
        List<RemittanceLimitRequestResponse> requests = remittanceService.getLimitRequests();
        return ResponseEntity.ok(requests);
    }


    // 동적 검색 조건으로 송금 이력 조회 (페이징 포함)
    @PostMapping("/history")
    public ResponseEntity<UserRemittanceHistoryResponse> getRemittanceHistory(@RequestBody UserRemittanceHistorySearchRequest params) {
        UserRemittanceHistoryResponse response = remittanceService.getRemittanceHistory(params);
        return ResponseEntity.ok(response);
    }

    // 관리자용 송금 이력 조회
    @PostMapping("/admin/search")
    public ResponseEntity<Map<String, Object>> searchAdminRemittanceHistory(@RequestBody RemittanceHistorySearchRequest searchRequest) {
        int count = remittanceService.getAdminRemittanceHistoryCount(searchRequest);
        if(count > 0){
            List<RemittanceHistoryResponse> result = remittanceService.getAdminRemittanceHistory(searchRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("list", result);
            return ResponseEntity.ok(response);
        }else{
            return ResponseEntity.ok(null);
        }
    }
    

} 