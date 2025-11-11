package com.carboncredit.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carboncredit.entity.Wallet;
import com.carboncredit.entity.User;
import com.carboncredit.entity.CarbonCredit;
import com.carboncredit.repository.WalletRepository;
import com.carboncredit.repository.CarbonCreditRepository;

import lombok.RequiredArgsConstructor;


import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class WalletService {
    private final WalletRepository walletRepository;
    private final CarbonCreditRepository carbonCreditRepository;

    public Wallet createWalletForUser(User user) {
        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setCreditBalance(BigDecimal.ZERO);
        wallet.setCashBalance(BigDecimal.ZERO);
        wallet.setCo2ReducedKg(BigDecimal.ZERO);
        return walletRepository.save(wallet);
    }

    @Transactional(readOnly = true)
    public Optional<Wallet> findByUserId(UUID userId) {
        return walletRepository.findByUserId(userId);
    }

    public Wallet getOrCreateWallet(User user) {
        return findByUserId(user.getId())
                .orElseGet(() -> createWalletForUser(user));
    }

    public Wallet updateCreditBalance(UUID userId, BigDecimal amount) {
        Wallet wallet = findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));

        if (amount.compareTo(BigDecimal.ZERO) < 0 &&
                wallet.getCreditBalance().add(amount).compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Insufficient credit balance");
        }

        wallet.setCreditBalance(wallet.getCreditBalance().add(amount));
        return walletRepository.save(wallet);
    }

    public Wallet updateCashBalance(UUID userId, BigDecimal amount) {
        Wallet wallet = findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));

        if (amount.compareTo(BigDecimal.ZERO) < 0 &&
                wallet.getCashBalance().add(amount).compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Insufficient cash balance");
        }

        wallet.setCashBalance(wallet.getCashBalance().add(amount));
        return walletRepository.save(wallet);
    }

    /** Get credit balance for a user */
    @Transactional(readOnly = true)
    public BigDecimal getCreditBalance(UUID userId) {
        Wallet wallet = findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));
        return wallet.getCreditBalance();
    }

    @Transactional(readOnly = true)
    public BigDecimal getCashBalance(UUID userId) {
        Wallet wallet = findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));
        return wallet.getCashBalance();
    }

    /** Update CO2 reduced amount in wallet */
    public Wallet updateCo2ReducedKg(UUID userId, BigDecimal amount) {
        Wallet wallet = findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));

        // Entity getter ensures we never get null
        BigDecimal currentCo2 = wallet.getCo2ReducedKg();

        if (amount.compareTo(BigDecimal.ZERO) < 0 &&
                currentCo2.add(amount).compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Insufficient CO2 reduction balance");
        }

        wallet.setCo2ReducedKg(currentCo2.add(amount));
        return walletRepository.save(wallet);
    }

    /** Get CO2 reduced balance for a user */
    @Transactional(readOnly = true)
    public BigDecimal getCo2ReducedKg(UUID userId) {
        Wallet wallet = findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));

        // Entity getter ensures we never get null
        return wallet.getCo2ReducedKg();
    }

    /** Convert CO2 reduction to credits (1000kg CO2 = 1 credit) and create CarbonCredit entities */
    public Wallet convertCo2ToCredits(UUID userId, BigDecimal co2Amount) {
        if (co2Amount.compareTo(new BigDecimal("1000")) < 0) {
            throw new IllegalArgumentException("Minimum 1000kg CO2 required for conversion to credits");
        }

        Wallet wallet = findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));

        // Entity getter ensures we never get null
        BigDecimal currentCo2 = wallet.getCo2ReducedKg();

        if (currentCo2.compareTo(co2Amount) < 0) {
            throw new IllegalArgumentException("Insufficient CO2 reduction balance");
        }

        // Calculate credits: 1000kg CO2 = 1 credit
        BigDecimal creditsToAdd = co2Amount.divide(new BigDecimal("1000"), 6, java.math.RoundingMode.DOWN);
        BigDecimal co2ToDeduct = creditsToAdd.multiply(new BigDecimal("1000"));

        // Create individual CarbonCredit entities for marketplace
        for (int i = 0; i < creditsToAdd.intValue(); i++) {
            CarbonCredit credit = new CarbonCredit();
            credit.setUser(wallet.getUser());
            credit.setCo2ReducedKg(new BigDecimal("1000")); // Each credit represents 1000kg CO2
            credit.setCreditAmount(BigDecimal.ONE); // Each entity is 1 credit
            credit.setStatus(CarbonCredit.CreditStatus.VERIFIED); // Ready for marketplace
            credit.setCreatedAt(LocalDateTime.now());
            credit.setVerifiedAt(LocalDateTime.now());
            // No journey link - this credit comes from accumulated CO2 conversion

            carbonCreditRepository.save(credit);
        }

        // Update wallet balances
        wallet.setCo2ReducedKg(currentCo2.subtract(co2ToDeduct));
        wallet.setCreditBalance(wallet.getCreditBalance().add(creditsToAdd));

        return walletRepository.save(wallet);
    }
}
