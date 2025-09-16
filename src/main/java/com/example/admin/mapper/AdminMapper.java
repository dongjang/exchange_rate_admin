package com.example.admin.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.admin.dto.AdminResponse;
import com.example.admin.dto.AdminSearchRequest;

import java.util.List;

@Mapper
public interface AdminMapper {
    List<AdminResponse> searchAdmins(AdminSearchRequest searchRequest);
    int getAdminCount(AdminSearchRequest searchRequest);
    AdminResponse getAdminById(@Param("id") Long id);
    void insertAdmin(AdminResponse admin);
    void updateAdmin(AdminResponse admin);
    void updateAdminStatus(@Param("id") Long id, @Param("status") String status);
}
