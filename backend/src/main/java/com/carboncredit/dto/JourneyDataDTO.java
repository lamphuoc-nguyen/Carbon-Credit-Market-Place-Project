package com.carboncredit.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.carboncredit.entity.JourneyData;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JourneyDataDTO {
    private UUID id;
    private UserDTO user;
    private UUID vehicleId;
    private String startLocation;
    private String endLocation;
    private BigDecimal distanceKm;
    private BigDecimal energyConsumedKwh;
    private BigDecimal co2ReducedKg;
    private LocalDateTime createdAt;
    private boolean hasCarbonCredit;
    private UUID carbonCreditId;
    private LocalDateTime journeyDate;

    private String verificationStatus;
    private UUID verifiedById;
    private String verifiedByUsername;
    private LocalDateTime verificationDate;
    private String verificationNotes;
    private String rejectionReason;

    public JourneyDataDTO(JourneyData journey) {
        this.id = journey.getId();
        this.user = journey.getUser() != null ? new UserDTO(journey.getUser()) : null;
        this.vehicleId = journey.getVehicle() != null ? journey.getVehicle().getId() : null;
        this.startLocation = journey.getStartLocation();
        this.endLocation = journey.getEndLocation();
        this.distanceKm = journey.getDistanceKm();
        this.energyConsumedKwh = journey.getEnergyConsumedKwh();
        this.co2ReducedKg = journey.getCo2ReducedKg();
        this.createdAt = journey.getCreatedAt();
        this.journeyDate = journey.getJourneyDate();
        this.hasCarbonCredit = journey.getCarbonCredit() != null;
        this.carbonCreditId = journey.getCarbonCredit() != null ? journey.getCarbonCredit().getId() : null;
        this.verificationStatus = journey.getVerificationStatus() != null
                ? journey.getVerificationStatus().name()
                : null;

        this.verifiedById = journey.getVerifiedBy() != null
                ? journey.getVerifiedBy().getId()
                : null;

        this.verifiedByUsername = journey.getVerifiedBy() != null
                ? journey.getVerifiedBy().getUsername()
                : null;

        this.verificationDate = journey.getVerificationDate();
        this.verificationNotes = journey.getVerificationNotes();
        this.rejectionReason = journey.getRejectionReason();
    }

}
