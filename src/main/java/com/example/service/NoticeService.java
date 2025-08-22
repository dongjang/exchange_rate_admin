package com.example.service;

import com.example.domain.Notice;
import com.example.dto.NoticeRequest;
import com.example.dto.NoticeResponse;
import com.example.dto.NoticeSearchRequest;
import com.example.mapper.NoticeMapper;
import com.example.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoticeService {
    
    private final NoticeRepository noticeRepository;
    private final NoticeMapper noticeMapper;
    
    public List<NoticeResponse> getNoticeList(NoticeSearchRequest request) {
        return noticeMapper.getNoticeList(request);
    }
    
    public int getNoticeCount(NoticeSearchRequest request) {
        return noticeMapper.getNoticeCount(request);
    }
    
    // 공지사항 조회수 TOP5 조회 (MyBatis 사용)
    @Transactional(readOnly = true)
    public List<NoticeResponse> getTop5Notices() {
        return noticeMapper.getTop5Notices();
    }
    
    @Transactional
    public Notice createNotice(NoticeRequest request, Long userId) {
        // 중요도가 높음이면 기존 높음 공지사항들을 보통으로 변경
        if ("HIGH".equals(request.getPriority())) {
            noticeRepository.updateHighPriorityToNormal();
        }
        
        Notice notice = new Notice();
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setPriority(request.getPriority());
        notice.setNoticeStartAt(request.getNoticeStartAt());
        notice.setNoticeEndAt(request.getNoticeEndAt());
        notice.setStatus("ACTIVE");
        notice.setViewCount(0);
        notice.setCreatedUserId(userId);
        
        return noticeRepository.save(notice);
    }
    
    @Transactional
    public Notice updateNotice(Long id, NoticeRequest request) {
        // 중요도가 높음이면 기존 높음 공지사항들을 보통으로 변경
        if ("HIGH".equals(request.getPriority())) {
            noticeRepository.updateHighPriorityToNormal();
        }
        
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
        
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setPriority(request.getPriority());
        notice.setNoticeStartAt(request.getNoticeStartAt());
        notice.setNoticeEndAt(request.getNoticeEndAt());
        notice.setStatus(request.getStatus());
        
        return noticeRepository.save(notice);
    }
    
    @Transactional
    public void deleteNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
        
        noticeRepository.delete(notice);
    }
    
    @Transactional
    public void incrementViewCount(Long noticeId) {
        noticeRepository.incrementViewCount(noticeId);
    }

    private NoticeResponse convertToResponse(Notice notice) {
        NoticeResponse response = new NoticeResponse();
        response.setId(notice.getId());
        response.setTitle(notice.getTitle());
        response.setContent(notice.getContent());
        response.setPriority(notice.getPriority());
        response.setStatus(notice.getStatus());
        response.setViewCount(notice.getViewCount());
        response.setCreatedAt(notice.getCreatedAt());
        response.setUpdatedAt(notice.getUpdatedAt());
        response.setNoticeStartAt(notice.getNoticeStartAt());
        response.setNoticeEndAt(notice.getNoticeEndAt());
        response.setCreatedUserId(notice.getCreatedUserId());
        return response;
    }
}
