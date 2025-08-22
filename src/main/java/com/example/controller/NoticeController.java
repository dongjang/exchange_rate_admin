package com.example.controller;

import com.example.domain.User;
import com.example.dto.NoticeRequest;
import com.example.dto.NoticeResponse;
import com.example.dto.NoticeSearchRequest;
import com.example.service.NoticeService;
import com.example.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {
    
    private final NoticeService noticeService;
    private final UserService userService;
    
    @PostMapping("/admin/search")
    public ResponseEntity<Map<String, Object>> searchNotices(@RequestBody NoticeSearchRequest searchRequest) {
        int count = noticeService.getNoticeCount(searchRequest);
        if(count > 0){
            List<NoticeResponse> result = noticeService.getNoticeList(searchRequest);
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("list", result);
            return ResponseEntity.ok(response);
        }else{
            return ResponseEntity.ok(null);
        }
    }
    
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
    
    @PostMapping("/admin")
    public ResponseEntity<?> createNotice(@RequestBody NoticeRequest request, @AuthenticationPrincipal OAuth2User oauth2User) {
        System.out.println("oauth2User : " + oauth2User);
        if (oauth2User == null) {
            return ResponseEntity.status(401).body("인증되지 않은 사용자입니다.");
        }
        
        String email = oauth2User.getAttribute("email");
        if (email == null) {
            return ResponseEntity.status(400).body("사용자 이메일을 찾을 수 없습니다.");
        }
        
        // 이메일로 사용자 찾기
        User user = userService.findByEmail(email);
        System.out.println("user : " + user);
        if (user == null) {
            return ResponseEntity.status(404).body("사용자를 찾을 수 없습니다.");
        }
        
        Long userId = user.getId();
        noticeService.createNotice(request, userId);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/admin/{id}")
    public ResponseEntity<?> updateNotice(@PathVariable Long id, @RequestBody NoticeRequest request) {
        noticeService.updateNotice(id, request);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/increment-view")
    public ResponseEntity<String> incrementViewCount(@PathVariable Long id) {
        noticeService.incrementViewCount(id);
        return ResponseEntity.ok("조회수가 증가되었습니다.");
    }

    // 공지사항 조회수 TOP5 조회
    @GetMapping("/top5")
    public ResponseEntity<List<NoticeResponse>> getTop5Notices() {
        List<NoticeResponse> top5Notices = noticeService.getTop5Notices();
        return ResponseEntity.ok(top5Notices);
    }
}
