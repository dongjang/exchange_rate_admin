package com.example.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteCurrencyTop5 {
    private String favoriteContents; // CONCAT 결과
    private Long cnt; // COUNT 결과
} 