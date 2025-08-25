package com.example.service;

import com.example.domain.Admin;
import com.example.dto.AdminRequest;
import com.example.dto.AdminResponse;
import com.example.dto.AdminSearchRequest;
import com.example.mapper.AdminMapper;
import com.example.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private AdminMapper adminMapper;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<AdminResponse> searchAdmins(AdminSearchRequest searchRequest) {
        return adminMapper.searchAdmins(searchRequest);
    }

    public int getAdminCount(AdminSearchRequest searchRequest) {
        return adminMapper.getAdminCount(searchRequest);
    }

    public AdminResponse getAdminById(Long id) {
        return adminMapper.getAdminById(id);
    }

    @Transactional
    public void createAdmin(AdminRequest adminRequest, Long currentAdminId) {
        AdminResponse adminResponse = new AdminResponse();
        adminResponse.setAdminId(adminRequest.getAdminId());
        adminResponse.setPassword(passwordEncoder.encode(adminRequest.getPassword()));
        adminResponse.setName(adminRequest.getName());
        adminResponse.setEmail(adminRequest.getEmail());
        adminResponse.setRole(adminRequest.getRole());
        adminResponse.setStatus(adminRequest.getStatus());
        adminResponse.setUpdatedAdminId(currentAdminId);
        
        adminMapper.insertAdmin(adminResponse);
    }

    @Transactional
    public void updateAdmin(Long id, AdminRequest adminRequest, Long currentAdminId) {
        AdminResponse adminResponse = new AdminResponse();
        adminResponse.setId(id);
        adminResponse.setName(adminRequest.getName());
        adminResponse.setEmail(adminRequest.getEmail());
        adminResponse.setRole(adminRequest.getRole());
        adminResponse.setStatus(adminRequest.getStatus());
        adminResponse.setUpdatedAdminId(currentAdminId);
        
        adminMapper.updateAdmin(adminResponse);
    }

    @Transactional
    public void updateAdminStatus(Long id, String status) {
        adminMapper.updateAdminStatus(id, status);
    }

    @Transactional
    public void deleteAdmin(Long id) {
        adminMapper.deleteAdmin(id);
    }

    public Admin findByAdminId(String adminId) {
        return adminRepository.findByAdminId(adminId);
    }

    public Admin findByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public boolean isAdminIdDuplicate(String adminId) {
        Admin existingAdmin = adminRepository.findByAdminId(adminId);
        return existingAdmin != null;
    }

    public AdminResponse authenticateAdmin(String adminId, String password) {
        Admin admin = adminRepository.findByAdminId(adminId);
        if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
            // 로그인 성공 시 마지막 로그인 시간 업데이트
            admin.setLastLoginAt(LocalDateTime.now());
            adminRepository.save(admin);
            
            // AdminResponse로 변환하여 반환
            AdminResponse response = new AdminResponse();
            response.setId(admin.getId());
            response.setAdminId(admin.getAdminId());
            response.setName(admin.getName());
            response.setEmail(admin.getEmail());
            response.setRole(admin.getRole().toString());
            response.setStatus(admin.getStatus().toString());
            response.setLastLoginAt(admin.getLastLoginAt());
            response.setCreatedAt(admin.getCreatedAt());
            response.setUpdatedAt(admin.getUpdatedAt());
            return response;
        }
        return null;
    }
}
