package com.example.mapper;

import com.example.domain.Bank;
import com.example.dto.BankResponse;
import com.example.dto.BankSearchRequest;
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
