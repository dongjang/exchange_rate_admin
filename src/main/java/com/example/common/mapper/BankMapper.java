package com.example.common.mapper;

import com.example.common.domain.Bank;
import com.example.common.dto.BankResponse;
import com.example.common.dto.BankSearchRequest;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface BankMapper {
    List<BankResponse> getBankList(BankSearchRequest searchRequest);
    int getBankCount(BankSearchRequest searchRequest);
    Bank getBankById(@Param("id") Long id);
    int insertBank(Bank bank);
    int updateBank(Bank bank);
    int deleteBank(@Param("id") Long id);
    boolean existsByBankCode(@Param("bankCode") String bankCode);
}
