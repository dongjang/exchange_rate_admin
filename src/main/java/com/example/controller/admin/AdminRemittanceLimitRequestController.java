package com.example.controller.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.RemittanceLimitRequestResponse;
import com.example.service.RemittanceLimitRequestService;

@RestController
@RequestMapping("/api/admin/remittance-limit-requests")
public class AdminRemittanceLimitRequestController {
    
    private final RemittanceLimitRequestService remittanceLimitRequestService;
    
    public AdminRemittanceLimitRequestController(RemittanceLimitRequestService remittanceLimitRequestService) {
        this.remittanceLimitRequestService = remittanceLimitRequestService;
    }
        
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> getAdminRequests(@RequestBody Map<String, Object> searchRequest) {
        int count = remittanceLimitRequestService.countAdminRequests(searchRequest);
        if(count > 0){
            List<RemittanceLimitRequestResponse> requests = remittanceLimitRequestService.getAdminRequests(searchRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("list", requests);
            return ResponseEntity.ok(response);
        }else{
            return ResponseEntity.ok(null);
        }
    }
    
    @GetMapping("/{requestId}")
    public ResponseEntity<RemittanceLimitRequestResponse> getAdminRequest(@PathVariable Long requestId) {
        RemittanceLimitRequestResponse request = remittanceLimitRequestService.getAdminRequestById(requestId);
        if (request == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(request);
    }
    
    @PutMapping("/{requestId}/process")
    public ResponseEntity<Void> processRequest(@PathVariable Long requestId, @RequestBody Map<String, Object> request) {
        System.out.println("request: " + request);
        try {
            //RemittanceLimitRequest.RequestStatus requestStatus = RemittanceLimitRequest.RequestStatus.valueOf(status.toUpperCase());
            remittanceLimitRequestService.processRequest(requestId, request);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 