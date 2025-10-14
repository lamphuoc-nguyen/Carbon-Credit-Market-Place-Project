package com.carboncredit.backend.SecurityService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;

    @Value("${jwt.refresh-expiration}")
    private long jwtRefreshExpirationInMs;

    private Key key;

    // Khởi tạo key một lần sau khi các thuộc tính được inject
    @jakarta.annotation.PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Tạo Access Token - Fixed to handle both UserDetails and CustomOAuth2User
    public String createAccessToken(Authentication authentication) {
        String email = getEmailFromAuthentication(authentication);
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    // Tạo Refresh Token - Fixed to handle both UserDetails and CustomOAuth2User
    public String createRefreshToken(Authentication authentication) {
        String email = getEmailFromAuthentication(authentication);
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtRefreshExpirationInMs);

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    // Helper method to extract email from different authentication principal types
    private String getEmailFromAuthentication(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomOAuth2User) {
            // OAuth2 login
            return ((CustomOAuth2User) principal).getEmail();
        } else if (principal instanceof UserDetails) {
            // Regular username/password login
            return ((UserDetails) principal).getUsername(); // In your case, username is email
        } else {
            throw new IllegalArgumentException("Unsupported principal type: " + principal.getClass());
        }
    }

    public String getEmailFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) key)
                .build()
                .parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            // Log lỗi ở đây nếu cần
            // Ví dụ: logger.error("Invalid JWT token: {}", ex.getMessage());
        }
        return false;
    }
}
