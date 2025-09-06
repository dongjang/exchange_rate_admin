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
                .requestMatchers("/api/admin/auth/**").permitAll()
                .requestMatchers("/api/admin/dashboard/**").authenticated()
                .requestMatchers("/api/admin/users/**").authenticated()
                .requestMatchers("/api/admin/remittance/**").authenticated()
                .requestMatchers("/api/admin/remittance-limits/**").authenticated()
                .requestMatchers("/api/admin/notices/**").authenticated()
                .requestMatchers("/api/admin/qna/**").authenticated()
                .requestMatchers("/api/admin/countries/**").authenticated()
                .requestMatchers("/api/admin/banks/**").authenticated()
                .requestMatchers("/api/admin/admins/**").authenticated()
                .requestMatchers("/api/admin/**").authenticated()
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
                .requestMatchers("/api/files/*/download").authenticated()
                .requestMatchers("/api/files/*/base64").authenticated()
                .requestMatchers("/api/files/*/info").authenticated()
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