package com.example.repository;

import com.example.domain.Qna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QnaRepository extends JpaRepository<Qna, Long> {
    int countByStatus(Qna.QnaStatus status);
}
