package com.carboncredit.security;

import com.carboncredit.entity.User;
import com.carboncredit.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtil {

    private static final int MIN_HS256_SECRET_LENGTH = 32;

    private final UserRepository userRepository;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms:3600000}")
    private long expirationMs;

    private Key signingKey;

    @PostConstruct
    void initializeSigningKey() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < MIN_HS256_SECRET_LENGTH) {
            throw new IllegalStateException("JWT secret must be provided and be at least 32 bytes long");
        }
        signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String usernameOrEmail) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        User user = userRepository.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole().name())
                .claim("userId", user.getId().toString())
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(parseClaims(token));
    }

    public boolean validateToken(String token) {
        try {
            return !extractExpiration(token).before(new Date());
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired");
            return false;
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT token");
            return false;
        } catch (SignatureException e) {
            log.warn("Invalid JWT signature");
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT token validation failed");
            return false;
        }
    }

    public <T> T extractClaim(String token, String claimKey, Class<T> claimType) {
        return parseClaims(token).get(claimKey, claimType);
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
