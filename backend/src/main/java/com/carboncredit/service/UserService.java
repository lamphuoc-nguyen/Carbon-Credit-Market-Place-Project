package com.carboncredit.service;

import com.carboncredit.entity.User;
import com.carboncredit.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WalletService walletService;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final VehicleRepository vehicleRepository;
    private final JourneyDataRepository journeyDataRepository;
    private final CreditListingRepository creditListingRepository;
    private final CarbonCreditRepository carbonCreditRepository;
    private final Co2TransferRequestRepository co2TransferRequestRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public User createUser(User user) {
        log.info("Creating user: {}", user.getUsername());
        log.info("Password is null? {}", user.getPassword() == null);

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + user.getUsername());
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }

        // Check for duplicate phone number
        if (user.getPhone() != null && !user.getPhone().trim().isEmpty() &&
                userRepository.existsByPhone(user.getPhone())) {
            throw new IllegalArgumentException("Phone number already exists: " + user.getPhone());
        }

        // Validate required fields
        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required");
        }

        if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone is required");
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }

        // Hash password
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPasswordHash(hashedPassword);
        log.info("Password hashed successfully");

        //save user first
        User savedUser = userRepository.save(user);
        log.info("User saved with ID: {}", savedUser.getId());

        //Create a wallet for user
        walletService.createWalletForUser(savedUser);
        log.info("Wallet create for user {}: ", savedUser.getUsername());

        // 2. Gửi thông báo Welcome
        try {
            notificationService.notifyWelcome(savedUser);
        } catch (Exception e) {
            log.error("Failed to send welcome notification", e);
            // Không throw exception để tránh rollback việc tạo user chỉ vì lỗi noti
        }

        return savedUser;
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public List<User> findByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Delete user with cascade deletion of all related entities
     * Order of deletion matters due to foreign key constraints:
     * 1. Notifications
     * 2. Transactions (as buyer and seller)
     * 3. Credit Listings
     * 4. Carbon Credits
     * 5. CO2 Transfer Requests
     * 6. Journeys
     * 7. Vehicles
     * 8. Wallet
     * 9. User
     */
    public void deleteUser(UUID id) {
        log.info("Starting cascade delete for user ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        try {
            // 1. Delete all notifications
            var notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(id);
            notificationRepository.deleteAll(notifications);
            log.info("Deleted {} notifications for user {}", notifications.size(), id);
            
            // 2. Delete all transactions (as buyer or seller)
            try {
                var transactionsAsBuyer = transactionRepository.findByBuyerOrSellerOrderByCreatedAtDesc(user, user);
                transactionRepository.deleteAll(transactionsAsBuyer);
                log.info("Deleted {} transactions for user {}", transactionsAsBuyer.size(), id);
            } catch (Exception e) {
                log.warn("Failed to delete transactions: {}", e.getMessage());
            }
            
            // 3. Delete all credit listings
            var listings = creditListingRepository.findByUser(user);
            creditListingRepository.deleteAll(listings);
            log.info("Deleted {} credit listings for user {}", listings.size(), id);
            
            // 4. Delete all carbon credits
            var credits = carbonCreditRepository.findByUser(user);
            carbonCreditRepository.deleteAll(credits);
            log.info("Deleted {} carbon credits for user {}", credits.size(), id);
            
            // 5. Delete all CO2 transfer requests
            var transferRequests = co2TransferRequestRepository.findByUser(user);
            co2TransferRequestRepository.deleteAll(transferRequests);
            log.info("Deleted {} CO2 transfer requests for user {}", transferRequests.size(), id);
            
            // 6. Delete all journeys (must be before vehicles due to foreign key)
            var journeys = journeyDataRepository.findByUser(user);
            journeyDataRepository.deleteAll(journeys);
            log.info("Deleted {} journeys for user {}", journeys.size(), id);
            
            // 7. Delete all vehicles
            var vehicles = vehicleRepository.findByUser(user);
            vehicleRepository.deleteAll(vehicles);
            log.info("Deleted {} vehicles for user {}", vehicles.size(), id);
            
            // 8. Delete wallet
            walletRepository.findByUserId(id).ifPresent(wallet -> {
                walletRepository.delete(wallet);
                log.info("Deleted wallet for user {}", id);
            });
            
            // 9. Finally delete the user
            userRepository.deleteById(id);
            log.info("Successfully deleted user {} and all related data", id);
            
        } catch (Exception e) {
            log.error("Error during cascade delete for user {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete user and related data: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmailOrPhone(String input) {
        return userRepository.findByEmailOrPhone(input);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByUsernameOrEmail(usernameOrEmail);
    }

    // Simple login method using plain text password
    public boolean authenticateUser(String username, String password) {
        Optional<User> user = findByUsername(username);
        if (user.isPresent()) {
            // First try simple password comparison
            if (user.get().getPassword() != null && user.get().getPassword().equals(password)) {
                return true;
            }
            // Fallback to BCrypt if using password_hash
            if (user.get().getPasswordHash() != null
                    && passwordEncoder.matches(password, user.get().getPasswordHash())) {
                return true;
            }
        }
        return false;
    }

    // Method to create user with simple password
    public User createUserWithSimplePassword(String username, String email, String password,
                                             String fullName, String phone, User.UserRole role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password); // Store as plain text
        user.setPasswordHash(passwordEncoder.encode(password)); // Also store hashed version
        user.setFullName(fullName);
        user.setPhone(phone);
        user.setRole(role);

        return createUser(user);
    }

    public User updateUser(UUID id, User userDetails) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        // validate username/email/phone uniqueness if changed
        if (userDetails.getUsername() != null && !userDetails.getUsername().equals(existing.getUsername())
                && userRepository.existsByUsername(userDetails.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + userDetails.getUsername());
        }

        if (userDetails.getEmail() != null && !userDetails.getEmail().equals(existing.getEmail())
                && userRepository.existsByEmail(userDetails.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userDetails.getEmail());
        }
        if (userDetails.getPhone() != null && !userDetails.getPhone().equals(existing.getPhone())
                && userRepository.existsByPhone(userDetails.getPhone())) {
            throw new IllegalArgumentException("Phone already exists: " + userDetails.getPhone());
        }

        // merge allowed fields
        if (userDetails.getUsername() != null)
            existing.setUsername(userDetails.getUsername());
        if (userDetails.getEmail() != null)
            existing.setEmail(userDetails.getEmail());
        if (userDetails.getFullName() != null)
            existing.setFullName(userDetails.getFullName());
        if (userDetails.getPhone() != null)
            existing.setPhone(userDetails.getPhone());
        if (userDetails.getRole() != null)
            existing.setRole(userDetails.getRole());

        //handle password update
        if(userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            existing.setPassword(userDetails.getPassword());
            existing.setPasswordHash(passwordEncoder.encode(userDetails.getPassword()));
        }

        User savedUser = userRepository.save(existing);

        // 3. Gửi thông báo Account Updated
        notificationService.notifyAccountUpdated(savedUser);

        return savedUser;
    }

    public void debugPrintUser(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            log.info("🔍 DEBUG User: {}", username);
            log.info("   - ID: {}", user.getId());
            log.info("   - Email: {}", user.getEmail());
            log.info("   - Role: {}", user.getRole());
            log.info("   - Password Hash Exists: {}", user.getPasswordHash() != null);
            log.info("   - Password Hash Length: {}", user.getPasswordHash() != null ? user.getPasswordHash().length() : 0);
            log.info("   - Password Hash Starts With: {}", user.getPasswordHash() != null ? user.getPasswordHash().substring(0, 7) : "null");
        } else {
            log.info("🔍 DEBUG User NOT found: {}", username);
        }
    }

    public UserDetails loadUserByUsername(String username) {
        Optional<User> userOpt = findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found: " + username);
        }
        return (UserDetails) userOpt.get(); // Cast này có thể gây lỗi nếu User không implements UserDetails
    }
}