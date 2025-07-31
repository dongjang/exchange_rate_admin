package com.example.service;

import com.example.dto.QnaStats;
import com.example.dto.QnaPendingItem;
import com.example.mapper.QnaMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QnaService {
    
    private final QnaMapper qnaMapper;
    
    /**
     * Q&A 통계 조회
     */
    public QnaStats getQnaStats() {
        return qnaMapper.selectQnaStats();
    }
    
    /**
     * 답변 대기 중인 Q&A 리스트 조회 (최대 5개)
     */
    public List<QnaPendingItem> getPendingQnaList() {
        return qnaMapper.selectPendingQnaList();
    }
} 