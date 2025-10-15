package com.carboncredit.backend.Controller;

import com.carboncredit.backend.Entity.Roles;
import com.carboncredit.backend.Entity.Users;
import com.carboncredit.backend.Repository.RolesRepository;
import com.carboncredit.backend.Repository.UsersRepository;
import com.carboncredit.backend.dto.ProfileStatusDto;
import com.carboncredit.backend.dto.SetRoleDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UsersRepository usersRepository;
    private final RolesRepository rolesRepository;

    public ProfileController(UsersRepository usersRepository, RolesRepository rolesRepository) {
        this.usersRepository = usersRepository;
        this.rolesRepository = rolesRepository;
    }

    // Check profile completion status
    @GetMapping("/status")
    public ResponseEntity<ProfileStatusDto> getProfileStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String usernameOrEmail = authentication.getName();

        Optional<Users> userOpt = usersRepository.findByUsernameOrEmail(usernameOrEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ProfileStatusDto(0, false, null, "User not found"));
        }

        Users user = userOpt.get();
        boolean hasRole = user.getRole() != null;
        String roleName = hasRole ? user.getRole().getRoleName() : null;
        String message = hasRole ? "Profile is complete" : "Please select your role to complete your profile";

        ProfileStatusDto statusDto = new ProfileStatusDto(
                user.getProfileStatus(),
                hasRole,
                roleName,
                message
        );

        return ResponseEntity.ok(statusDto);
    }

    // Get available roles for selection
    @GetMapping("/roles")
    public ResponseEntity<List<Roles>> getAvailableRoles() {
        List<Roles> roles = rolesRepository.findAll();
        return ResponseEntity.ok(roles);
    }

    // Set user role and complete profile
    @PostMapping("/set-role")
    public ResponseEntity<?> setUserRole(@Valid @RequestBody SetRoleDto setRoleDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String usernameOrEmail = authentication.getName();

        Optional<Users> userOpt = usersRepository.findByUsernameOrEmail(usernameOrEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        Users user = userOpt.get();

        // Check if user already has a role (prevent changing role after initial setup)
        if (user.getRole() != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User already has a role assigned. Role cannot be changed.");
        }

        // Validate role exists
        Optional<Roles> roleOpt = rolesRepository.findById(setRoleDto.getRoleId());
        if (roleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid role selected");
        }

        Roles role = roleOpt.get();

        // Verify role name matches (additional security)
        if (!role.getRoleName().equals(setRoleDto.getRoleName())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Role ID and role name do not match");
        }

        // Set role and mark profile as complete
        user.setRole(role);
        user.setProfileStatus(1); // Mark as complete
        usersRepository.save(user);

        return ResponseEntity.ok("Role assigned successfully. Profile is now complete!");
    }

    // Get current user profile info
    @GetMapping("/info")
    public ResponseEntity<?> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String usernameOrEmail = authentication.getName();

        Optional<Users> userOpt = usersRepository.findByUsernameOrEmail(usernameOrEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        Users user = userOpt.get();

        // Create a safe response object (don't expose sensitive data)
        return ResponseEntity.ok(new ProfileInfoDto(
                user.getUserID(),
                user.getEmail(),
                user.getUsername(),
                user.getName(),
                user.getProfileStatus(),
                user.getRole() != null ? user.getRole().getRoleName() : null,
                user.getProvider(),
                user.getAvatarUrl()
        ));
    }

    // Inner DTO class for profile info response
    public static class ProfileInfoDto {
        private Integer userId;
        private String email;
        private String username;
        private String name;
        private Integer profileStatus;
        private String roleName;
        private String provider;
        private String avatarUrl;

        public ProfileInfoDto(Integer userId, String email, String username, String name,
                            Integer profileStatus, String roleName, String provider, String avatarUrl) {
            this.userId = userId;
            this.email = email;
            this.username = username;
            this.name = name;
            this.profileStatus = profileStatus;
            this.roleName = roleName;
            this.provider = provider;
            this.avatarUrl = avatarUrl;
        }

        // Getters
        public Integer getUserId() { return userId; }
        public String getEmail() { return email; }
        public String getUsername() { return username; }
        public String getName() { return name; }
        public Integer getProfileStatus() { return profileStatus; }
        public String getRoleName() { return roleName; }
        public String getProvider() { return provider; }
        public String getAvatarUrl() { return avatarUrl; }
    }
}
