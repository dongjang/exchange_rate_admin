package com.example.controller;

import com.example.dto.DashboardStatsResponse;
import com.example.dto.RemittanceStats;
import com.example.dto.UserStats;
import com.example.dto.ExchangeRateStats;
import com.example.dto.QnaStats;
import com.example.dto.QnaPendingItem;
import com.example.dto.FavoriteCurrencyTop5;
import com.example.dto.RecentRemittanceCount;
import com.example.service.RemittanceService;
import com.example.service.UserService;
import com.example.service.ExchangeRateService;
import com.example.service.QnaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final RemittanceService remittanceService;
    private final UserService userService;
    private final ExchangeRateService exchangeRateService;
    private final QnaService qnaService;
    
    /**
     * 대시보드 통합 통계 조회
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        RemittanceStats remittanceStats = remittanceService.getRemittanceStats();
        UserStats userStats = userService.getUserStats();
        ExchangeRateStats exchangeRateStats = exchangeRateService.getExchangeRateStats();
        QnaStats qnaStats = qnaService.getQnaStats();
        
        DashboardStatsResponse stats = DashboardStatsResponse.builder()
            .remittanceStats(remittanceStats)
            .userStats(userStats)
            .exchangeRateStats(exchangeRateStats)
            .qnaStats(qnaStats)
            .build();
            
        return ResponseEntity.ok(stats);
    }
    
    /**
     * 송금 통계 조회
     */
    @GetMapping("/remittance-stats")
    public ResponseEntity<RemittanceStats> getRemittanceStats() {
        RemittanceStats stats = remittanceService.getRemittanceStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * 사용자 통계 조회
     */
    @GetMapping("/user-stats")
    public ResponseEntity<UserStats> getUserStats() {
        UserStats stats = userService.getUserStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * 환율 통계 조회
     */
    @GetMapping("/exchange-stats")
    public ResponseEntity<ExchangeRateStats> getExchangeRateStats() {
        ExchangeRateStats stats = exchangeRateService.getExchangeRateStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Q&A 통계 조회
     */
    @GetMapping("/qna-stats")
    public ResponseEntity<QnaStats> getQnaStats() {
        QnaStats stats = qnaService.getQnaStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * 관심 환율 TOP5 조회
     */
    @GetMapping("/favorite-currency-top5")
    public ResponseEntity<List<FavoriteCurrencyTop5>> getFavoriteCurrencyTop5() {
        List<FavoriteCurrencyTop5> top5 = exchangeRateService.getFavoriteCurrencyTop5();
        return ResponseEntity.ok(top5);
    }
    
    /**
     * 최근 7일 송금 건수 조회
     */
    @GetMapping("/recent-7days-remittance-count")
    public ResponseEntity<List<RecentRemittanceCount>> getRecent7DaysRemittanceCount() {
        List<RecentRemittanceCount> recentCount = remittanceService.getRecent7DaysRemittanceCount();
        return ResponseEntity.ok(recentCount);
    }
    
    /**
     * 답변 대기 중인 Q&A 리스트 조회 (최대 5개)
     */
    @GetMapping("/pending-qna-list")
    public ResponseEntity<List<QnaPendingItem>> getPendingQnaList() {
        List<QnaPendingItem> pendingList = qnaService.getPendingQnaList();
        return ResponseEntity.ok(pendingList);
    }
} 