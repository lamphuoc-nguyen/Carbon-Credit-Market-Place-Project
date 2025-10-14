package com.carboncredit.backend.SecurityConfig;

import com.carboncredit.backend.SecurityService.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public OAuth2AuthenticationSuccessHandler(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // 1. Tạo Access Token và Refresh Token
        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String refreshToken = jwtTokenProvider.createRefreshToken(authentication);

        // 2. Gửi Refresh Token về client qua HttpOnly Cookie để bảo mật
        Cookie refreshTokenCookie = new Cookie("refresh_token", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true); // Chỉ gửi qua HTTPS
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // Ví dụ: 7 ngày
        response.addCookie(refreshTokenCookie);

        // 3. Xây dựng URL để redirect về frontend
        // Cách tiếp cận tốt là redirect về một trang callback và truyền Access Token qua query param
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/auth/callback") // URL của frontend
                .queryParam("token", accessToken)
                .build().toUriString();

        // Xóa các thuộc tính xác thực tạm thời
        clearAuthenticationAttributes(request);

        // Thực hiện redirect
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
