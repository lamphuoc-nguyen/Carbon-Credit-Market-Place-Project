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
            import java.util.Map;
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
                    return processOAuth2User(userRequest, oauth2User);
                }

                private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
                    String registrationId = userRequest.getClientRegistration().getRegistrationId();
                    String email = oauth2User.getAttribute("email");
                    String name = oauth2User.getAttribute("name");
                    String providerId = oauth2User.getAttribute("id") != null
                            ? oauth2User.getAttribute("id").toString()
                            : oauth2User.getAttribute("sub").toString();
                    String avatarUrl = extractAvatarUrl(oauth2User, registrationId);

                    if (email == null) {
                        throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
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

                private String extractAvatarUrl(OAuth2User oauth2User, String provider) {
                    if ("google".equalsIgnoreCase(provider)) {
                        return oauth2User.getAttribute("picture");
                    } else if ("facebook".equalsIgnoreCase(provider)) {
                        Map<String, Object> picture = oauth2User.getAttribute("picture");
                        if (picture != null) {
                            Map<String, Object> data = (Map<String, Object>) picture.get("data");
                            if (data != null) {
                                return (String) data.get("url");
                            }
                        }
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
                    newUser.setPasswordHash(null);
                    newUser.setProvider(provider.toUpperCase());
                    newUser.setProviderId(providerId);
                    newUser.setAvatarUrl(avatarUrl);
                    newUser.setCreatedAt(LocalDateTime.now());

                    Optional<Roles> buyerRole = rolesRepository.findByRoleName("buyer");
                    if (buyerRole.isPresent()) {
                        newUser.setRole(buyerRole.get());
                    } else {
                        throw new RuntimeException("Default role 'buyer' not found");
                    }

                    return usersRepository.save(newUser);
                }
            }