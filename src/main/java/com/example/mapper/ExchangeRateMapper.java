package com.example.mapper;

import com.example.dto.ExchangeRateStats;
import com.example.dto.FavoriteCurrencyTop5;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ExchangeRateMapper {
    
    /**
     * 환율 통계 조회
     */
    ExchangeRateStats selectExchangeRateStats();
    
    /**
     * 관심 환율 TOP5 조회
     */
    List<FavoriteCurrencyTop5> selectFavoriteCurrencyTop5();
} 