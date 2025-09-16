package com.example.common.mapper;

import com.example.common.domain.Country;
import com.example.common.dto.CountrySearchRequest;

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
