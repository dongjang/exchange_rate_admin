package com.example.controller;

import com.example.domain.User;
import com.example.dto.QnaRequest;
import com.example.dto.QnaResponse;
import com.example.dto.QnaSearchRequest;
import com.example.service.QnaService;
import com.example.service.UserService;
import lombok.RequiredArgsConstructor;
import com.example.dto.QnaSearchResult;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import com.example.dto.QnaAnswerRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/qna")
@RequiredArgsConstructor
public class QnaController {
    
    private final QnaService qnaService;
    private final UserService userService;
    
    @PostMapping("/search")
    public ResponseEntity<QnaSearchResult> searchQna(
            @RequestBody QnaSearchRequest request,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        
        if (oauth2User == null) {
            return ResponseEntity.status(401).body(null);
        }
        
        String email = oauth2User.getAttribute("email");
        if (email == null) {
            return ResponseEntity.status(400).body(null);
        }
        
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body(null);
        }
        
        QnaSearchResult result = qnaService.searchQna(request, user.getId());
        return ResponseEntity.ok(result);
    }
    
    @PostMapping
    public ResponseEntity<QnaResponse> createQna(
            @ModelAttribute QnaRequest request,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        
        if (oauth2User == null) {
            return ResponseEntity.status(401).body(null);
        }
        
        String email = oauth2User.getAttribute("email");
        if (email == null) {
            return ResponseEntity.status(400).body(null);
        }
        
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body(null);
        }
        
        QnaResponse result = qnaService.createQna(request, user.getId());
        return ResponseEntity.ok(result);
    }
    
    @PutMapping("/{qnaId}")
    public ResponseEntity<QnaResponse> updateQna(
            @PathVariable Long qnaId,
            @ModelAttribute QnaRequest request,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        
        if (oauth2User == null) {
            return ResponseEntity.status(401).body(null);
        }
        
        String email = oauth2User.getAttribute("email");
        if (email == null) {
            return ResponseEntity.status(400).body(null);
        }
        
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body(null);
        }
        
        QnaResponse result = qnaService.updateQna(qnaId, request, user.getId());
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/{qnaId}/cancel")
    public ResponseEntity<Void> cancelQna(
            @PathVariable Long qnaId,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        
        if (oauth2User == null) {
            return ResponseEntity.status(401).build();
        }
        
        String email = oauth2User.getAttribute("email");
        if (email == null) {
            return ResponseEntity.status(400).build();
        }
        
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }
        
        qnaService.cancelQna(qnaId, user.getId());
        return ResponseEntity.ok().build();
    }

    // 관리자용 Q&A 검색 API
    @PostMapping("/admin/search")
    public ResponseEntity<QnaSearchResult> searchAdminQna(@RequestBody QnaSearchRequest request) {
        QnaSearchResult result = qnaService.searchAdminQna(request);
        return ResponseEntity.ok(result);
    }

    // Q&A 미답변 개수 조회 (관리자용)
    @GetMapping("/pending-count")
    public ResponseEntity<Map<String, Integer>> getPendingCount() {
        int pendingCount = qnaService.getPendingCount();
        return ResponseEntity.ok(Map.of("pendingCount", pendingCount));
    }

    // Q&A 답변 등록 API
    @PostMapping("/{qnaId}/answer")
    public ResponseEntity<QnaResponse> answerQna(
            @PathVariable Long qnaId,
            @RequestBody QnaAnswerRequest request,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        
        if (oauth2User == null) {
            return ResponseEntity.status(401).body(null);
        }
        
        String email = oauth2User.getAttribute("email");
        if (email == null) {
            return ResponseEntity.status(400).body(null);
        }
        
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body(null);
        }
        
        QnaResponse result = qnaService.answerQna(qnaId, request, user.getId());
        return ResponseEntity.ok(result);
    }
}
