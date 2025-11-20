package com.carboncredit.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {
    private UUID walletId;
    private UUID userId;
    private String username;
    private String fullName;
    private BigDecimal creditBalance;
    private BigDecimal cashBalance;
    private BigDecimal co2ReducedKg;
    private BigDecimal co2PendingTransfer; // Add field for CO2 locked in transfer requests
    private LocalDateTime lastUpdated;
}
