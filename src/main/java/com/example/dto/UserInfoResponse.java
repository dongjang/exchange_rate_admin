package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.HashMap;
import java.util.Map;

@Data
@AllArgsConstructor
public class UserInfoResponse {
    private String email;
    private String name;
    private String picture;

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("email", email);
        map.put("name", name);
        map.put("picture", picture);
        return map;
    }
} 