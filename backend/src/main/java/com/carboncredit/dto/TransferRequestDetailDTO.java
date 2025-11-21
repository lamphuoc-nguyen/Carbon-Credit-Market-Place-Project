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
public class TransferRequestDetailDTO {
    private UUID id;
    private UUID userId;
    private String username;
    private String userEmail;
    private String userRole;
    private BigDecimal co2Amount;
    private BigDecimal creditsToGenerate;
    private Co2TransferRequest.TransferStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
    private String processedByUsername;
    private String cvaNotes;
    private String rejectionReason;

    // User wallet information
    private BigDecimal userCurrentCo2Balance;
    private BigDecimal userCurrentCreditBalance;

    // Journey details related to this transfer
    private List<JourneyDetailForTransferDTO> journeyDetails;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JourneyDetailForTransferDTO {
        private UUID journeyId;
        private String vehiclePlate;
        private String vehicleModel;
        private String vehicleType;
        private BigDecimal co2Reduced;
        private BigDecimal distance;
        private LocalDateTime journeyDate;
        private String verificationStatus;
        private String verifiedBy;
    }
}
