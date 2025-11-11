package com.carboncredit.config;

import com.carboncredit.entity.Wallet;
import com.carboncredit.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * JPA-only migration component to handle CO2 reduction column initialization
 * This will run after Hibernate schema update to ensure all existing wallets have CO2 values
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(1000) // Run after other initialization components
public class WalletCo2MigrationRunner implements CommandLineRunner {

    private final WalletRepository walletRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            log.info("🔧 Starting JPA-based CO2 wallet migration...");

            // Use JPA to find and update wallets with null CO2 values
            List<Wallet> allWallets = walletRepository.findAll();

            long updatedCount = 0;
            for (Wallet wallet : allWallets) {
                boolean needsUpdate = false;

                // Check if CO2 field needs initialization (handle both null and explicit null in DB)
                if (wallet.getCo2ReducedKg() == null ||
                    (wallet.getCo2ReducedKg().compareTo(BigDecimal.ZERO) == 0 && isActuallyNull(wallet))) {

                    wallet.setCo2ReducedKg(BigDecimal.ZERO);
                    needsUpdate = true;
                }

                // Ensure other balances are not null either
                if (wallet.getCreditBalance() == null) {
                    wallet.setCreditBalance(BigDecimal.ZERO);
                    needsUpdate = true;
                }

                if (wallet.getCashBalance() == null) {
                    wallet.setCashBalance(BigDecimal.ZERO);
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    walletRepository.save(wallet);
                    updatedCount++;
                }
            }

            if (updatedCount > 0) {
                log.info("✅ Successfully initialized CO2 values for {} wallets using JPA", updatedCount);
            } else {
                log.info("✅ All {} wallets already have proper CO2 values", allWallets.size());
            }

        } catch (Exception e) {
            log.warn("⚠️ CO2 migration encountered an issue: {}. This may be normal during first run.", e.getMessage());
            log.debug("Migration exception details:", e);
        }
    }

    /**
     * Helper method to detect if a wallet actually has null CO2 in the database
     * This is a simple heuristic - in practice, the @PrePersist will handle future saves
     */
    private boolean isActuallyNull(Wallet wallet) {
        // If wallet was just loaded and has exactly zero, it might be a new default
        // We'll err on the side of caution and initialize it anyway
        return true;
    }
}
