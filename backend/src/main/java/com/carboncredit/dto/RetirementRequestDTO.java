package com.carboncredit.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for retirement request from frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RetirementRequestDTO {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Amount to retire is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amountToRetireKg;

    // Optional: specific project information for certificate
    private String projectInfo;

    // Optional: custom retirement reason/purpose
    private String retirementPurpose;
}
