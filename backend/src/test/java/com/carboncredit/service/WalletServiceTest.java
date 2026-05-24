package com.carboncredit.service;

import com.carboncredit.entity.User;
import com.carboncredit.entity.Wallet;
import com.carboncredit.repository.CarbonCreditRepository;
import com.carboncredit.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock private WalletRepository walletRepository;
    @Mock private CarbonCreditRepository carbonCreditRepository;

    @InjectMocks
    private WalletService walletService;

    @Test
    void updateCashBalanceUsesLockedWalletAndRejectsNegativeBalance() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = wallet(userId);
        wallet.setCashBalance(new BigDecimal("50.00"));
        when(walletRepository.findByUserIdForUpdate(userId)).thenReturn(Optional.of(wallet));

        assertThrows(IllegalArgumentException.class,
                () -> walletService.updateCashBalance(userId, new BigDecimal("-60.00")));
    }

    @Test
    void updateCreditBalancePersistsNewBalance() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = wallet(userId);
        wallet.setCreditBalance(BigDecimal.ONE);
        when(walletRepository.findByUserIdForUpdate(userId)).thenReturn(Optional.of(wallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Wallet updated = walletService.updateCreditBalance(userId, new BigDecimal("2.50"));

        assertEquals(new BigDecimal("3.50"), updated.getCreditBalance());
        verify(walletRepository).save(wallet);
    }

    private Wallet wallet(UUID userId) {
        User user = new User();
        user.setId(userId);
        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setCreditBalance(BigDecimal.ZERO);
        wallet.setCashBalance(BigDecimal.ZERO);
        wallet.setCo2ReducedKg(BigDecimal.ZERO);
        wallet.setCo2PendingTransfer(BigDecimal.ZERO);
        return wallet;
    }
}
