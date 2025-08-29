package com.example.controller.user;

import java.io.IOException;
import java.math.BigDecimal;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.domain.Remittance;
import com.example.domain.RemittanceLimitRequest;
import com.example.dto.RemittanceLimitCheckResponse;
import com.example.dto.RemittanceLimitRequestWithFilesResponse;
import com.example.dto.UserRemittanceHistoryResponse;
import com.example.dto.UserRemittanceHistorySearchRequest;
import com.example.dto.UserRemittanceLimitResponse;
import com.example.service.RemittanceLimitRequestService;
import com.example.service.RemittanceService;
import com.example.service.UserRemittanceLimitService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/users/remittances")
@RequiredArgsConstructor
@Slf4j
public class UserRemittanceController {
    private final RemittanceService remittanceService;
    private final UserRemittanceLimitService userRemittanceLimitService;
    private final RemittanceLimitRequestService remittanceLimitRequestService;
    
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

    // 동적 검색 조건으로 송금 이력 조회 (페이징 포함)
    @PostMapping("/history")
    public ResponseEntity<UserRemittanceHistoryResponse> getRemittanceHistory(@RequestBody UserRemittanceHistorySearchRequest params) {
        UserRemittanceHistoryResponse response = remittanceService.getRemittanceHistory(params);
        return ResponseEntity.ok(response);
    }   

    @GetMapping
    public ResponseEntity<UserRemittanceLimitResponse> getUserRemittanceLimit(@RequestParam Long userId) {
        try {
            UserRemittanceLimitResponse response = userRemittanceLimitService.getUserRemittanceLimit(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("사용자 송금 한도 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<RemittanceLimitRequestWithFilesResponse>> getUserRequests(@PathVariable Long userId) {
        List<RemittanceLimitRequestWithFilesResponse> requests = remittanceLimitRequestService.getUserRequests(userId);
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/{userId}/{requestId}")
    public ResponseEntity<RemittanceLimitRequest> getUserRequest(@PathVariable Long userId, @PathVariable Long requestId) {
        RemittanceLimitRequest request = remittanceLimitRequestService.getUserRequestById(requestId, userId);
        if (request == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(request);
    }
    
    @PostMapping("/{userId}")
    public ResponseEntity<RemittanceLimitRequest> createRequest(@PathVariable Long userId,
                                                              @RequestParam("dailyLimit") BigDecimal dailyLimit,
                                                              @RequestParam("monthlyLimit") BigDecimal monthlyLimit,
                                                              @RequestParam("singleLimit") BigDecimal singleLimit,
                                                              @RequestParam("reason") String reason,
                                                              @RequestParam(value = "incomeFile", required = false) MultipartFile incomeFile,
                                                              @RequestParam(value = "bankbookFile", required = false) MultipartFile bankbookFile,
                                                              @RequestParam(value = "businessFile", required = false) MultipartFile businessFile) {
        try {
            RemittanceLimitRequest request = remittanceLimitRequestService.createRequest(
                userId, dailyLimit, monthlyLimit, singleLimit, reason, incomeFile, bankbookFile, businessFile);
            return ResponseEntity.ok(request);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{userId}/{requestId}")
    public ResponseEntity<RemittanceLimitRequest> updateRequest(@PathVariable Long userId,
                                                              @PathVariable Long requestId,
                                                              @RequestParam("dailyLimit") BigDecimal dailyLimit,
                                                              @RequestParam("monthlyLimit") BigDecimal monthlyLimit,
                                                              @RequestParam("singleLimit") BigDecimal singleLimit,
                                                              @RequestParam("reason") String reason,
                                                              @RequestParam(value = "incomeFile", required = false) MultipartFile incomeFile,
                                                              @RequestParam(value = "bankbookFile", required = false) MultipartFile bankbookFile,
                                                              @RequestParam(value = "businessFile", required = false) MultipartFile businessFile,
                                                              @RequestParam(value = "isRerequest", defaultValue = "false") boolean isRerequest) {
        try {
            RemittanceLimitRequest request = remittanceLimitRequestService.updateRequest(
                requestId, userId, dailyLimit, monthlyLimit, singleLimit, reason, incomeFile, bankbookFile, businessFile, isRerequest);
            return ResponseEntity.ok(request);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }
        
    // 신청 취소 API
    @DeleteMapping("/{userId}/{requestId}")
    public ResponseEntity<Void> cancelRequest(@PathVariable Long userId, @PathVariable Long requestId) {
        try {
            remittanceLimitRequestService.cancelRequest(requestId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

} 