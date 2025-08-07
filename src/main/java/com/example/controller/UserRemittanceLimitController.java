package com.example.controller;

import com.example.dto.UserRemittanceLimitResponse;
import com.example.service.UserRemittanceLimitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/remittance-limit")
@RequiredArgsConstructor
@Slf4j
public class UserRemittanceLimitController {
    
    private final UserRemittanceLimitService userRemittanceLimitService;
    
    /**
     * 현재 로그인한 사용자의 송금 한도 조회
     */
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
} 