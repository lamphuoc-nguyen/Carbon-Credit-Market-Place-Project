package com.carboncredit.service;

import com.carboncredit.entity.User;
import com.carboncredit.repository.CarbonCreditRepository;
import com.carboncredit.repository.Co2TransferRequestRepository;
import com.carboncredit.repository.CreditListingRepository;
import com.carboncredit.repository.JourneyDataRepository;
import com.carboncredit.repository.NotificationRepository;
import com.carboncredit.repository.TransactionRepository;
import com.carboncredit.repository.UserRepository;
import com.carboncredit.repository.VehicleRepository;
import com.carboncredit.repository.WalletRepository;
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

        validateNewUser(user);

        user.setPasswordHash(passwordEncoder.encode(user.getPassword()));
        user.setPassword(null);

        User savedUser = userRepository.save(user);
        walletService.createWalletForUser(savedUser);

        try {
            notificationService.notifyWelcome(savedUser);
        } catch (Exception e) {
            log.warn("Failed to send welcome notification for user {}", savedUser.getId(), e);
        }

        return savedUser;
    }

    private void validateNewUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + user.getUsername());
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        if (user.getPhone() != null && !user.getPhone().trim().isEmpty()
                && userRepository.existsByPhone(user.getPhone())) {
            throw new IllegalArgumentException("Phone number already exists: " + user.getPhone());
        }
        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone is required");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
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
    public Optional<User> findByEmailOrPhone(String input) {
        return userRepository.findByEmailOrPhone(input);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByUsernameOrEmail(usernameOrEmail);
    }

    @Transactional(readOnly = true)
    public List<User> findByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }

    public User updateUser(User user) {
        user.setPassword(null);
        return userRepository.save(user);
    }

    public void deleteUser(UUID id) {
        log.info("Starting cascade delete for user ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        try {
            var notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(id);
            notificationRepository.deleteAll(notifications);

            try {
                var transactionsAsBuyer = transactionRepository.findByBuyerOrSellerOrderByCreatedAtDesc(user, user);
                transactionRepository.deleteAll(transactionsAsBuyer);
            } catch (Exception e) {
                log.warn("Failed to delete transactions for user {}: {}", id, e.getMessage());
            }

            creditListingRepository.deleteAll(creditListingRepository.findByUser(user));
            carbonCreditRepository.deleteAll(carbonCreditRepository.findByUser(user));
            co2TransferRequestRepository.deleteAll(co2TransferRequestRepository.findByUser(user));
            journeyDataRepository.deleteAll(journeyDataRepository.findByUser(user));
            vehicleRepository.deleteAll(vehicleRepository.findByUser(user));
            walletRepository.findByUserId(id).ifPresent(walletRepository::delete);
            userRepository.deleteById(id);
        } catch (Exception e) {
            log.error("Error during cascade delete for user {}", id, e);
            throw new IllegalStateException("Failed to delete user and related data", e);
        }
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public boolean authenticateUser(String username, String password) {
        return findByUsernameOrEmail(username)
                .filter(user -> user.getPasswordHash() != null)
                .map(user -> passwordEncoder.matches(password, user.getPasswordHash()))
                .orElse(false);
    }

    public User createUserWithSimplePassword(String username, String email, String password,
                                             String fullName, String phone, User.UserRole role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        user.setFullName(fullName);
        user.setPhone(phone);
        user.setRole(role);
        return createUser(user);
    }

    public User updateUser(UUID id, User userDetails) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

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

        if (userDetails.getUsername() != null) {
            existing.setUsername(userDetails.getUsername());
        }
        if (userDetails.getEmail() != null) {
            existing.setEmail(userDetails.getEmail());
        }
        if (userDetails.getFullName() != null) {
            existing.setFullName(userDetails.getFullName());
        }
        if (userDetails.getPhone() != null) {
            existing.setPhone(userDetails.getPhone());
        }
        if (userDetails.getRole() != null) {
            existing.setRole(userDetails.getRole());
        }
        if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
            existing.setPasswordHash(passwordEncoder.encode(userDetails.getPassword()));
        }
        existing.setPassword(null);

        User savedUser = userRepository.save(existing);
        notificationService.notifyAccountUpdated(savedUser);
        return savedUser;
    }

    public UserDetails loadUserByUsername(String username) {
        User user = findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();
    }
}
