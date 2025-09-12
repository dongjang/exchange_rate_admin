package com.example.controller.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.UserResponse;
import com.example.dto.UserSearchRequest;
import com.example.service.AdminUserService;


@RestController
@RequestMapping("/api/admin/users")
public class AdminUserManagementController {

    @Autowired
    private AdminUserService adminUserService;

    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchUsers(@RequestBody UserSearchRequest searchRequest) {
        int count = adminUserService.getUserCount(searchRequest);
        if(count > 0){
            List<UserResponse> result = adminUserService.searchUsers(searchRequest);
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
        UserResponse user = adminUserService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        adminUserService.updateUserStatus(id, status);
        Map<String, String> response = new HashMap<>();
        response.put("message", "사용자 상태가 성공적으로 업데이트되었습니다.");
        return ResponseEntity.ok(response);
    }
} 