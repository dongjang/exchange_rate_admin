package com.example.mapper;

import com.example.domain.Country;
import com.example.dto.CountrySearchRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CountryMapper {
    List<Country> getCountryList(CountrySearchRequest searchRequest);
    int getCountryCount(CountrySearchRequest searchRequest);
    Country getCountryByCode(@Param("code") String code);
    int insertCountry(Country country);
    int updateCountry(Country country);
    int deleteCountry(@Param("code") String code);
}
