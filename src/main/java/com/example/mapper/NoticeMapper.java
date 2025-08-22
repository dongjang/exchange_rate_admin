package com.example.mapper;

import com.example.dto.NoticeResponse;
import com.example.dto.NoticeSearchRequest;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface NoticeMapper {
    List<NoticeResponse> getNoticeList(NoticeSearchRequest request);
    int getNoticeCount(NoticeSearchRequest request);
    List<NoticeResponse> getTop5Notices();
}
