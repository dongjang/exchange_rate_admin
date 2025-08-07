package com.example.mapper;

import com.example.domain.DefaultRemittanceLimit;
import com.example.dto.DefaultRemittanceLimitResponse;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DefaultRemittanceLimitMapper {
    
    // 현재 기본 한도 조회
    DefaultRemittanceLimitResponse selectDefaultLimit();
    
    // 기본 한도 업데이트
    int updateDefaultLimit(DefaultRemittanceLimit defaultLimit);
} 