package com.example.controller;

import com.example.domain.RemittanceLimitRequest;
import com.example.dto.RemittanceLimitRequestResponse;
import com.example.dto.RemittanceLimitRequestWithFilesResponse;
import com.example.service.RemittanceLimitRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/remittance-limit-requests")
public class RemittanceLimitRequestController {
    
    private final RemittanceLimitRequestService remittanceLimitRequestService;
    
    public RemittanceLimitRequestController(RemittanceLimitRequestService remittanceLimitRequestService) {
        this.remittanceLimitRequestService = remittanceLimitRequestService;
    }
    
    // 사용자 페이지용 API
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RemittanceLimitRequestWithFilesResponse>> getUserRequests(@PathVariable Long userId) {
        List<RemittanceLimitRequestWithFilesResponse> requests = remittanceLimitRequestService.getUserRequests(userId);
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/user/{userId}/{requestId}")
    public ResponseEntity<RemittanceLimitRequest> getUserRequest(@PathVariable Long userId, @PathVariable Long requestId) {
        RemittanceLimitRequest request = remittanceLimitRequestService.getUserRequestById(requestId, userId);
        if (request == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(request);
    }
    
    @PostMapping("/user/{userId}")
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
    
    @PutMapping("/user/{userId}/{requestId}")
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
    
    // 관리자 페이지용 API
    @PostMapping("/admin/search")
    public ResponseEntity<Map<String, Object>> getAdminRequests(@RequestBody Map<String, Object> searchRequest) {
        int count = remittanceLimitRequestService.countAdminRequests(searchRequest);
        if(count > 0){
            List<RemittanceLimitRequestResponse> requests = remittanceLimitRequestService.getAdminRequests(searchRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("list", requests);
            return ResponseEntity.ok(response);
        }else{
            return ResponseEntity.ok(null);
        }
    }
    
    @GetMapping("/admin/{requestId}")
    public ResponseEntity<RemittanceLimitRequestResponse> getAdminRequest(@PathVariable Long requestId) {
        RemittanceLimitRequestResponse request = remittanceLimitRequestService.getAdminRequestById(requestId);
        if (request == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(request);
    }
    
    @PutMapping("/admin/{requestId}/process")
    public ResponseEntity<Void> processRequest(@PathVariable Long requestId,
                                             @RequestParam("status") String status,
                                             @RequestParam("adminId") Long adminId,
                                             @RequestParam(value = "adminComment", required = false) String adminComment,
                                             @RequestParam(value = "userId", required = false) Long userId,
                                             @RequestParam(value = "dailyLimit", required = false) BigDecimal dailyLimit,
                                             @RequestParam(value = "monthlyLimit", required = false) BigDecimal monthlyLimit,
                                             @RequestParam(value = "singleLimit", required = false) BigDecimal singleLimit) {
        try {
            RemittanceLimitRequest.RequestStatus requestStatus = RemittanceLimitRequest.RequestStatus.valueOf(status.toUpperCase());
            remittanceLimitRequestService.processRequest(requestId, requestStatus, adminId, adminComment, userId, dailyLimit, monthlyLimit, singleLimit);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 신청 취소 API
    @DeleteMapping("/user/{userId}/{requestId}")
    public ResponseEntity<Void> cancelRequest(@PathVariable Long userId, @PathVariable Long requestId) {
        try {
            remittanceLimitRequestService.cancelRequest(requestId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 