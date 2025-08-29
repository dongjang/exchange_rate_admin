package com.example.interceptor;

import com.example.context.SessionContext;
import com.example.enums.SessionType;
import com.example.service.RedisService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

/**
 * 세션 컨텍스트 인터셉터
 * - 모든 요청을 가로채서 세션 정보를 컨텍스트에 설정
 * - URL 패턴에 따라 사용자/관리자 세션 구분
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SessionContextInterceptor implements HandlerInterceptor {

    private final RedisService redisService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestURI = request.getRequestURI();
        
        try {
            // URL 패턴에 따라 세션 타입 결정
            SessionType sessionType = determineSessionType(requestURI);
            
            // 세션 정보 조회
            String sessionId = extractSessionId(request, sessionType);
            if (sessionId != null) {
                Object sessionData = getSessionData(sessionType, sessionId);
                
                if (sessionData != null) {
                    // SessionContext 설정
                    SessionContext context = new SessionContext();
                    setSessionContextFromData(context, sessionData, sessionType);
                    SessionContext.setContext(context);
                    
                    log.info("SessionContext 설정 완료 - URI: {}, SessionType: {}, UserId: {}, AdminId: {}", 
                            requestURI, sessionType, context.getUserId(), context.getAdminId());
                }
            }
            
        } catch (Exception e) {
            log.error("SessionContext 설정 실패 - URI: {}, Error: {}", requestURI, e.getMessage());
        }
        
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 요청 완료 후 컨텍스트 정리
        SessionContext.clear();
    }

    /**
     * URL 패턴에 따라 세션 타입 결정
     */
    private SessionType determineSessionType(String requestURI) {
        if (requestURI.startsWith("/api/admin")) {
            return SessionType.ADMIN;
        } else {
            return SessionType.USER;
        }
    }

    /**
     * HttpSession에서 세션 정보 추출
     */
    private String extractSessionId(HttpServletRequest request, SessionType sessionType) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            if (SessionType.ADMIN.equals(sessionType)) {
                // 관리자 세션 ID 가져오기
                return (String) session.getAttribute("adminSessionId");
            } else {
                // 사용자 세션 ID 가져오기
                return (String) session.getAttribute("userSessionId");
            }
        }
        
        return null;
    }

    /**
     * 세션 타입에 따라 Redis에서 세션 데이터 조회
     */
    private Object getSessionData(SessionType sessionType, String sessionId) {
        if (SessionType.ADMIN.equals(sessionType)) {
            return redisService.getAdminSession(sessionId);
        } else {
            return redisService.getUserSession(sessionId);
        }
    }

    /**
     * 세션 데이터를 SessionContext에 설정
     */
    @SuppressWarnings("unchecked")
    private void setSessionContextFromData(SessionContext context, Object sessionData, SessionType sessionType) {
        if (sessionData instanceof Map) {
            Map<String, Object> data = (Map<String, Object>) sessionData;
            
            context.setSessionType(sessionType);
            
            if (SessionType.USER.equals(sessionType)) {
                // 사용자 정보 설정
                context.setUserId(getLongValue(data, "userId"));
                context.setUserEmail(getStringValue(data, "userEmail"));
                context.setUserName(getStringValue(data, "userName"));
            } else if (SessionType.ADMIN.equals(sessionType)) {
                // 관리자 정보 설정
                context.setAdminId(getLongValue(data, "adminId"));
                context.setAdminEmail(getStringValue(data, "adminEmail"));
                context.setAdminName(getStringValue(data, "adminName"));
                context.setAdminRole(getStringValue(data, "adminRole"));
                context.setAdminStatus(getStringValue(data, "adminStatus"));
            }
        }
    }

    private Long getLongValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return null;
    }

    private String getStringValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        return value != null ? value.toString() : null;
    }
}
