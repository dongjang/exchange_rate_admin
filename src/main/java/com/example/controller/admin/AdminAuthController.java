package com.example.controller.admin;

import com.example.dto.AdminResponse;
import com.example.service.AdminService;
import com.example.service.RedisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    @Autowired
    private AdminService adminService;
    
    @Autowired
    private RedisService redisService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest, HttpServletRequest request, HttpSession session) {
        String adminId = loginRequest.get("adminId");
        String password = loginRequest.get("password");
        
        try {
            AdminResponse admin = adminService.authenticateAdmin(adminId, password);
            System.out.println("admin: " + admin);
            if (admin != null) {
                // 관리자 전용 세션 ID 생성 (사용자와 분리)
                String adminSessionId = "admin_" + session.getId() + "_" + System.currentTimeMillis();
                
                // HttpSession에 관리자 세션 ID 저장
                session.setAttribute("adminSessionId", adminSessionId);
                
                Map<String, Object> sessionData = new HashMap<>();
                sessionData.put("adminId", admin.getId());
                sessionData.put("adminEmail", admin.getEmail());
                sessionData.put("adminName", admin.getName());
                sessionData.put("adminRole", admin.getRole());
                sessionData.put("adminStatus", admin.getStatus());
                
                redisService.setAdminSession(adminSessionId, sessionData);
                
                // Spring Security 인증 컨텍스트 설정
                List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + admin.getRole())
                );
                
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                    admin.getEmail(), // principal
                    null, // credentials
                    authorities
                );
                
                // SecurityContext를 세션에 저장
                org.springframework.security.core.context.SecurityContext securityContext = 
                    SecurityContextHolder.getContext();
                securityContext.setAuthentication(authentication);
                session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);
                
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
        String adminSessionId = (String) session.getAttribute("adminSessionId");
        
        if (adminSessionId != null) {
            try {
                Object sessionData = redisService.getAdminSession(adminSessionId);
                if (sessionData != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) sessionData;
                    Long adminId = ((Number) data.get("adminId")).longValue();
                    AdminResponse admin = adminService.getAdminById(adminId);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("admin", admin);
                    return ResponseEntity.ok(response);
                }
            } catch (Exception e) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "관리자 정보 조회 실패");
                return ResponseEntity.ok(response);
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "로그인되지 않은 관리자");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request, HttpSession session) {
        // HttpSession에서 관리자 세션 ID 가져오기
        String adminSessionId = (String) session.getAttribute("adminSessionId");
        if (adminSessionId != null) {
            // Redis에서 관리자 세션만 삭제
            redisService.deleteAdminSession(adminSessionId);
            // HttpSession에서 관리자 세션 ID만 제거
            session.removeAttribute("adminSessionId");
        }
        
        // Spring Security 인증 컨텍스트 클리어
        SecurityContextHolder.clearContext();
        
        // 사용자 세션이 있는지 확인
        String userSessionId = (String) session.getAttribute("userSessionId");
        if (userSessionId == null) {
            // 사용자 세션이 없을 때만 SPRING_SECURITY_CONTEXT 제거
            session.removeAttribute("SPRING_SECURITY_CONTEXT");
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "로그아웃 성공");
        return ResponseEntity.ok(response);
    }
}
