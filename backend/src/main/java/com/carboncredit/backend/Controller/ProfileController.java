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
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;

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
    public ResponseEntity<?> getAvailableRoles() {
        try {
            List<Roles> roles = rolesRepository.findAll();

            // If no roles found in database, create default roles
            if (roles.isEmpty()) {
                roles = createDefaultRoles();
            }

            // Validate that we have proper role data
            if (roles == null || roles.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "No roles available in the system");
                errorResponse.put("data", new ArrayList<>());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            // Return successful response with roles data
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Roles loaded successfully");
            response.put("data", roles);
            return ResponseEntity.ok(roles); // Return roles directly for frontend compatibility

        } catch (Exception e) {
            System.err.println("Error fetching roles: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to load roles: " + e.getMessage());
            errorResponse.put("data", new ArrayList<>());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Helper method to create default roles if none exist
    private List<Roles> createDefaultRoles() {
        try {
            List<Roles> defaultRoles = new ArrayList<>();

            String[] roleNames = {"evowner", "buyer", "verifier", "admin"};

            for (String roleName : roleNames) {
                if (!rolesRepository.findByRoleName(roleName).isPresent()) {
                    Roles role = new Roles();
                    role.setRoleName(roleName);
                    defaultRoles.add(rolesRepository.save(role));
                }
            }

            // If we created any roles, return all roles from database
            if (!defaultRoles.isEmpty()) {
                return rolesRepository.findAll();
            }

            return defaultRoles;
        } catch (Exception e) {
            System.err.println("Error creating default roles: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // Set user role and complete profile
    @PostMapping("/set-role")
    public ResponseEntity<?> setUserRole(@Valid @RequestBody SetRoleDto setRoleDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String usernameOrEmail = authentication.getName();

        Optional<Users> userOpt = usersRepository.findByUsernameOrEmail(usernameOrEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("User not found"));
        }

        Users user = userOpt.get();

        // Allow role change only if profile is incomplete or user has no role
        if (user.getRole() != null && user.getProfileStatus() == 1) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Profile is already complete. Role cannot be changed through this endpoint."));
        }

        // Validate role exists
        Optional<Roles> roleOpt = rolesRepository.findById(setRoleDto.getRoleId());
        if (roleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Invalid role selected"));
        }

        Roles role = roleOpt.get();

        try {
            // Set role and mark profile as complete
            user.setRole(role);
            user.setProfileStatus(1); // Mark as complete
            user.setStatus("ACTIVE"); // Update status to ACTIVE
            usersRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Role assigned successfully. Profile is now complete!");
            response.put("roleName", role.getRoleName());
            response.put("profileStatus", 1);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to save role assignment"));
        }
    }

    // Get current user profile info
    @GetMapping("/info")
    public ResponseEntity<?> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String usernameOrEmail = authentication.getName();

        Optional<Users> userOpt = usersRepository.findByUsernameOrEmail(usernameOrEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("User not found"));
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

    // Helper method to create consistent error responses
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }

    // Inner DTO class for profile info response
    public static class ProfileInfoDto {
        private final Integer userId;
        private final String email;
        private final String username;
        private final String name;
        private final Integer profileStatus;
        private final String roleName;
        private final String provider;
        private final String avatarUrl;

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
