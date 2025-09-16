package com.example.admin.service;

import com.example.admin.domain.Admin;
import com.example.admin.dto.AdminRequest;
import com.example.admin.dto.AdminResponse;
import com.example.admin.dto.AdminSearchRequest;
import com.example.admin.mapper.AdminMapper;
import com.example.admin.repository.AdminRepository;
import com.example.context.SessionContext;

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
    public void createAdmin(AdminRequest adminRequest) {

        AdminResponse adminResponse = new AdminResponse();
        
        adminResponse.setAdminId(adminRequest.getAdminId());
        adminResponse.setPassword(passwordEncoder.encode(adminRequest.getPassword()));
        adminResponse.setName(adminRequest.getName());
        adminResponse.setEmail(adminRequest.getEmail());
        adminResponse.setRole(adminRequest.getRole());
        adminResponse.setStatus(adminRequest.getStatus());
        
        adminMapper.insertAdmin(adminResponse);
    }

    @Transactional
    public void updateAdmin(Long id, AdminRequest adminRequest) {
        AdminResponse adminResponse = new AdminResponse();
        Long currentAdminId = SessionContext.getCurrentAdminId();
        
        adminResponse.setId(id);
        adminResponse.setName(adminRequest.getName());
        adminResponse.setEmail(adminRequest.getEmail());
        adminResponse.setRole(adminRequest.getRole());
        adminResponse.setStatus(adminRequest.getStatus());
        adminResponse.setUpdatedAdminId(currentAdminId);
        
        // 비밀번호가 입력된 경우에만 암호화하여 설정
        if (adminRequest.getPassword() != null && !adminRequest.getPassword().trim().isEmpty()) {
            adminResponse.setPassword(passwordEncoder.encode(adminRequest.getPassword()));
        }
        
        adminMapper.updateAdmin(adminResponse);
    }

    @Transactional
    public void updateAdminStatus(Long id, String status) {
        adminMapper.updateAdminStatus(id, status);
    }

    public Admin findByAdminId(String adminId) {
        return adminRepository.findByAdminId(adminId);
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
