package com.example.controller.user;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.domain.User;
import com.example.dto.UserResponse;
import com.example.service.UserService;

@RestController
@RequestMapping("/api/users/users")
public class UserController {

    @Autowired
    private UserService userService;

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

} 