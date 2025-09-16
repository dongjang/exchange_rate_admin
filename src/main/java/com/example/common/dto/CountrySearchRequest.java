package com.example.common.dto;

import lombok.Data;

@Data
public class CountrySearchRequest {
    private String select = "all"; // "all" 또는 "remittance"
    private String countryName;
    private String codeName;
    private String code;
    private String sortOrder;
    private int page;
    private int size;
}
