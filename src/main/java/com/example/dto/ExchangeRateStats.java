package com.example.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExchangeRateStats {
    private Long totalCountries;
    private Long availableCountries;
    private Long totalFavorites;
} 