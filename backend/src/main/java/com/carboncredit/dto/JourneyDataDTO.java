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
    private BigDecimal distanceKm;
    private BigDecimal energyConsumedKwh;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal co2ReducedKg;
    private LocalDateTime createdAt;
    private boolean hasCarbonCredit;
    private UUID carbonCreditId;


    private String verificationStatus; // NEW!
    private UUID verifiedById; // NEW!
    private String verifiedByUsername; // NEW!
    private LocalDateTime verificationDate; // NEW!
    private String verificationNotes; // NEW!
    private String rejectionReason; // NEW!

    public JourneyDataDTO(JourneyData journey) {
        this.id = journey.getId();
        this.user = journey.getUser() != null ? new UserDTO(journey.getUser()) : null;
        this.vehicleId = journey.getVehicle() != null ? journey.getVehicle().getId() : null;
        this.distanceKm = journey.getDistanceKm();
        this.energyConsumedKwh = journey.getEnergyConsumedKwh();
        this.startTime = journey.getStartTime();
        this.endTime = journey.getEndTime();
        this.co2ReducedKg = journey.getCo2ReducedKg();
        this.createdAt = journey.getCreatedAt();

        // Carbon credits are no longer linked to individual journeys
        this.hasCarbonCredit = false; // Credits are created from accumulated CO2 conversion
        this.carbonCreditId = null; // No direct journey-to-credit relationship

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
