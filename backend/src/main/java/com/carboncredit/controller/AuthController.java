package com.carboncredit.controller;

import com.carboncredit.dto.AuthRequest;
import com.carboncredit.dto.AuthResponse;
import com.carboncredit.dto.RegisterRequest;
import com.carboncredit.dto.ApiResponse;
import com.carboncredit.dto.UserDTO;
import com.carboncredit.entity.User;
import com.carboncredit.security.JwtUtil;
import com.carboncredit.service.TokenBlacklistService;
import com.carboncredit.service.UserService;
import com.carboncredit.util.DTOMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.time.LocalDateTime;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService blacklistService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        log.info("Login attempt for user: {}", request.getUsernameOrEmail());

        // Authenticate with usernameOrEmail
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword()));

        // Generate token
        String token = jwtUtil.generateToken(request.getUsernameOrEmail());

        // Return with accessToken field
        return ResponseEntity.ok(new AuthResponse(token, "Bearer"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDTO>> registerUser(@Valid @RequestBody RegisterRequest request) {
        log.info("Registering new user: {}", request.getUsername());

        try {
            // Create User entity from request
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setFullName(request.getFullName());
            user.setPhone(request.getPhone());
            user.setRole(User.UserRole.valueOf(request.getRole()));
            
            // Set province if provided
            if (request.getProvince() != null && !request.getProvince().isEmpty()) {
                try {
                    user.setProvince(User.Province.valueOf(request.getProvince()));
                } catch (IllegalArgumentException e) {
                    log.error("Invalid province value: {}", request.getProvince());
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.<UserDTO>builder()
                                    .success(false)
                                    .message("Invalid province. Please provide a valid Vietnam province code.")
                                    .build());
                }
            }
            
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            User createdUser = userService.createUser(user);
            UserDTO userDTO = DTOMapper.toUserDTO(createdUser);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User registered successfully", userDTO));
        } catch (IllegalArgumentException e) {
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<UserDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Unexpected registration error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<UserDTO>builder()
                            .success(false)
                            .message("Registration failed: " + e.getMessage())
                            .build());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "unknown";
        log.info("User {} is logging out", username);

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            long exp = jwtUtil.extractExpiration(token).getTime();
            blacklistService.blacklistToken(token, exp);
        }

        return ResponseEntity.ok(ApiResponse.success("User logged out successfully!", null));
    }
}
