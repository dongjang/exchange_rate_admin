package com.example.controller.admin;

import com.example.dto.AdminRequest;
import com.example.dto.AdminResponse;
import com.example.dto.AdminSearchRequest;
import com.example.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminManagementController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchAdmins(@RequestBody AdminSearchRequest searchRequest) {
        int count = adminService.getAdminCount(searchRequest);
        if(count > 0){
            List<AdminResponse> result = adminService.searchAdmins(searchRequest);
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
    public ResponseEntity<AdminResponse> getAdminById(@PathVariable Long id) {
        AdminResponse admin = adminService.getAdminById(id);
        return ResponseEntity.ok(admin);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createAdmin(@RequestBody AdminRequest adminRequest) {

        adminService.createAdmin(adminRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "관리자가 성공적으로 등록되었습니다.");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateAdmin(@PathVariable Long id, @RequestBody AdminRequest adminRequest) {

        adminService.updateAdmin(id, adminRequest);
        Map<String, String> response = new HashMap<>();
        response.put("message", "관리자 정보가 성공적으로 수정되었습니다.");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateAdminStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        adminService.updateAdminStatus(id, status);
        Map<String, String> response = new HashMap<>();
        response.put("message", "관리자 상태가 성공적으로 업데이트되었습니다.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-admin-id/{adminId}")
    public ResponseEntity<Map<String, Object>> checkAdminIdDuplicate(@PathVariable String adminId) {
        boolean isDuplicate = adminService.isAdminIdDuplicate(adminId);
        Map<String, Object> response = new HashMap<>();
        response.put("duplicate", isDuplicate);
        response.put("message", isDuplicate ? "이미 사용 중인 아이디입니다." : "사용 가능한 아이디입니다.");
        return ResponseEntity.ok(response);
    }
}
