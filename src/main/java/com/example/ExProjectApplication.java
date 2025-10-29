package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class ExProjectApplication {
    
    @PostConstruct
    public void init() {
        // 애플리케이션 전체 타임존을 서울로 설정
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
    }
    
    public static void main(String[] args) {
        SpringApplication.run(ExProjectApplication.class, args);
    }
} 