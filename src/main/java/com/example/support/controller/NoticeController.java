package com.example.support.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.support.dto.NoticeRequest;
import com.example.support.dto.NoticeResponse;
import com.example.support.dto.NoticeSearchRequest;
import com.example.support.service.NoticeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class NoticeController {
    
    private final NoticeService adminNoticeService;
    
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchNotices(@RequestBody NoticeSearchRequest searchRequest) {
        int count = adminNoticeService.getNoticeCount(searchRequest);
        if(count > 0){
            List<NoticeResponse> result = adminNoticeService.getNoticeList(searchRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("list", result);
            return ResponseEntity.ok(response);
        }else{
            return ResponseEntity.ok(null);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<NoticeResponse> getNoticeById(@PathVariable("id") Long id) {
        NoticeResponse notice = adminNoticeService.getNoticeById(id);
        if (notice == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notice);
    }
    
    @PostMapping
    public ResponseEntity<?> createNotice(@RequestBody NoticeRequest request) {
        
        adminNoticeService.createNotice(request);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNotice(@PathVariable("id") Long id, @RequestBody NoticeRequest request) {
        adminNoticeService.updateNotice(id, request);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable("id") Long id) {
        adminNoticeService.deleteNotice(id);
        return ResponseEntity.ok().build();
    }

    // 공지사항 조회수 TOP5 조회
    @GetMapping("/top5")
    public ResponseEntity<List<NoticeResponse>> getTop5Notices() {
        List<NoticeResponse> top5Notices = adminNoticeService.getTop5Notices();
        return ResponseEntity.ok(top5Notices);
    }
}
