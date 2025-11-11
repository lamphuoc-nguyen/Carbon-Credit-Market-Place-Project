package com.carboncredit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "carbon_credits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CarbonCredit {
    @Id
    @GeneratedValue
    @Column(name = "credit_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Journey is now optional - credits from CO2 conversion won't have a specific journey
    @OneToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "journey_id")
    private JourneyData journey;

    @Column(name = "credit_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal creditAmount;

    @Column(name = "co2_reduced_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal co2ReducedKg;

    @Enumerated(EnumType.STRING)
    @Column(name = "status",nullable = false, length = 20)
    private CreditStatus status;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "listed_at")
    private LocalDateTime listedAt;

    // ⭐ ADD CVA VERIFIER FIELD
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_id")
    private User verifiedBy;

    @OneToMany(mappedBy = "credit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CreditListing> listings;

    @OneToMany(mappedBy = "credit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AuditLog> auditLogs;

    public enum CreditStatus {
        PENDING,   // Initial state (replaces UNVERIFIED)
        VERIFIED,  // CVA approved
        LISTED,    // Available for sale
        SOLD,      // Purchased
        REJECTED,   // CVA rejected
        RETIRED    //Use for credits that have been retired by buyers
    }
}
