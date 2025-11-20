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
@Table(name = "co2_transfer_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Co2TransferRequest {
    @Id
    @GeneratedValue
    @Column(name = "request_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "co2_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal co2Amount;

    @Column(name = "credits_to_generate", nullable = false, precision = 10, scale = 2)
    private BigDecimal creditsToGenerate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private TransferStatus status = TransferStatus.PENDING;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by_id")
    private User processedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "cva_notes", length = 1000)
    private String cvaNotes;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @ElementCollection
    @CollectionTable(
        name = "transfer_request_journeys",
        joinColumns = @JoinColumn(name = "request_id")
    )
    @Column(name = "journey_id")
    private List<UUID> journeyIds;

    public enum TransferStatus {
        PENDING,
        UNDER_REVIEW,
        APPROVED,
        REJECTED
    }
}
