package com.example.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
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
                // 운영 환경에서만 actuator 허용 (개발 환경에서는 비활성화)
                .requestMatchers("/actuator/**").denyAll()
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
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
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
        String profile = env.getActiveProfiles().length > 0 ? env.getActiveProfiles()[0] : "dev";
        
        switch (profile) {
            case "prod":
                return new String[]{"http://localhost:5173", "https://*.vercel.app"};  // Vite 개발용 + Vercel 허용
            case "staging":
                return new String[]{""};
            default:
                return new String[]{"http://localhost:5173"};
        }
    }
} 