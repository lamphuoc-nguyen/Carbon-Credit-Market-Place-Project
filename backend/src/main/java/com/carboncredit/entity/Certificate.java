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
@Table(name = "certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {
    @Id
    @GeneratedValue
    @Column(name = "certificate_id")
    private UUID id;

    @Column(name = "certificate_code", unique = true, nullable = false, length = 50)
    private String certificateCode;

    // --- Liên kết với Buyer ---
    // User này phải có role = BUYER (kiểm tra ở Service)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    // --- Mối quan hệ chính với Giao dịch Loại bỏ ---
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "retirement_transaction_id", nullable = false)
    private RetirementTransaction retirementTransaction;

    // --- DỮ LIỆU SNAPSHOT (CỰC KỲ QUAN TRỌNG) ---
    @Column(name = "buyer_name_snapshot", nullable = false)
    private String buyerNameSnapshot;

    @Column(name = "buyer_email_snapshot", nullable = false)
    private String buyerEmailSnapshot;

    @Column(name = "amount_retired_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountRetiredKg;

    @Column(name = "co2_reduced_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal co2ReducedKg;

    @Column(name = "project_source_info", nullable = false, length = 500)
    private String projectSourceInfo;

    @Column(name = "retirement_date", nullable = false)
    private LocalDate retirementDate;

    // --- NEW: Issue date (explicit field for certificate issuance) ---
    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    // --- Thông tin Quản lý và Trạng thái ---
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private CertificateStatus status;

    @Column(name = "pdf_url", length = 1024)
    private String pdfUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum CertificateStatus {
        PENDING_GENERATION, COMPLETED, FAILED_GENERATION
    }
}