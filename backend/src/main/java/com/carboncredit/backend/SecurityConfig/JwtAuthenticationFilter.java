package com.carboncredit.backend.SecurityConfig;

import com.carboncredit.backend.SecurityService.CustomUserDetailsService;
// ... các import khác
import com.carboncredit.backend.SecurityService.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Checklist: Class Declaration
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    // Checklist: Dependencies
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    // Checklist: Core Methods - doFilterInternal()
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // Checklist: Logic Flow - Extract JWT
            String jwt = getJwtFromRequest(request);

            // Checklist: Logic Flow - Validate the token
            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {

                // Lấy email từ chuỗi jwt
                String email = jwtTokenProvider.getEmailFromJWT(jwt);

                // Checklist: Logic Flow - Load user details
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

                // Checklist: Logic Flow - Create authentication object
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Checklist: Logic Flow - Set authentication in SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            // Checklist: Key Missing Functionality - Error handling
            logger.error("Could not set user authentication in security context", ex);
        }

        // Checklist: Logic Flow - Continue filter chain
        filterChain.doFilter(request, response);
    }

    // Checklist: Core Methods - getJwtFromRequest()
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}