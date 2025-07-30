package com.example.repository;

import com.example.domain.Country;
import com.example.dto.CountryResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CountryRepository extends JpaRepository<Country, String> {

    @Query("SELECT new com.example.dto.CountryResponse(a.code, a.codeName, a.countryName) " +
           "FROM Country a JOIN Bank b ON a.code = b.currencyCode " +
           "WHERE a.code != 'KRW' " +
           "GROUP BY a.code, a.codeName, a.countryName")
    List<CountryResponse> findRemittanceCountries();
} 