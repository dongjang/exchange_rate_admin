package com.example.support.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.admin.domain.Admin;
import com.example.admin.repository.AdminRepository;
import com.example.common.service.EmailService;
import com.example.context.SessionContext;
import com.example.support.domain.Qna;
import com.example.support.dto.QnaAnswerRequest;
import com.example.support.dto.QnaResponse;
import com.example.support.dto.QnaSearchRequest;
import com.example.support.dto.QnaSearchResult;
import com.example.support.mapper.QnaMapper;
import com.example.user.repository.QnaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QnaService {
    
    private final QnaRepository qnaRepository;
    private final QnaMapper qnaMapper;
    private final AdminRepository adminRepository;
    private final EmailService emailService;
    
    @Transactional(readOnly = true)
    public QnaSearchResult searchAdminQna(QnaSearchRequest request) {
        // 모든 Q&A 조회 (CANCELED 포함)
        List<QnaResponse> list = qnaMapper.selectQnaList(request);
        int totalCount = qnaMapper.selectQnaCount(request);
        
        return new QnaSearchResult(list, totalCount, request.getSize());
    }

    @Transactional
    public QnaResponse answerQna(Long qnaId, QnaAnswerRequest request) {
        Qna qna = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new RuntimeException("Q&A를 찾을 수 없습니다."));
        
        // PENDING 상태가 아니면 답변 불가
        if (qna.getStatus() != Qna.QnaStatus.PENDING) {
            throw new RuntimeException("이미 답변이 완료된 Q&A입니다.");
        }
        
        Long answerUserId = SessionContext.getCurrentAdminId();
        
        qna.setAnswerContent(request.getAnswerContent());
        qna.setAnswerUserId(answerUserId);
        qna.setStatus(Qna.QnaStatus.ANSWERED);
        qna.setAnsweredAt(LocalDateTime.now());
        
        Qna answeredQna = qnaRepository.save(qna);
        
        // QNA 답변 이메일 발송
        try {
            if (answeredQna.getUser() != null && answeredQna.getUser().getEmail() != null) {
                emailService.sendQnaAnswerEmail(
                    answeredQna.getUser().getEmail(),
                    answeredQna.getUser().getName(),
                    answeredQna.getTitle(),
                    answeredQna.getContent(),
                    answeredQna.getAnswerContent()
                );
                System.out.println("QNA 답변 이메일 발송 완료: " + answeredQna.getUser().getEmail());
            } else {
                System.out.println("QNA 답변 이메일 발송 건너뜀: 사용자 이메일 정보 없음");
            }
        } catch (Exception e) {
            System.err.println("QNA 답변 이메일 발송 실패: " + e.getMessage());
            // 이메일 발송 실패해도 답변 등록은 성공으로 처리
        }
        
        return convertToResponse(answeredQna);
    }
    
    private QnaResponse convertToResponse(Qna qna) {
        QnaResponse response = new QnaResponse();
        response.setId(qna.getId());
        response.setTitle(qna.getTitle());
        response.setContent(qna.getContent());
        response.setStatus(qna.getStatus().name());
        response.setCreatedAt(qna.getCreatedAt());
        response.setUpdatedAt(qna.getUpdatedAt());
        response.setAnsweredAt(qna.getAnsweredAt());
        response.setAnswerContent(qna.getAnswerContent());
        
        if (qna.getUser() != null) {
            response.setUserId(qna.getUser().getId());
            response.setUserName(qna.getUser().getName());
        }
        
        if (qna.getFile() != null) {
            response.setFileId(qna.getFile().getId());
            response.setFileName(qna.getFile().getOriginalName());
        }
        
        if (qna.getAnswerUserId() != null) {
            response.setAnswerUserId(qna.getAnswerUserId());
            Admin answerUser = adminRepository.findById(qna.getAnswerUserId())
                    .orElseThrow(() -> new RuntimeException("답변자를 찾을 수 없습니다."));
            response.setAnswerUserName(answerUser.getName());
        }
        
        return response;
    }
    
    @Transactional(readOnly = true)
    public QnaResponse getQnaById(Long qnaId) {
        Qna qna = qnaRepository.findById(qnaId)
                .orElse(null);
        
        if (qna == null) {
            return null;
        }
        
        return convertToResponse(qna);
    }
} 