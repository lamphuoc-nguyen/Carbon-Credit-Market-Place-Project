package com.carboncredit.backend.Controller;

import com.carboncredit.backend.Entity.Roles;
import com.carboncredit.backend.Entity.Users;
import com.carboncredit.backend.Repository.RolesRepository;
import com.carboncredit.backend.Repository.UsersRepository;
import com.carboncredit.backend.SecurityService.JwtTokenProvider;
import com.carboncredit.backend.dto.AuthResponseDto;
import com.carboncredit.backend.dto.LoginDto;
import com.carboncredit.backend.dto.RegisterDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsersRepository usersRepository;
    private final RolesRepository rolesRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthenticationManager authenticationManager, UsersRepository usersRepository, RolesRepository rolesRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.usersRepository = usersRepository;
        this.rolesRepository = rolesRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterDto registerDto) {
        // Kiểm tra email đã tồn tại chưa
        if (usersRepository.existsByEmail(registerDto.getEmail())) {
            return new ResponseEntity<>("Email is already taken!", HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra username đã tồn tại chưa
        if (usersRepository.existsByUsername(registerDto.getUsername())) {
            return new ResponseEntity<>("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        Users user = new Users();
        user.setName(registerDto.getUsername());
        user.setUsername(registerDto.getUsername());
        user.setEmail(registerDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerDto.getPassword())); // Mã hóa password
        user.setProvider("LOCAL"); // Đánh dấu đây là tài khoản thường
        user.setCreatedAt(LocalDateTime.now());

        // ✅ REMOVED: Auto buyer role assignment
        // ✅ NEW: Set profile as incomplete (no role assigned yet)
        user.setRole(null); // No role assigned initially
        user.setProfileStatus(0); // Profile incomplete

        usersRepository.save(user);

        return new ResponseEntity<>("User registered successfully!", HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> loginUser(@Valid @RequestBody LoginDto loginDto) {
        // Xác thực người dùng bằng Spring Security
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getUsernameOrEmail(),
                        loginDto.getPassword()
                )
        );

        // Nếu xác thực thành công, đặt authentication vào security context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Tạo JWT
        String token = jwtTokenProvider.createAccessToken(authentication);

        // Trả về JWT cho client
        return ResponseEntity.ok(new AuthResponseDto(token));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        return new ResponseEntity<>("User logged out successfully!", HttpStatus.OK);
    }
}
