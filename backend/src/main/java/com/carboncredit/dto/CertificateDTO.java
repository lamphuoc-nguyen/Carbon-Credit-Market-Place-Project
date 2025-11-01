package com.carboncredit.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.carboncredit.entity.Certificate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificateDTO {
    private UUID id;
    private String certificateCode;
    private UUID buyerId;
    private String buyerUsername;
    private String buyerEmail;
    private UUID retirementTransactionId;
    private BigDecimal amountRetiredKg;
    private String projectSourceInfo;
    private LocalDate retirementDate;
    private LocalDate issueDate; // NEW
    private List<UUID> retiredCreditIds; // Fetched from RetirementTransaction
    private String status;
    private String pdfUrl;
    private Instant createdAt;

    // Constructor from Certificate entity
    public CertificateDTO(Certificate certificate) {
        this.id = certificate.getId();
        this.certificateCode = certificate.getCertificateCode();
        this.buyerId = certificate.getBuyer() != null ? certificate.getBuyer().getId() : null;
        this.buyerUsername = certificate.getBuyerNameSnapshot();
        this.buyerEmail = certificate.getBuyerEmailSnapshot();
        this.retirementTransactionId = certificate.getRetirementTransaction() != null ?
            certificate.getRetirementTransaction().getId() : null;
        this.amountRetiredKg = certificate.getAmountRetiredKg();
        this.projectSourceInfo = certificate.getProjectSourceInfo();
        this.retirementDate = certificate.getRetirementDate();
        this.issueDate = certificate.getIssueDate(); // NEW

        // Get credit IDs from RetirementTransaction (current data)
        this.retiredCreditIds = certificate.getRetirementTransaction() != null
            ? certificate.getRetirementTransaction().getRetiredCarbonCreditIds()
            : null;

        this.status = certificate.getStatus().name();
        this.pdfUrl = certificate.getPdfUrl();
        this.createdAt = certificate.getCreatedAt();
    }
}

