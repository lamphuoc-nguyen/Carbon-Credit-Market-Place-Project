package com.carboncredit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Wallet {
    @Id
    @GeneratedValue
    @Column(name = "wallet_id")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Make nullable to allow Hibernate to add the column, then handle defaults in code
    @Column(name = "co2_reduced_kg", nullable = true, precision = 10, scale = 2)
    private BigDecimal co2ReducedKg;

    @Column(name = "credit_balance", precision = 10, scale = 2)
    private BigDecimal creditBalance = BigDecimal.ZERO;

    @Column(name = "cash_balance", precision = 10, scale = 2)
    private BigDecimal cashBalance = BigDecimal.ZERO;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // JPA lifecycle callback to ensure CO2 is never null
    @PrePersist
    @PreUpdate
    void ensureCo2NotNull() {
        if (this.co2ReducedKg == null) {
            this.co2ReducedKg = BigDecimal.ZERO;
        }
    }

    // Custom getter to ensure we never return null
    public BigDecimal getCo2ReducedKg() {
        return this.co2ReducedKg != null ? this.co2ReducedKg : BigDecimal.ZERO;
    }

    // Custom setter to ensure we never set null
    public void setCo2ReducedKg(BigDecimal co2ReducedKg) {
        this.co2ReducedKg = co2ReducedKg != null ? co2ReducedKg : BigDecimal.ZERO;
    }
}
