package com.example.controller.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.domain.User;
import com.example.dto.QnaRequest;
import com.example.dto.QnaResponse;
import com.example.dto.QnaSearchRequest;
import com.example.dto.QnaSearchResult;
import com.example.service.QnaService;
import com.example.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/qna")
@RequiredArgsConstructor
public class UserQnaController {
    
    private final QnaService qnaService;
    private final UserService userService;
    
    @PostMapping("/search")
    public ResponseEntity<QnaSearchResult> searchQna(
            @RequestBody QnaSearchRequest request) {
        
        QnaSearchResult result = qnaService.searchQna(request);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/{qnaId}")
    public ResponseEntity<QnaResponse> getQnaById(
            @PathVariable Long qnaId) {
                
        QnaResponse qna = qnaService.getQnaById(qnaId);
        
        return ResponseEntity.ok(qna);
    }
    
    @PostMapping
    public ResponseEntity<QnaResponse> createQna(
            @ModelAttribute QnaRequest request) {
        
        QnaResponse result = qnaService.createQna(request);
        return ResponseEntity.ok(result);
    }
    
    @PutMapping("/{qnaId}")
    public ResponseEntity<QnaResponse> updateQna(
            @PathVariable Long qnaId,
            @ModelAttribute QnaRequest request,
            @AuthenticationPrincipal OAuth2User oauth2User) {
                
        QnaResponse result = qnaService.updateQna(qnaId, request);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/{qnaId}/cancel")
    public ResponseEntity<Void> cancelQna(
            @PathVariable Long qnaId) {

        
        qnaService.cancelQna(qnaId);
        return ResponseEntity.ok().build();
    }
}
