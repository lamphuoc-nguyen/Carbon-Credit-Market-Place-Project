package com.carboncredit.test;

import com.carboncredit.entity.Wallet;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;

/**
 * Simple test to verify JPA CO2 migration behavior
 */
public class WalletCo2MigrationTest {

    @Test
    public void testCo2DefaultHandling() {
        // Test that entity handles null values correctly
        Wallet wallet = new Wallet();

        // Getter returns zero even when field is null
        assertEquals(BigDecimal.ZERO, wallet.getCo2ReducedKg());

        // Setting null gets converted to zero
        wallet.setCo2ReducedKg(null);
        assertEquals(BigDecimal.ZERO, wallet.getCo2ReducedKg());

        // Normal values work fine
        wallet.setCo2ReducedKg(new BigDecimal("100.50"));
        assertEquals(new BigDecimal("100.50"), wallet.getCo2ReducedKg());
    }

    @Test
    public void testWalletInitialization() {
        // Test that a new wallet has proper defaults
        Wallet wallet = new Wallet();

        // Custom getters should return zero
        assertEquals(BigDecimal.ZERO, wallet.getCo2ReducedKg());

        // After setting and getting, should work correctly
        wallet.setCo2ReducedKg(new BigDecimal("1000"));
        assertEquals(new BigDecimal("1000"), wallet.getCo2ReducedKg());

        // Setting back to null should become zero
        wallet.setCo2ReducedKg(null);
        assertEquals(BigDecimal.ZERO, wallet.getCo2ReducedKg());
    }
}

