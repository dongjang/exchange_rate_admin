package com.example.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BankResponse {
    private Long id;
    private String name;
    private String bankCode;
    private String currencyCode;
    private String countryName;
    private String codeName;
}
