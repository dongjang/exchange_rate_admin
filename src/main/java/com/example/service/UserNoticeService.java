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
public class UserNoticeService {
    
    private final NoticeRepository noticeRepository;
    private final NoticeMapper noticeMapper;
    
    //user
    public List<NoticeResponse> getNoticeList(NoticeSearchRequest request) {
        return noticeMapper.getNoticeList(request);
    }
    
    //user
    public int getNoticeCount(NoticeSearchRequest request) {
        return noticeMapper.getNoticeCount(request);
    }
            
    //user
    @Transactional
    public void incrementViewCount(Long noticeId) {
        noticeRepository.incrementViewCount(noticeId);
    }
    
    //user
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
