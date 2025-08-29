package com.example.controller.user;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.domain.User;
import com.example.dto.UserInfoResponse;
import com.example.service.RedisService;
import com.example.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/users/auth")
public class UserAuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private RedisService redisService;

    @GetMapping("/success")
    public ResponseEntity<Map<String, Object>> loginSuccess(@AuthenticationPrincipal OAuth2User oauth2User, HttpServletRequest request) {
        if (oauth2User != null) {
            // 사용자 정보 조회 및 lastLoginAt 업데이트
            User user = userService.saveOrUpdateUser(oauth2User.getAttributes());
            
            // 완전한 사용자 정보 생성
            UserInfoResponse userInfo = new UserInfoResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPictureUrl(),
                user.getStatus()
            );
            
            // Redis에 세션 저장
            HttpSession session = request.getSession(false); // 기존 세션이 있으면 가져오기
            if (session == null) {
                session = request.getSession(true); // 없으면 새로 생성
            }
            
            // 사용자 전용 세션 ID 생성 (관리자와 분리)
            String userSessionId = "user_" + session.getId() + "_" + System.currentTimeMillis();
            
            // HttpSession에 사용자 세션 ID 저장
            session.setAttribute("userSessionId", userSessionId);
            
            Map<String, Object> sessionData = new HashMap<>();
            sessionData.put("userId", user.getId());
            sessionData.put("userEmail", user.getEmail());
            sessionData.put("userName", user.getName());
            sessionData.put("userStatus", user.getStatus());
            
            // 사용자 세션으로 저장 (키에 user: 접두사 추가)
            redisService.setUserSession(userSessionId, sessionData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "로그인 성공");
            response.put("user", userInfo);
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "로그인 실패");
            response.put("user", null);
            
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/failure")
    public ResponseEntity<Map<String, Object>> loginFailure() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "로그인 실패");
        response.put("user", null);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request, HttpServletResponse response) {
        // HttpSession에서 사용자 세션 ID 가져오기
        HttpSession session = request.getSession(false);
        if (session != null) {
            String userSessionId = (String) session.getAttribute("userSessionId");
            System.out.println("userSessionId: " + userSessionId);
            
            if (userSessionId != null) {
                // Redis에서 사용자 세션만 삭제
                redisService.deleteUserSession(userSessionId);
                // HttpSession에서 사용자 세션 ID만 제거
                session.removeAttribute("userSessionId");
            }
            
            // OAuth2 관련 속성만 제거 (전체 세션 무효화하지 않음)
            session.removeAttribute("SPRING_SECURITY_CONTEXT");
            session.removeAttribute("oauth2_authorization_request");
            session.removeAttribute("oauth2_authorization_request_uri");
        }
        
        // 사용자 전용 SecurityContext만 정리 (관리자 영향 없음)
        try {
            SecurityContextHolder.clearContext();
        } catch (Exception e) {
            System.out.println("SecurityContext 정리 중 오류: " + e.getMessage());
        }
        
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("success", true);
        responseMap.put("message", "로그아웃 성공");
        
        return ResponseEntity.ok(responseMap);
    }

} 