package com.carboncredit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;  // Changed from 'token' to 'accessToken'
    private String tokenType = "Bearer";
}
