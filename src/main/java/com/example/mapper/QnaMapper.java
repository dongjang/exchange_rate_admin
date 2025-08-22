package com.example.mapper;

import com.example.dto.QnaResponse;
import com.example.dto.QnaSearchRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface QnaMapper {
    
    List<QnaResponse> selectQnaList(QnaSearchRequest request);
    
    int selectQnaCount(QnaSearchRequest request);
    
    void updateQnaStatus(@Param("qnaId") Long qnaId, @Param("status") String status);
} 