package com.example.mapper;

import com.example.dto.QnaStats;
import com.example.dto.QnaPendingItem;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface QnaMapper {
    
    /**
     * Q&A 통계 조회
     */
    QnaStats selectQnaStats();
    
    /**
     * 답변 대기 중인 Q&A 리스트 조회 (최대 5개)
     */
    List<QnaPendingItem> selectPendingQnaList();
} 