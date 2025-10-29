package com.carboncredit.dto;

import com.carboncredit.entity.RetirementTransaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO for retirement response to frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RetirementResponseDTO {

    private UUID retirementId;
    private UUID userId;
    private String userUsername;
    private BigDecimal amountRetiredKg;
    private LocalDate retirementDate;
    private RetirementTransaction.RetirementStatus status;
    private List<UUID> retiredCarbonCreditIds;
    private Instant createdAt;

    // Certificate information (if available)
    private CertificateDTO certificate;

    // Success message
    private String message;

    // Constructor from RetirementTransaction entity
    public RetirementResponseDTO(RetirementTransaction retirement) {
        this.retirementId = retirement.getId();
        this.userId = retirement.getRetiringUser() != null ? retirement.getRetiringUser().getId() : null;
        this.userUsername = retirement.getRetiringUser() != null ? retirement.getRetiringUser().getUsername() : null;
        this.amountRetiredKg = retirement.getAmountRetiredKg();
        this.retirementDate = retirement.getRetirementDate();
        this.status = retirement.getStatus();
        this.retiredCarbonCreditIds = retirement.getRetiredCarbonCreditIds();
        this.createdAt = retirement.getCreatedAt();

        // Include certificate if available
        if (retirement.getCertificate() != null) {
            this.certificate = new CertificateDTO(retirement.getCertificate());
        }
    }

    // Constructor with custom message
    public RetirementResponseDTO(RetirementTransaction retirement, String message) {
        this(retirement);
        this.message = message;
    }
}
