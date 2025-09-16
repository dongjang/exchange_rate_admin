package com.example.user.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.user.dto.UserResponse;
import com.example.user.dto.UserSearchRequest;
import com.example.user.mapper.UserMapper;

@Service
public class UserService {
    
    //User 전용 Service
    @Autowired
    private UserMapper userMapper;
    
    public List<UserResponse> searchUsers(UserSearchRequest searchRequest) {
        return userMapper.searchUsers(searchRequest);
    }
    
    public int getUserCount(UserSearchRequest searchRequest) {
        return userMapper.getUserCount(searchRequest);
    }
    
    public UserResponse getUserById(Long userId) {
        return userMapper.getUserById(userId);
    }
    
    public void updateUserStatus(Long userId, String status) {
        userMapper.updateUserStatus(userId, status);
    }

    
} 