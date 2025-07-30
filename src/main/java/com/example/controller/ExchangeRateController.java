package com.example.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.FavoriteCurrencyRequest;
import com.example.dto.FavoriteCurrencyResponse;
import com.example.service.ExchangeRateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/exchange")
public class ExchangeRateController {
    private final ExchangeRateService exchangeRateService;

    // 환율 조회
    @GetMapping("/exchangeRates")
    public String getExchangeRates() {
        return exchangeRateService.getRates();
    }

    // 로그인된 사용자의 관심 환율 조회
    @GetMapping("/favoriteRatesList/{userId}")
    public List<String> getFavoriteCurrencyCodes(@PathVariable Long userId) {
        return exchangeRateService.getFavoriteCurrencyCodes(userId);
    }

    // 관심 환율 등록/삭제제
    @PostMapping("/saveFavoriteRates")
    public void saveOrDeleteFavoriteCurrency(@RequestBody FavoriteCurrencyRequest request) {
        exchangeRateService.saveOrDeleteFavoriteCurrency(request);
    }


} 