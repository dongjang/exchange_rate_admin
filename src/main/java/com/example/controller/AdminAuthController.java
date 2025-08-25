package com.example.controller;

import com.example.dto.AdminResponse;
import com.example.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest, HttpSession session) {
        String adminId = loginRequest.get("adminId");
        String password = loginRequest.get("password");
        
        try {
            AdminResponse admin = adminService.authenticateAdmin(adminId, password);
            if (admin != null) {
                // 세션에 관리자 정보 저장
                session.setAttribute("adminId", admin.getId());
                session.setAttribute("adminInfo", admin);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("admin", admin);
                response.put("message", "로그인 성공");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "아이디 또는 비밀번호가 올바르지 않습니다.");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "로그인 중 오류가 발생했습니다.");
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentAdmin(HttpSession session) {
        Long adminId = (Long) session.getAttribute("adminId");
        
        if (adminId != null) {
            try {
                AdminResponse admin = adminService.getAdminById(adminId);
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("admin", admin);
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "관리자 정보 조회 실패");
                return ResponseEntity.ok(response);
            }
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "로그인되지 않은 관리자");
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "로그아웃 성공");
        return ResponseEntity.ok(response);
    }
}
