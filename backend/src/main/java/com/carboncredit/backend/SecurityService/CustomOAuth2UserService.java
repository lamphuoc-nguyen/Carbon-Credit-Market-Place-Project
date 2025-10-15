// Java
package com.carboncredit.backend.SecurityService;

import com.carboncredit.backend.Entity.Users;
import com.carboncredit.backend.Entity.Roles;
import com.carboncredit.backend.Repository.UsersRepository;
import com.carboncredit.backend.Repository.RolesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private RolesRepository rolesRepository;

    public CustomOAuth2UserService() {
        this.delegate = new DefaultOAuth2UserService();
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = delegate.loadUser(userRequest);

        System.out.println("--- GitHub User Attributes ---");
        System.out.println(oauth2User.getAttributes()); // In ra tất cả thông tin GitHub trả về
        System.out.println("-----------------------------");

        String email = oauth2User.getAttribute("email");
        System.out.println("Email from GitHub: " + email);

        return processOAuth2User(userRequest, oauth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String email = extractEmail(oauth2User, registrationId);
        String name = oauth2User.getAttribute("name");
        String providerId = extractProviderId(oauth2User, registrationId);
        String avatarUrl = extractAvatarUrl(oauth2User, registrationId);

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider: " + registrationId);
        }

        Optional<Users> existingUser = usersRepository.findByProviderAndProviderId(
                registrationId.toUpperCase(), providerId);

        Users user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            updateExistingUser(user, email, name, avatarUrl);
        } else {
            Optional<Users> emailUser = usersRepository.findByEmail(email);
            if (emailUser.isPresent()) {
                user = emailUser.get();
                linkUserToOAuth2Provider(user, registrationId, providerId, avatarUrl);
            } else {
                user = createNewUser(email, name, registrationId, providerId, avatarUrl);
            }
        }

        return new CustomOAuth2User(oauth2User, user);
    }

    private String extractEmail(OAuth2User oauth2User, String provider) {
        String email = oauth2User.getAttribute("email");

        // GitHub specific email handling
        if ("github".equalsIgnoreCase(provider) && email == null) {
            // For GitHub, if primary email is private, we might need to handle it differently
            // GitHub API might return null email if user has private email
            throw new OAuth2AuthenticationException("GitHub email is private or not accessible. Please make your email public in GitHub settings.");
        }

        return email;
    }

    private String extractProviderId(OAuth2User oauth2User, String provider) {
        if ("github".equalsIgnoreCase(provider)) {
            // GitHub: use "login" as the unique identifier (username)
            String login = oauth2User.getAttribute("login");
            if (login != null) {
                return login;
            }
            // Fallback to id if login is not available
            Object id = oauth2User.getAttribute("id");
            return id != null ? id.toString() : null;
        } else if ("google".equalsIgnoreCase(provider)) {
            // Google uses "sub" as the unique identifier
            return oauth2User.getAttribute("sub");
        } else {
            // Default fallback
            Object id = oauth2User.getAttribute("id");
            return id != null ? id.toString() : oauth2User.getAttribute("sub");
        }
    }

    private String extractAvatarUrl(OAuth2User oauth2User, String provider) {
        if ("google".equalsIgnoreCase(provider)) {
            return oauth2User.getAttribute("picture");
        } else if ("github".equalsIgnoreCase(provider)) {
            return oauth2User.getAttribute("avatar_url");
        }
        return null;
    }

    private void updateExistingUser(Users user, String email, String name, String avatarUrl) {
        user.setEmail(email);
        user.setName(name != null ? name : user.getName());
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        usersRepository.save(user);
    }

    private void linkUserToOAuth2Provider(Users user, String provider, String providerId, String avatarUrl) {
        user.setProvider(provider.toUpperCase());
        user.setProviderId(providerId);
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        user.setPasswordHash(null);
        usersRepository.save(user);
    }

    private Users createNewUser(String email, String name, String provider, String providerId, String avatarUrl) {
        Users newUser = new Users();
        newUser.setEmail(email);
        newUser.setName(name != null ? name : email);
        newUser.setUsername(providerId); // Use providerId (GitHub login or Google sub) as username
        newUser.setPasswordHash(null);
        newUser.setProvider(provider.toUpperCase());
        newUser.setProviderId(providerId);
        newUser.setAvatarUrl(avatarUrl);
        newUser.setCreatedAt(LocalDateTime.now());

        // ✅ NEW: Set status as INCOMPLETE for new OAuth2 users
        newUser.setRole(null); // No role assigned initially
        newUser.setProfileStatus(0); // Profile incomplete
        newUser.setStatus("INCOMPLETE"); // Status incomplete - needs role selection

        return usersRepository.save(newUser);
    }
}
