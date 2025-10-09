package com.example.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final Environment env;


    @Bean
    @Order(1)
    public SecurityFilterChain adminFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/admin/**", "/api/admin/login/**", "/api/admin/auth/**")
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/admin/login/**").permitAll()
                .requestMatchers("/api/admin/auth/**").permitAll()
                .requestMatchers("/api/admin/**").authenticated()
                .anyRequest().denyAll()
            );
        
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain fileFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/files/**")
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/files/*/download").authenticated()
                .requestMatchers("/api/files/*/base64").authenticated()
                .requestMatchers("/api/files/*/info").authenticated()
                .requestMatchers("/api/files/**").authenticated()
                .anyRequest().denyAll()
            );
        
        return http.build();
    }

    @Bean
    @Order(3)
    public SecurityFilterChain publicFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/public/**", "/health/**", "/actuator/**")
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // 헬스체크
                .requestMatchers("/health/**").permitAll()
                // 공개 API
                .requestMatchers("/api/public/**").permitAll()
                // Actuator 엔드포인트 허용 (모니터링용)
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/actuator/prometheus").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/actuator/**").permitAll()
                .anyRequest().denyAll()
            );
        
        return http.build();
    }

    @Bean
    @Order(4)
    public SecurityFilterChain defaultFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/**")
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/", "/remittance", "/countries-banks", "/users", "/notices", "/qna").permitAll() // 프론트엔드 라우팅 허용
                .anyRequest().denyAll()
            );
        
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 환경별 허용 origin 설정
        String[] allowedOrigins = getCorsAllowedOrigins();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    /**
     * 환경별 CORS 허용 origin 설정
     */
    private String[] getCorsAllowedOrigins() {
        String corsOrigins = env.getProperty("cors.allowed.origins");
        
        if (corsOrigins != null && !corsOrigins.isEmpty()) {
            // 환경 변수에서 설정된 경우 (쉼표로 구분된 값들을 배열로 변환)
            return corsOrigins.split(",");
        }
        
        // 환경 변수가 없는 경우 기본값 (개발 환경)
        return new String[]{
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173"
        };
    }
} 