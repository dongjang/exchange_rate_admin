package com.example.mapper;

import com.example.domain.User;
import com.example.dto.UserResponse;
import com.example.dto.UserSearchRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {
    List<UserResponse> searchUsers(UserSearchRequest searchRequest);
    int getUserCount(UserSearchRequest searchRequest);
    UserResponse getUserById(Long id);
    void updateUserStatus(@Param("id") Long id, @Param("status") String status);
} 