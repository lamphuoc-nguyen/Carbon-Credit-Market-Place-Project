package com.carboncredit.dto;

import com.carboncredit.entity.Co2TransferRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Co2TransferRequestDTO {
    private UUID id;
    private UUID userId;
    private String username;
    private BigDecimal co2Amount;
    private BigDecimal creditsToGenerate;
    private Co2TransferRequest.TransferStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
    private String processedByUsername;
    private String cvaNotes;
    private String rejectionReason;
    private List<UUID> journeyIds;
}
