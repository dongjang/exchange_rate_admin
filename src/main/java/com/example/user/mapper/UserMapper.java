package com.example.user.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.user.dto.UserResponse;
import com.example.user.dto.UserSearchRequest;

@Mapper
public interface UserMapper {
    List<UserResponse> searchUsers(UserSearchRequest searchRequest);
    int getUserCount(UserSearchRequest searchRequest);
    UserResponse getUserById(@Param("id") Long id);
    void updateUserStatus(@Param("id") Long id, @Param("status") String status);
} 