package com.carboncredit.backend.SecurityService;

import com.carboncredit.backend.Entity.Users;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {

    private final OAuth2User oauth2User;
    private final Users user;

    public CustomOAuth2User(OAuth2User oauth2User, Users user) {
        this.oauth2User = oauth2User;
        this.user = user;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oauth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleName().toUpperCase())
        );
    }

    @Override
    public String getName() {
        return user.getName();
    }

    public String getEmail() {
        return user.getEmail();
    }

    public Users getUser() {
        return user;
    }

    public Integer getUserId() {
        return user.getUserID();
    }

    public String getRole() {
        return user.getRole().getRoleName();
    }
}
