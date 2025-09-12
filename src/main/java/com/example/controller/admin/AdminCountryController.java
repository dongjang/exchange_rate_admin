package com.example.controller.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.CountryRequest;
import com.example.dto.CountryResponse;
import com.example.dto.CountrySearchRequest;
import com.example.service.AdminCountryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/countries")
@RequiredArgsConstructor
public class AdminCountryController {
    
    private final AdminCountryService AdmincountryService;
    
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchCountries(@RequestBody CountrySearchRequest searchRequest) {
        int count = AdmincountryService.getCountryCount(searchRequest);
        if(count > 0){
            List<CountryResponse> result = AdmincountryService.searchCountries(searchRequest);
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
        CountryResponse country = AdmincountryService.getCountryByCode(code);
        if (country == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(country);
    }
    
    @PostMapping
    public ResponseEntity<Void> createCountry(@RequestBody CountryRequest request) {
        AdmincountryService.createCountry(request);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{code}")
    public ResponseEntity<Void> updateCountry(@PathVariable String code, @RequestBody CountryRequest request) {
        AdmincountryService.updateCountry(code, request);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{code}")
    public ResponseEntity<Void> deleteCountry(@PathVariable String code) {
        AdmincountryService.deleteCountry(code);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<CountryResponse>> getAllCountries() {
        List<CountryResponse> countries = AdmincountryService.getAllCountries();
        return ResponseEntity.ok(countries);
    }
    
    @GetMapping("/remittance")
    public ResponseEntity<List<CountryResponse>> getRemittanceCountries() {
        List<CountryResponse> countries = AdmincountryService.getRemittanceCountries();
        return ResponseEntity.ok(countries);
    }
} 