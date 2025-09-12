package com.example.controller.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.DefaultRemittanceLimitRequest;
import com.example.dto.DefaultRemittanceLimitResponse;
import com.example.dto.RemittanceHistoryResponse;
import com.example.dto.RemittanceHistorySearchRequest;
import com.example.dto.RemittanceLimitRequestResponse;
import com.example.service.AdminRemittanceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/admin/remittances")
@RequiredArgsConstructor
public class AdminRemittanceController {
    private final AdminRemittanceService remittanceService;

    @GetMapping("/limit-requests")
    public ResponseEntity<List<RemittanceLimitRequestResponse>> getLimitRequests() {
        List<RemittanceLimitRequestResponse> requests = remittanceService.getLimitRequests();
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/search")
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
    
    @PostMapping("/remittance-limit-requests/search")
    public ResponseEntity<Map<String, Object>> getAdminRequests(@RequestBody Map<String, Object> searchRequest) {
        int count = remittanceService.countAdminRequests(searchRequest);
        if(count > 0){
            List<RemittanceLimitRequestResponse> requests = remittanceService.getAdminRequests(searchRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("list", requests);
            return ResponseEntity.ok(response);
        }else{
            return ResponseEntity.ok(null);
        }
    }

    @PutMapping("/remittance-limit-requests/{requestId}/process")
    public ResponseEntity<Void> processRequest(@PathVariable Long requestId, @RequestBody Map<String, Object> request) {
        System.out.println("request: " + request);
        try {
            //RemittanceLimitRequest.RequestStatus requestStatus = RemittanceLimitRequest.RequestStatus.valueOf(status.toUpperCase());
            remittanceService.processRequest(requestId, request);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 현재 기본 한도 조회
     */
    @GetMapping("/default-remittance-limit")
    public ResponseEntity<DefaultRemittanceLimitResponse> getDefaultLimit() {
        try {
            DefaultRemittanceLimitResponse response = remittanceService.getDefaultLimit();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("기본 한도 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 기본 한도 업데이트
     */
    @PutMapping("/default-remittance-limit/update")
    public ResponseEntity<Void> updateDefaultLimit(@RequestBody DefaultRemittanceLimitRequest request) {
        try {
            remittanceService.updateDefaultLimit(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("기본 한도 업데이트 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 