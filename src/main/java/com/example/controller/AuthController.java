package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.AuthResponse;
import com.example.dto.UserInfoResponse;
import com.example.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @GetMapping("/success")
    public AuthResponse loginSuccess(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User != null) {
            UserInfoResponse userInfo = new UserInfoResponse(
                oauth2User.getAttribute("email"),
                oauth2User.getAttribute("name"),
                oauth2User.getAttribute("picture")
            );
            userService.saveOrUpdateUser(userInfo.toMap());
            return new AuthResponse(true, "로그인 성공", userInfo);
        } else {
            return new AuthResponse(false, "로그인 실패", null);
        }
    }

    @GetMapping("/failure")
    public AuthResponse loginFailure() {
        return new AuthResponse(false, "로그인 실패", null);
    }

    @GetMapping("/user")
    public AuthResponse getCurrentUser(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User != null) {
            UserInfoResponse userInfo = new UserInfoResponse(
                oauth2User.getAttribute("email"),
                oauth2User.getAttribute("name"),
                oauth2User.getAttribute("picture")
            );
            return new AuthResponse(true, "인증됨", userInfo);  
        } else {
            return new AuthResponse(false, "인증되지 않음", null);
        }
    }

    @PostMapping("/logout")
    public AuthResponse logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        response.setHeader("Set-Cookie", "JSESSIONID=; Max-Age=0; Path=/; HttpOnly");
        return new AuthResponse(true, "로그아웃 성공", null);
    }
} 