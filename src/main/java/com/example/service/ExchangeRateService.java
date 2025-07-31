package com.example.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.example.domain.User;
import com.example.domain.UserFavoriteCurrency;
import com.example.dto.FavoriteCurrencyRequest;
import com.example.dto.FavoriteCurrencyResponse;
import com.example.dto.ExchangeRateStats;
import com.example.dto.FavoriteCurrencyTop5;
import com.example.mapper.ExchangeRateMapper;
import com.example.repository.UserFavoriteCurrencyRepository;
import com.example.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {
    private final UserFavoriteCurrencyRepository userFavoriteCurrencyRepository;
    private final UserRepository userRepository;
    private final ExchangeRateMapper exchangeRateMapper;

    @Value("${exchange.api-key}")
    private String apiKey;

    public String getRates() {
        String url = "https://v6.exchangerate-api.com/v6/" + apiKey + "/latest/USD";
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(url, String.class);
    }


    public List<String> getFavoriteCurrencyCodes(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        return userFavoriteCurrencyRepository.findCurrencyCodesByUser(user);
    }

    public List<FavoriteCurrencyResponse> getFavoriteCurrencyResponses(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        return userFavoriteCurrencyRepository.findByUser(user).stream()
                .map(FavoriteCurrencyResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveOrDeleteFavoriteCurrency(FavoriteCurrencyRequest request) {
        String type = request.getType(); // "ADD" or "DEL"
        Long userId = request.getUser_id();
        String currencyCode = request.getCurrency_code();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if ("ADD".equals(type)) {
            // 중복 방지
            if (!userFavoriteCurrencyRepository.existsByUserAndCurrencyCode(user, currencyCode)) {
                UserFavoriteCurrency favorite = UserFavoriteCurrency.builder()
                        .user(user)
                        .currencyCode(currencyCode)
                        .createdAt(LocalDateTime.now())
                        .build();
                userFavoriteCurrencyRepository.save(favorite);
            }
        } else if ("DEL".equals(type)) {
            userFavoriteCurrencyRepository.deleteByUserAndCurrencyCode(user, currencyCode);
        }
    }
    
    /**
     * 환율 통계 조회
     */
    public ExchangeRateStats getExchangeRateStats() {
        return exchangeRateMapper.selectExchangeRateStats();
    }
    
    /**
     * 관심 환율 TOP5 조회
     */
    public List<FavoriteCurrencyTop5> getFavoriteCurrencyTop5() {
        return exchangeRateMapper.selectFavoriteCurrencyTop5();
    }

} 