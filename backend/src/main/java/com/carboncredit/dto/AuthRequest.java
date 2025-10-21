package com.carboncredit.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String usernameOrEmail;  // Changed to match frontend
    private String password;
}
