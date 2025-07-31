package com.example.mapper;

import com.example.dto.UserStats;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    
    /**
     * 사용자 통계 조회
     */
    UserStats selectUserStats();
} 