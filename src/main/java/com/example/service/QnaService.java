package com.example.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.domain.File;
import com.example.domain.Qna;
import com.example.domain.User;
import com.example.dto.QnaRequest;
import com.example.dto.QnaResponse;
import com.example.dto.QnaSearchRequest;
import com.example.dto.QnaSearchResult;
import com.example.mapper.QnaMapper;
import com.example.repository.QnaRepository;
import com.example.repository.UserRepository;
import com.example.dto.QnaAnswerRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QnaService {
    
    private final QnaRepository qnaRepository;
    private final UserRepository userRepository;
    private final FileService fileService;
    private final QnaMapper qnaMapper;
    
    @Transactional(readOnly = true)
    public QnaSearchResult searchQna(QnaSearchRequest request, Long userId) {
        // 검색 조건 설정
        request.setUserId(userId);
        request.setExcludeCanceled(true);
                
        List<QnaResponse> list = qnaMapper.selectQnaList(request);
        int totalCount = qnaMapper.selectQnaCount(request);
        
        return new QnaSearchResult(list, totalCount, request.getSize());
    }

    @Transactional(readOnly = true)
    public QnaSearchResult searchAdminQna(QnaSearchRequest request) {
        // 관리자용 검색 - 모든 Q&A 조회 (CANCELED 포함)
        List<QnaResponse> list = qnaMapper.selectQnaList(request);
        int totalCount = qnaMapper.selectQnaCount(request);
        
        return new QnaSearchResult(list, totalCount, request.getSize());
    }
    
    @Transactional
    public QnaResponse createQna(QnaRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        Qna qna = new Qna();
        qna.setUser(user);
        qna.setTitle(request.getTitle());
        qna.setContent(request.getContent());
        qna.setStatus(Qna.QnaStatus.PENDING);
        qna.setCreatedAt(LocalDateTime.now());
        
        // 파일 처리
        if (request.getFile() != null && !request.getFile().isEmpty()) {
            try {
                File file = fileService.uploadFile(request.getFile(), userId);
                qna.setFile(file);
            } catch (Exception e) {
                throw new RuntimeException("파일 업로드에 실패했습니다.", e);
            }
        }
        
        Qna savedQna = qnaRepository.save(qna);
        return convertToResponse(savedQna);
    }
    
    @Transactional
    public QnaResponse updateQna(Long qnaId, QnaRequest request, Long userId) {
        Qna qna = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new RuntimeException("Q&A를 찾을 수 없습니다."));
        
        // 본인의 Q&A만 수정 가능
        if (!qna.getUser().getId().equals(userId)) {
            throw new RuntimeException("본인의 Q&A만 수정할 수 있습니다.");
        }
        
        // PENDING 상태가 아니면 수정 불가
        if (qna.getStatus() != Qna.QnaStatus.PENDING) {
            throw new RuntimeException("답변이 완료된 Q&A는 수정할 수 없습니다.");
        }
        
        qna.setTitle(request.getTitle());
        qna.setContent(request.getContent());
        qna.setUpdatedAt(LocalDateTime.now());
        
        // 파일 처리
        if (request.getFile() != null && !request.getFile().isEmpty()) {
            // 기존 파일 삭제
            if (qna.getFile() != null) {
                fileService.deleteFile(qna.getFile().getId());
            }
            
            // 새 파일 저장
            try {
                File file = fileService.uploadFile(request.getFile(), userId);
                qna.setFile(file);
            } catch (Exception e) {
                throw new RuntimeException("파일 업로드에 실패했습니다.", e);
            }
        }else if(request.isRemoveExistingFile()){
            if(qna.getFile() != null){
                fileService.deleteFile(qna.getFile().getId());
                qna.setFile(null);
            }
        }
        
        Qna updatedQna = qnaRepository.save(qna);
        return convertToResponse(updatedQna);
    }
    
    @Transactional
    public void cancelQna(Long qnaId, Long userId) {
        Qna qna = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new RuntimeException("Q&A를 찾을 수 없습니다."));
        
        // 본인의 Q&A만 취소 가능
        if (!qna.getUser().getId().equals(userId)) {
            throw new RuntimeException("본인의 Q&A만 취소할 수 있습니다.");
        }
        
        // PENDING 상태가 아니면 취소 불가
        if (qna.getStatus() != Qna.QnaStatus.PENDING) {
            throw new RuntimeException("답변이 완료된 Q&A는 취소할 수 없습니다.");
        }
        
        qnaMapper.updateQnaStatus(qnaId, "CANCELED");
    }
    
    @Transactional
    public QnaResponse answerQna(Long qnaId, QnaAnswerRequest request, Long answerUserId) {
        Qna qna = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new RuntimeException("Q&A를 찾을 수 없습니다."));
        
        // PENDING 상태가 아니면 답변 불가
        if (qna.getStatus() != Qna.QnaStatus.PENDING) {
            throw new RuntimeException("이미 답변이 완료된 Q&A입니다.");
        }
        
        User answerUser = userRepository.findById(answerUserId)
                .orElseThrow(() -> new RuntimeException("답변자를 찾을 수 없습니다."));
        
        qna.setAnswerContent(request.getAnswerContent());
        qna.setAnswerUser(answerUser);
        qna.setStatus(Qna.QnaStatus.ANSWERED);
        qna.setAnsweredAt(LocalDateTime.now());
        
        Qna answeredQna = qnaRepository.save(qna);
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
        
        if (qna.getFile() != null) {
            response.setFileId(qna.getFile().getId());
            response.setFileName(qna.getFile().getOriginalName());
        }
        
        if (qna.getAnswerUser() != null) {
            response.setAnswerUserId(qna.getAnswerUser().getId());
            response.setAnswerUserName(qna.getAnswerUser().getName());
        }
        
        return response;
    }
    
    @Transactional(readOnly = true)
    public int getPendingCount() {
        return qnaRepository.countByStatus(Qna.QnaStatus.PENDING);
    }
} 