package com.example.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis 설정 클래스
 * - 캐시 활성화
 * - RedisTemplate 설정
 * - 직렬화 방식 설정
 */
@Configuration
@EnableCaching  // @Cacheable, @CacheEvict 등 캐시 어노테이션 활성화
public class RedisConfig {

    /**
     * RedisTemplate 설정
     * - Redis와의 데이터 교환을 위한 템플릿
     * - Key와 Value의 직렬화 방식 설정
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        
        // Redis 연결 팩토리 설정
        template.setConnectionFactory(connectionFactory);
        
        // Key 직렬화 방식: String
        template.setKeySerializer(new StringRedisSerializer());
        
        // Value 직렬화 방식: JSON (객체를 JSON으로 변환)
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        // Hash Key 직렬화 방식: String
        template.setHashKeySerializer(new StringRedisSerializer());
        
        // Hash Value 직렬화 방식: JSON
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        // 설정 적용
        template.afterPropertiesSet();
        
        return template;
    }
}
