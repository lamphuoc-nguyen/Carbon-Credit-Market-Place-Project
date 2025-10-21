package com.gr4.carboncredit.security;

import com.gr4.carboncredit.service.TokenBlacklistService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.gr4.carboncredit.service.UserService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final TokenBlacklistService blacklistService;

    public JwtFilter(JwtUtil jwtUtil, UserService userService, TokenBlacklistService blacklistService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.blacklistService = blacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        log.debug("🔍 Processing request: {} {}", request.getMethod(), requestURI);

        String header = request.getHeader("Authorization");
        String token = null;

        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            token = header.substring(7);
            log.debug("✅ Token extracted from Authorization header");
        } else {
            log.debug("❌ No Bearer token found in Authorization header");
        }

        if (token != null) {
            try {
                boolean isValid = jwtUtil.validateToken(token);
                boolean isBlacklisted = blacklistService.isBlacklisted(token);

                log.debug("🔐 Token valid: {}, Blacklisted: {}", isValid, isBlacklisted);

                if (isValid && !isBlacklisted && SecurityContextHolder.getContext().getAuthentication() == null) {
                    String username = jwtUtil.extractUsername(token);
                    String role = jwtUtil.extractClaim(token, "role", String.class);

                    log.info("👤 Authenticating user: {} with role: {}", username, role);

                    if (role != null) {
                        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                        log.debug("✨ Granted authorities: {}", authorities);

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(username, null, authorities);
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);

                        log.info("✅ Authentication set in SecurityContext for user: {}", username);
                    } else {
                        log.warn("⚠️ Role claim is null in token");
                    }
                } else {
                    if (!isValid) {
                        log.warn("⚠️ Token validation failed");
                    }
                    if (isBlacklisted) {
                        log.warn("⚠️ Token is blacklisted");
                    }
                    if (SecurityContextHolder.getContext().getAuthentication() != null) {
                        log.debug("ℹ️ Authentication already set");
                    }
                }
            } catch (Exception e) {
                log.error("❌ Error processing JWT token: {}", e.getMessage(), e);
            }
        }

        filterChain.doFilter(request, response);
    }
}
