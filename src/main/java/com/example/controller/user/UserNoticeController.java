package com.example.controller.user;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.NoticeResponse;
import com.example.dto.NoticeSearchRequest;
import com.example.service.NoticeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/notices")
@RequiredArgsConstructor
public class UserNoticeController {
    
    private final NoticeService noticeService;
        
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchNoticesForUser(@RequestBody NoticeSearchRequest searchRequest) {
        // 사용자용 검색에서는 기본적으로 ACTIVE 상태만 조회
        if (searchRequest.getStatus() == null || searchRequest.getStatus().isEmpty()) {
            searchRequest.setStatus("ACTIVE");
        }
        // 사용자용 검색 플래그 설정
        searchRequest.setIsUserSearch(true);
        
        int count = noticeService.getNoticeCount(searchRequest);
        if(count > 0){
            List<NoticeResponse> result = noticeService.getNoticeList(searchRequest);
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
    public ResponseEntity<NoticeResponse> getNoticeById(@PathVariable Long id) {
        NoticeResponse notice = noticeService.getNoticeById(id);
        if (notice == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notice);
    }
    
    @PostMapping("/{id}/increment-view")
    public ResponseEntity<String> incrementViewCount(@PathVariable Long id) {
        noticeService.incrementViewCount(id);
        return ResponseEntity.ok("조회수가 증가되었습니다.");
    }
}
