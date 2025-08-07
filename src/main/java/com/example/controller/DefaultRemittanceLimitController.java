package com.example.controller;

import com.example.dto.DefaultRemittanceLimitRequest;
import com.example.dto.DefaultRemittanceLimitResponse;
import com.example.service.DefaultRemittanceLimitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/admin/default-remittance-limit")
@RequiredArgsConstructor
public class DefaultRemittanceLimitController {
    
    private final DefaultRemittanceLimitService defaultRemittanceLimitService;
    
    /**
     * 현재 기본 한도 조회
     */
    @GetMapping
    public ResponseEntity<DefaultRemittanceLimitResponse> getDefaultLimit() {
        try {
            DefaultRemittanceLimitResponse response = defaultRemittanceLimitService.getDefaultLimit();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("기본 한도 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 기본 한도 업데이트
     */
    @PutMapping
    public ResponseEntity<Void> updateDefaultLimit(@RequestBody DefaultRemittanceLimitRequest request) {
        try {
            defaultRemittanceLimitService.updateDefaultLimit(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("기본 한도 업데이트 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 