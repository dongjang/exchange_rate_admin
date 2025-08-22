package com.example.dto;

import lombok.Data;

@Data
public class BankSearchRequest {
    private String countryName;
    private String bankName;
    private String sortOrder;
    private int page;
    private int size;
}
