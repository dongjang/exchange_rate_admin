package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync  // 비동기 처리를 활성화하는 어노테이션
public class AsyncConfig {

    @Bean(name = "remittanceTaskExecutor")
    public Executor remittanceTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 코어 스레드 수: 항상 실행 대기 중인 스레드 수
        executor.setCorePoolSize(5);
        
        // 최대 스레드 수: 동시에 실행할 수 있는 최대 스레드 수
        executor.setMaxPoolSize(10);
        
        // 큐 용량: 코어 스레드가 모두 사용 중일 때 대기할 작업 수
        executor.setQueueCapacity(100);
        
        // 스레드 이름 접두사: 로그에서 어떤 스레드인지 구분하기 위함
        executor.setThreadNamePrefix("Remittance-");
        
        // 스레드 풀 초기화
        executor.initialize();
        
        return executor;
    }
}
