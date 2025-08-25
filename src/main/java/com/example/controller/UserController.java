package com.example.controller;

import com.example.domain.User;
import com.example.dto.UserResponse;
import com.example.dto.UserSearchRequest;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/admin/search")
    public ResponseEntity<Map<String, Object>> searchUsers(@RequestBody UserSearchRequest searchRequest) {
        int count = userService.getUserCount(searchRequest);
        if(count > 0){
            List<UserResponse> result = userService.searchUsers(searchRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("totalElements", count);
            response.put("content", result);
            response.put("totalPages", (int) Math.ceil((double) count / searchRequest.getSize()));
            return ResponseEntity.ok(response);
        }else{
            Map<String, Object> response = new HashMap<>();
            response.put("totalElements", 0);
            response.put("content", new java.util.ArrayList<>());
            response.put("totalPages", 0);
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        userService.updateUser(id, request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "사용자 상태가 성공적으로 업데이트되었습니다.");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        userService.updateUserStatus(id, status);
        Map<String, String> response = new HashMap<>();
        response.put("message", "사용자 상태가 성공적으로 업데이트되었습니다.");
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        // 모든 사용자 조회 (관리자용)
        List<UserResponse> users = userService.searchUsers(new UserSearchRequest());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/loginUserInfo")
    public ResponseEntity<UserResponse> getCurrentUserInfo(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User != null) {
            String email = oauth2User.getAttribute("email");
            User user = userService.findByEmail(email);
            if (user != null) {
                UserResponse userResponse = new UserResponse();
                userResponse.setId(user.getId());
                userResponse.setName(user.getName());
                userResponse.setEmail(user.getEmail());
                userResponse.setPictureUrl(user.getPictureUrl());
                userResponse.setStatus(user.getStatus());
                //userResponse.setCreatedAt(user.getCreatedAt());
                //userResponse.setLastLoginAt(user.getLastLoginAt());
                return ResponseEntity.ok(userResponse);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        // 현재 로그인한 사용자 정보 반환
        // 이 메서드는 인증 필터에서 처리되어야 함
        return ResponseEntity.ok().build();
    }
} 