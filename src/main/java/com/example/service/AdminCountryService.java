package com.example.service;

import com.example.domain.Country;
import com.example.dto.CountryRequest;
import com.example.dto.CountryResponse;
import com.example.dto.CountrySearchRequest;
import com.example.mapper.CountryMapper;
import com.example.repository.CountryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminCountryService {
    
    private final CountryMapper countryMapper;
    private final CountryRepository countryRepository;
    
    public List<CountryResponse> searchCountries(CountrySearchRequest searchRequest) {
        List<Country> countries = countryMapper.getCountryList(searchRequest);
        return countries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public int getCountryCount(CountrySearchRequest searchRequest) {
        return countryMapper.getCountryCount(searchRequest);
    }
    
    public CountryResponse getCountryByCode(String code) {
        Country country = countryMapper.getCountryByCode(code);
        return country != null ? convertToResponse(country) : null;
    }
    
    public List<CountryResponse> getAllCountries() {
        List<Country> countries = countryRepository.findAll();
        return countries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void createCountry(CountryRequest request) {
        Country country = Country.builder()
                .code(request.getCode())
                .codeName(request.getCodeName())
                .countryName(request.getCountryName())
                .build();
        
        countryMapper.insertCountry(country);
    }
    
    @Transactional
    public void updateCountry(String code, CountryRequest request) {
        Country country = Country.builder()
                .code(code)
                .codeName(request.getCodeName())
                .countryName(request.getCountryName())
                .build();
        
        countryMapper.updateCountry(country);
    }
    
    @Transactional
    public void deleteCountry(String code) {
        countryMapper.deleteCountry(code);
    }
    
    private CountryResponse convertToResponse(Country country) {
        return CountryResponse.builder()
                .code(country.getCode())
                .codeName(country.getCodeName())
                .countryName(country.getCountryName())
                .build();
    }

    public List<CountryResponse> getRemittanceCountries() {
        return countryRepository.findRemittanceCountries();
    }
}
