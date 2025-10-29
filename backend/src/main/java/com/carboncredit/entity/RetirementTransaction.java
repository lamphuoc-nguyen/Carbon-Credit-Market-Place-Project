package com.carboncredit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "retirement_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetirementTransaction {
    @Id
    @GeneratedValue
    @Column(name = "retirement_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "retiring_user_id", nullable = false) // User thực hiện hành động retire
    private User retiringUser; // User này phải có role = BUYER

    @Column(name = "amount_retired_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountRetiredKg; // Tổng số lượng CO2e (kg) đã được retire

    @Column(name = "retirement_date", nullable = false)
    private LocalDate retirementDate; // Ngày Buyer chủ động retire

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RetirementStatus status; // PENDING, COMPLETED, FAILED

    // Mối quan hệ 1:1 với Certificate được tạo từ giao dịch này
    @OneToOne(mappedBy = "retirementTransaction", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    private Certificate certificate; // optional = true vì certificate có thể được tạo sau

    // Danh sách các ID của CarbonCredit đã bị loại bỏ trong giao dịch này
    @ElementCollection
    @CollectionTable(name = "retired_credit_details", joinColumns = @JoinColumn(name = "retirement_transaction_id"))
    @Column(name = "carbon_credit_id", columnDefinition = "UNIQUEIDENTIFIER")
    private List<UUID> retiredCarbonCreditIds;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum RetirementStatus {
        PENDING, COMPLETED, FAILED
    }
}