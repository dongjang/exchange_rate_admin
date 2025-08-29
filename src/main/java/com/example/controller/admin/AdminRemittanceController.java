package com.example.controller.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.RemittanceHistoryResponse;
import com.example.dto.RemittanceHistorySearchRequest;
import com.example.dto.RemittanceLimitRequestResponse;
import com.example.service.RemittanceLimitRequestService;
import com.example.service.RemittanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/remittances")
@RequiredArgsConstructor
public class AdminRemittanceController {
    private final RemittanceService remittanceService;
    private final RemittanceLimitRequestService remittanceLimitRequestService;

    @GetMapping("/limit-requests")
    public ResponseEntity<List<RemittanceLimitRequestResponse>> getLimitRequests() {
        List<RemittanceLimitRequestResponse> requests = remittanceService.getLimitRequests();
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchAdminRemittanceHistory(@RequestBody RemittanceHistorySearchRequest searchRequest) {
        int count = remittanceService.getAdminRemittanceHistoryCount(searchRequest);
        if(count > 0){
            List<RemittanceHistoryResponse> result = remittanceService.getAdminRemittanceHistory(searchRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("list", result);
            return ResponseEntity.ok(response);
        }else{
            return ResponseEntity.ok(null);
        }
    }
    

} 