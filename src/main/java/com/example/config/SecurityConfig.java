package com.example.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final Environment env;

    @Bean
    public SecurityFilterChain userFilterChain(HttpSecurity http, ClientRegistrationRepository clientRegistrationRepository) throws Exception {
        http
            .securityMatcher("/api/users/**", "/oauth2/**", "/login/**")
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // 공개 API
                .requestMatchers("/api/users/auth/**").permitAll()
                .requestMatchers("/api/users/notices/**").permitAll() // 공지사항은 공개
                .requestMatchers("/api/users/exchange-rates/**").permitAll() // 환율 정보는 공개
                // 인증 필요 API
                .requestMatchers("/api/users/remittance/**").authenticated()
                .requestMatchers("/api/users/qna/**").authenticated()
                .requestMatchers("/api/users/profile/**").authenticated()
                .requestMatchers("/api/users/**").authenticated()
                .anyRequest().permitAll()
            )
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl(getFrontendUrl() + "/auth/success", true)
                .failureUrl(getFrontendUrl() + "/auth/failure")
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .authorizationEndpoint(authorization -> authorization
                    .authorizationRequestResolver(
                        new CustomAuthorizationRequestResolver(
                            clientRegistrationRepository,
                            "/oauth2/authorization"
                        )
                    )
                )
            );
        
        return http.build();
    }

    @Bean
    public SecurityFilterChain adminFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/admin/**")
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // 관리자 인증 API
                .requestMatchers("/api/admin/auth/**").permitAll()
                // 대시보드 API (인증된 관리자만)
                .requestMatchers("/api/admin/dashboard/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // 사용자 관리 API (인증된 관리자만)
                .requestMatchers("/api/admin/users/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/admin/remittance/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/admin/remittance-limits/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/admin/notices/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/admin/qna/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/admin/countries/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/admin/banks/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                // 관리자 관리 API (최고 관리자만)
                .requestMatchers("/api/admin/admins/**").hasRole("SUPER_ADMIN")
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .anyRequest().denyAll()
            );
        
        return http.build();
    }

    @Bean
    public SecurityFilterChain fileFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/files/**")
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // 파일 다운로드 (인증된 사용자만)
                .requestMatchers("/api/files/*/download").authenticated()
                .requestMatchers("/api/files/*/base64").authenticated()
                // 파일 정보 조회 (인증된 사용자만)
                .requestMatchers("/api/files/*/info").authenticated()
                // 파일 업로드 (관리자만)
                .requestMatchers("/api/files/upload").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/files/**").authenticated()
                .anyRequest().denyAll()
            );
        
        return http.build();
    }

    @Bean
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
     * 환경별 프론트엔드 URL 반환
     */
    private String getFrontendUrl() {
        String profile = env.getActiveProfiles().length > 0 ? env.getActiveProfiles()[0] : "dev";
        
        switch (profile) {
            case "prod":
                return ""; // 운영 도메인
            case "staging":
                return ""; // 스테이징 도메인
            default:
                return "http://localhost:5173"; // 개발 환경
        }
    }

    /**
     * 환경별 CORS 허용 origin 설정
     */
    private String[] getCorsAllowedOrigins() {
        String profile = env.getActiveProfiles().length > 0 ? env.getActiveProfiles()[0] : "dev";
        
        switch (profile) {
            case "prod":
                return new String[]{""};
            case "staging":
                return new String[]{""};
            default:
                return new String[]{"http://localhost:5173"};
        }
    }
} 