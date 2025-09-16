package com.example.common.dto;

import lombok.Data;

@Data
public class CountryRequest {
    private String code;
    private String codeName;
    private String countryName;
}
