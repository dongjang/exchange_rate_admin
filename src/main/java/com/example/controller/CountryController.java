package com.example.controller;

import com.example.dto.CountryRequest;
import com.example.dto.CountryResponse;
import com.example.dto.CountrySearchRequest;
import com.example.service.CountryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/countries")
@RequiredArgsConstructor
public class CountryController {
    
    private final CountryService countryService;
    
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchCountries(@RequestBody CountrySearchRequest searchRequest) {
        int count = countryService.getCountryCount(searchRequest);
        if(count > 0){
            List<CountryResponse> result = countryService.searchCountries(searchRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("totalElements", count);
            response.put("content", result);
            response.put("totalPages", (int) Math.ceil((double) count / searchRequest.getSize()));
            return ResponseEntity.ok(response);
        }else{
            Map<String, Object> response = new HashMap<>();
            response.put("totalElements", 0);
            response.put("content", new java.util.ArrayList<>());
            response.put("totalPages", 0);
            return ResponseEntity.ok(response);
        }
    }
    
    @GetMapping("/{code}")
    public ResponseEntity<CountryResponse> getCountryByCode(@PathVariable String code) {
        CountryResponse country = countryService.getCountryByCode(code);
        if (country == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(country);
    }
    
    @PostMapping
    public ResponseEntity<Void> createCountry(@RequestBody CountryRequest request) {
        countryService.createCountry(request);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{code}")
    public ResponseEntity<Void> updateCountry(@PathVariable String code, @RequestBody CountryRequest request) {
        countryService.updateCountry(code, request);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{code}")
    public ResponseEntity<Void> deleteCountry(@PathVariable String code) {
        countryService.deleteCountry(code);
        return ResponseEntity.ok().build();
    }
    
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