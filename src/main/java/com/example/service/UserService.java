package com.example.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.domain.User;
import com.example.dto.UserResponse;
import com.example.dto.UserUpdateRequest;
import com.example.dto.UserStats;
import com.example.mapper.UserMapper;
import com.example.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserMapper userMapper;

    @Transactional
    public User saveOrUpdateUser(Map<String, Object> userAttributes) {
        String email = (String) userAttributes.get("email");
        String name = (String) userAttributes.get("name");
        String picture = (String) userAttributes.get("picture");

        // 디버깅을 위한 로그 추가
        System.out.println("=== UserService saveOrUpdateUser ===");
        System.out.println("Email: " + email);
        System.out.println("Name: " + name);
        System.out.println("Picture: " + picture);
        System.out.println("All attributes: " + userAttributes);
        System.out.println("=====================================");

        // 기존 사용자 확인
        User existingUser = userRepository.findByEmail(email);
        
        if (existingUser != null) {
            // 기존 사용자 정보 업데이트
            existingUser.setName(name);
            existingUser.setPictureUrl(picture);
            existingUser.setLastLoginAt(LocalDateTime.now());
            existingUser.setUpdatedAt(LocalDateTime.now());
            
            return userRepository.save(existingUser);
        } else {
            // 새 사용자 생성
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .pictureUrl(picture)
                    .status("ACTIVE") // 기본값 설정
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .lastLoginAt(LocalDateTime.now())
                    .build();
            
            return userRepository.save(newUser);
        }
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public void saveUser(String email, String name, String picture, String provider) {
   
        // 기존 사용자 확인
        User existingUser = userRepository.findByEmail(email);
        
        if (existingUser != null) {
            // 기존 사용자 정보는 유지, 마지막 로그인/업데이트만 갱신
            existingUser.setLastLoginAt(LocalDateTime.now());
            existingUser.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(existingUser);
        } else {
            // 새 사용자 생성
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .pictureUrl(picture)
                    .status("ACTIVE") // 기본값 설정
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .lastLoginAt(LocalDateTime.now())
                    .build();
            
            userRepository.save(newUser);
        }
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponse(user);
    }

    @Transactional
    public void updateUser(Long id, UserUpdateRequest request) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        existingUser.setEmail(request.getEmail());
        existingUser.setName(request.getName());
        existingUser.setPictureUrl(request.getPictureUrl());
        if (request.getStatus() != null) {
            existingUser.setStatus(request.getStatus());
        }
        userRepository.save(existingUser);
    }
    
    /**
     * 사용자 통계 조회 (캐싱 적용)
     */
    // @Cacheable("user-stats") // Spring Cache 사용시
    public UserStats getUserStats() {
        return userMapper.selectUserStats();
    }
} 