package com.example.dto;

import com.example.domain.UserFavoriteCurrency;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FavoriteCurrencyResponse {
    private Long id;
    private String currencyCode;
    private LocalDateTime createdAt;

    public FavoriteCurrencyResponse(UserFavoriteCurrency entity) {
        this.id = entity.getId();
        this.currencyCode = entity.getCurrencyCode();
    }
} 