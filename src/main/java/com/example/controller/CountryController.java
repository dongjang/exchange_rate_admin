package com.example.controller;

import com.example.domain.Country;
import com.example.dto.CountryResponse;
import com.example.repository.CountryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/countries")
@RequiredArgsConstructor
public class CountryController {
    private final CountryRepository countryRepository;

    @GetMapping
    public List<CountryResponse> getAllCountries() {
        List<Country> countries = countryRepository.findAll();
        return countries.stream()
                .map(c -> CountryResponse.builder()
                        .code(c.getCode())
                        .codeName(c.getCodeName())
                        .countryName(c.getCountryName())
                        .build())
                .collect(Collectors.toList());
    }

    @GetMapping("/remittance")
    public List<CountryResponse> getRemittanceCountries() {
        return countryRepository.findRemittanceCountries();
    }
} 