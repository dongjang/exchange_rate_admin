package com.example.mapper;

import com.example.dto.AdminResponse;
import com.example.dto.AdminSearchRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface AdminMapper {
    List<AdminResponse> searchAdmins(AdminSearchRequest searchRequest);
    int getAdminCount(AdminSearchRequest searchRequest);
    AdminResponse getAdminById(Long id);
    void insertAdmin(AdminResponse admin);
    void updateAdmin(AdminResponse admin);
    void deleteAdmin(Long id);
    void updateAdminStatus(@Param("id") Long id, @Param("status") String status);
}
