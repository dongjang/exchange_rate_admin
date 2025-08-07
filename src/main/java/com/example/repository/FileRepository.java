package com.example.repository;

import com.example.domain.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<File, Long> {
    
    /**
     * 사용자 ID로 업로드된 파일 목록 조회
     */
    List<File> findByUploadUserId(Long uploadUserId);
    
    /**
     * 사용자 ID로 업로드된 파일 삭제
     */
    void deleteByUploadUserId(Long uploadUserId);
} 