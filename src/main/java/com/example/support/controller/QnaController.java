package com.example.support.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.support.dto.QnaAnswerRequest;
import com.example.support.dto.QnaResponse;
import com.example.support.dto.QnaSearchRequest;
import com.example.support.dto.QnaSearchResult;
import com.example.support.service.QnaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/qna")
@RequiredArgsConstructor
public class QnaController {
    
    private final QnaService adminQnaService;
    
    @PostMapping("/search")
    public ResponseEntity<QnaSearchResult> searchAdminQna(@RequestBody QnaSearchRequest request) {
        QnaSearchResult result = adminQnaService.searchAdminQna(request);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<QnaResponse> getQnaById(@PathVariable("id") Long id) {
        QnaResponse qna = adminQnaService.getQnaById(id);
        if (qna == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(qna);
    }

    // Q&A 답변 등록 API
    @PostMapping("/{qnaId}/answer")
    public ResponseEntity<QnaResponse> answerQna(
            @PathVariable("qnaId") Long qnaId,
            @RequestBody QnaAnswerRequest request) {
        
        QnaResponse result = adminQnaService.answerQna(qnaId, request);
        return ResponseEntity.ok(result);
    }
}
