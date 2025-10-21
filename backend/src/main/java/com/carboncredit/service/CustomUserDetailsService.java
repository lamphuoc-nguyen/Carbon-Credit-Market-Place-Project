package com.carboncredit.service;

import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.carboncredit.entity.User;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public CustomUserDetailsService(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        log.debug("Loading user details for: {}", usernameOrEmail);

        // step 1: Find user in database by username OR email
        User user = userService.findByUsernameOrEmail(usernameOrEmail).orElseThrow(() -> {
            log.error("User not found: {}", usernameOrEmail);
            return new UsernameNotFoundException("User not found: " + usernameOrEmail);
        });

        log.info("✅ [AUTH] User found: {} (searched with: {})", user.getUsername(), usernameOrEmail);
        log.info("🔑 [AUTH] Password hash exists: {}", user.getPasswordHash() != null);
        log.info("🔑 [AUTH] Password hash length: {}",
                user.getPasswordHash() != null ? user.getPasswordHash().length() : 0);

        String passwordHash = user.getPasswordHash();
        log.info("🔧 [AUTH] About to create UserDetails with password: '{}'",
                passwordHash != null ? passwordHash.substring(0, 20) + "..." : "NULL");

        // Step 2: Convert YOUR User entity to Spring Security UserDetails
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                passwordHash, // ⭐ Explicitly use the variable
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));

        log.info("✅ [AUTH] UserDetails created, authorities: {}", userDetails.getAuthorities());

        return userDetails;
    }

    // handle password
    private String getValidPassword(User user) {
        // Handle both plain text and hashed passwords
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            String password = user.getPassword().trim();

            // Check if password is already encoded (BCrypt hashes start with $2a$, $2b$, or
            // $2y$)
            if (password.matches("^\\$2[ayb]\\$.{56}$")) {
                return password; // Already encoded
            } else {
                // Encode plain text password
                return passwordEncoder.encode(password);
            }
        }

        // Return empty password if none provided (though this might cause
        // authentication issues)
        return "";
    }
}
