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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private WalletService walletService;
    @Mock private NotificationService notificationService;
    @Mock private NotificationRepository notificationRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private JourneyDataRepository journeyDataRepository;
    @Mock private CreditListingRepository creditListingRepository;
    @Mock private CarbonCreditRepository carbonCreditRepository;
    @Mock private Co2TransferRequestRepository co2TransferRequestRepository;
    @Mock private WalletRepository walletRepository;
    @Mock private TransactionRepository transactionRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void createUserHashesPasswordAndClearsTransientPassword() {
        User user = validUser();
        when(passwordEncoder.encode("secret")).thenReturn("hashed-secret");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.createUser(user);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertNull(captor.getValue().getPassword());
        assertTrue(captor.getValue().getPasswordHash().equals("hashed-secret"));
    }

    @Test
    void authenticateUserUsesPasswordHashOnly() {
        User user = validUser();
        user.setPassword(null);
        user.setPasswordHash("hashed-secret");
        when(userRepository.findByUsernameOrEmail("alice")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "hashed-secret")).thenReturn(true);

        assertTrue(userService.authenticateUser("alice", "secret"));
        assertFalse(userService.authenticateUser("alice", "wrong"));
    }

    private User validUser() {
        User user = new User();
        user.setUsername("alice");
        user.setEmail("alice@example.com");
        user.setPassword("secret");
        user.setFullName("Alice Example");
        user.setPhone("0123456789");
        user.setRole(User.UserRole.BUYER);
        return user;
    }
}
