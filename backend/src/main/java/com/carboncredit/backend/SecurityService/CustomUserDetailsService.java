package com.carboncredit.backend.SecurityService;

import com.carboncredit.backend.Repository.UsersRepository;
import com.carboncredit.backend.Entity.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsersRepository usersRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        Users user = usersRepository.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail));

        // Handle users without roles (incomplete profiles)
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "INCOMPLETE_PROFILE";

        // Use a default password for OAuth users (they don't use password-based auth)
        String password = user.getPasswordHash() != null ? user.getPasswordHash() : "OAUTH_USER";

        return new User(user.getEmail(), password,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + roleName)));
    }
}
