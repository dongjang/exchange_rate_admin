package com.example.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.context.SessionContext;
import com.example.domain.Notice;
import com.example.dto.NoticeRequest;
import com.example.dto.NoticeResponse;
import com.example.dto.NoticeSearchRequest;
import com.example.mapper.NoticeMapper;
import com.example.repository.NoticeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminNoticeService {
    
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
    public Notice createNotice(NoticeRequest request) {
        // 중요도가 높음이면 기존 높음 공지사항들을 보통으로 변경
        if ("HIGH".equals(request.getPriority())) {
            noticeRepository.updateHighPriorityToNormal();
        }
        
        Long adminId = SessionContext.getCurrentAdminId();

        Notice notice = new Notice();
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setPriority(request.getPriority());
        // 시작일은 00:00:00, 종료일은 23:59:59로 설정
        if (request.getNoticeStartAt() != null && !request.getNoticeStartAt().isEmpty()) {
            notice.setNoticeStartAt(java.time.LocalDate.parse(request.getNoticeStartAt()).atStartOfDay());
        }
        if (request.getNoticeEndAt() != null && !request.getNoticeEndAt().isEmpty()) {
            notice.setNoticeEndAt(java.time.LocalDate.parse(request.getNoticeEndAt()).atTime(23, 59, 59));
        }
        notice.setStatus("ACTIVE");
        notice.setViewCount(0);
        notice.setCreatedUserId(adminId);
        
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
        
        Long adminId = SessionContext.getCurrentAdminId();
        
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setPriority(request.getPriority());
        // 시작일은 00:00:00, 종료일은 23:59:59로 설정
        if (request.getNoticeStartAt() != null && !request.getNoticeStartAt().isEmpty()) {
            notice.setNoticeStartAt(java.time.LocalDate.parse(request.getNoticeStartAt()).atStartOfDay());
        }
        if (request.getNoticeEndAt() != null && !request.getNoticeEndAt().isEmpty()) {
            notice.setNoticeEndAt(java.time.LocalDate.parse(request.getNoticeEndAt()).atTime(23, 59, 59));
        }
        notice.setStatus(request.getStatus());
        notice.setUpdatedUserId(adminId);
        return noticeRepository.save(notice);
    }
    
    @Transactional
    public void deleteNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
        
        noticeRepository.delete(notice);
    }
        
    @Transactional(readOnly = true)
    public NoticeResponse getNoticeById(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElse(null);
        
        if (notice == null) {
            return null;
        }
        
        return convertToResponse(notice);
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
