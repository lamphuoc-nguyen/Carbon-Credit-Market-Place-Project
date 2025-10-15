package com.carboncredit.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class LoginDto {
    @NotEmpty(message = "Username or email is required")
    private String usernameOrEmail;

    @NotEmpty(message = "Password is required")
    private String password;
}