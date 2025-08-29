package com.example.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.context.SessionContext;
import com.example.domain.User;
import com.example.dto.QnaAnswerRequest;
import com.example.dto.QnaResponse;
import com.example.dto.QnaSearchRequest;
import com.example.dto.QnaSearchResult;
import com.example.service.QnaService;
import com.example.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/qna")
@RequiredArgsConstructor
public class AdminQnaController {
    
    private final QnaService qnaService;
    
    @PostMapping("/search")
    public ResponseEntity<QnaSearchResult> searchAdminQna(@RequestBody QnaSearchRequest request) {
        QnaSearchResult result = qnaService.searchAdminQna(request);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<QnaResponse> getQnaById(@PathVariable Long id) {
        QnaResponse qna = qnaService.getQnaById(id);
        if (qna == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(qna);
    }

    // Q&A 답변 등록 API
    @PostMapping("/{qnaId}/answer")
    public ResponseEntity<QnaResponse> answerQna(
            @PathVariable Long qnaId,
            @RequestBody QnaAnswerRequest request) {
        
        QnaResponse result = qnaService.answerQna(qnaId, request);
        return ResponseEntity.ok(result);
    }
}
