package com.example.controller.user;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.CountryResponse;
import com.example.service.CountryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/countries")
@RequiredArgsConstructor
public class UserCountryController {
    
    private final CountryService countryService;
    
    
    @GetMapping("/all")
    public ResponseEntity<List<CountryResponse>> getAllCountries() {
        List<CountryResponse> countries = countryService.getAllCountries();
        return ResponseEntity.ok(countries);
    }
    
    @GetMapping("/remittance")
    public ResponseEntity<List<CountryResponse>> getRemittanceCountries() {
        List<CountryResponse> countries = countryService.getRemittanceCountries();
        return ResponseEntity.ok(countries);
    }
} 