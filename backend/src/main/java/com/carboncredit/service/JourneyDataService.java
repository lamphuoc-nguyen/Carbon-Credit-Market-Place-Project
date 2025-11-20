package com.carboncredit.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.carboncredit.dto.JourneyStatistics;
import com.carboncredit.dto.JourneyStatisticsWithCredits;
import com.carboncredit.entity.CarbonCredit;
import com.carboncredit.entity.JourneyData;
import com.carboncredit.entity.User;
import com.carboncredit.exception.BusinessOperationException;
import com.carboncredit.exception.UnauthorizedOperationException;
import com.carboncredit.repository.CarbonCreditRepository;
import com.carboncredit.repository.JourneyDataRepository;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class JourneyDataService {
    private final JourneyDataRepository journeyDataRepository;
    private final CarbonCreditService carbonCreditService;
    private final ValidationService validationService;
    private final CarbonCreditRepository carbonCreditRepository;
    private final AuditService auditService;

    private void validateJourneyData(JourneyData journeyData) {
        validationService.validateJourneyData(journeyData);
    }

    // Creatate and save new journey with validation
    public JourneyData createJourney(JourneyData journeyData) {
        log.info("Creating new journey for user {}", journeyData.getUser().getId());

        // Inpue validation
        validateJourneyData(journeyData);

        // Calculate CO2 reduction
        BigDecimal co2Reduced = carbonCreditService.calculateCO2Reduction(journeyData.getDistanceKm(),
                journeyData.getEnergyConsumedKwh());

        journeyData.setCo2ReducedKg(co2Reduced);

        // INITILA VERIFICATION STATUS
        journeyData.setVerificationStatus(JourneyData.VerificationStatus.PENDING_VERIFICATION);

        // Set creation time if not already set
        if (journeyData.getCreatedAt() == null) {
            journeyData.setCreatedAt(LocalDateTime.now());
        }

        JourneyData savedJourney = journeyDataRepository.save(journeyData);

        // Carbon credits are NO LONGER created here
        // They will only be created during CO2 to credit conversion (1000kg CO2 = 1 credit)

        log.info("Journey created with PENDING verification status - no carbon credit created yet");

        return savedJourney;

    }

    // Create and save new journey with auto-validation based on rules
    public JourneyData createJourneyWithAutoValidation(JourneyData journeyData) {
        log.info("Creating new journey with auto-validation for user {}", journeyData.getUser().getId());

        // Input validation
        validateJourneyData(journeyData);

        // Calculate CO2 reduction
        BigDecimal co2Reduced = carbonCreditService.calculateCO2Reduction(journeyData.getDistanceKm(),
                journeyData.getEnergyConsumedKwh());

        journeyData.setCo2ReducedKg(co2Reduced);

        // Auto-validation logic
        if (isJourneyValidForAutoApproval(journeyData)) {
            journeyData.setVerificationStatus(JourneyData.VerificationStatus.VALID);
            journeyData.setVerificationDate(LocalDateTime.now());
            journeyData.setVerificationNotes("Auto-validated based on system rules");
            log.info("Journey auto-validated for user {}", journeyData.getUser().getId());
        } else {
            journeyData.setVerificationStatus(JourneyData.VerificationStatus.PENDING_VERIFICATION);
            log.info("Journey requires manual CVA review for user {}", journeyData.getUser().getId());
        }

        // Set creation time if not already set
        if (journeyData.getCreatedAt() == null) {
            journeyData.setCreatedAt(LocalDateTime.now());
        }

        JourneyData savedJourney = journeyDataRepository.save(journeyData);

        log.info("Journey created with {} status", savedJourney.getVerificationStatus());

        return savedJourney;
    }

    // Find journey by ID with exception handling
    @Transactional(readOnly = true)
    public JourneyData findById(UUID journeyId) {
        return journeyDataRepository.findById(journeyId)
                .orElseThrow(
                        () -> new EntityNotFoundException("JourneyData not found with id: " + journeyId.toString()));
    }

    // Find all journeys by user
    @Transactional(readOnly = true)
    public List<JourneyData> findByUser(User user) {
        if (user == null) {
            throw new ValidationException("User cannot be null");
        }
        return journeyDataRepository.findByUser(user);
    }

    // find journeys by user wuith data range
    @Transactional(readOnly = true)
    public List<JourneyData> findByUserAndDateRange(User user, LocalDateTime startDate, LocalDateTime endDate) {
        if (user == null) {
            throw new ValidationException("User cannot be null");
        }
        if (startDate == null || endDate == null) {
            throw new ValidationException("Start and end dates cannot be null");
        }

        if (startDate.isAfter(endDate)) {
            throw new ValidationException("Start date cannot be after end date");

        }

        return journeyDataRepository.findByUserAndStartTimeBetween(user, startDate, endDate);
    }

    // get total co2 reduction by user
    @Transactional(readOnly = true)
    public BigDecimal getTotalCO2ReductionByUser(User user) {
        if (user == null) {
            throw new ValidationException("User cannot be null");
        }

        BigDecimal total = journeyDataRepository.getTotalCo2ReductionByUser(user);
        return total != null ? total : BigDecimal.ZERO;
    }

    // Find journeys without carbon credits
    @Transactional(readOnly = true)
    @Deprecated
    public List<JourneyData> findJourneyWithoutCredits() {
        // This method is deprecated since carbon credits are no longer linked to individual journeys
        // Instead, credits are created from accumulated CO2 during conversion
        // Return all verified journeys since they all contribute to CO2 accumulation
        return journeyDataRepository.findByVerificationStatus(JourneyData.VerificationStatus.VERIFIED);
    }

    // get all jourenys (admin function )
    @Transactional(readOnly = true)
    public List<JourneyData> findAll() {
        return journeyDataRepository.findAll();
    }

    // Update existing journey
    public JourneyData updateJourney(UUID journeyId, JourneyData updatedData, User requestingUser) {
        log.info("Updating journey {} by user {}", journeyId, requestingUser.getId());

        JourneyData existing = findById(journeyId);

        // check ownership
        if (!existing.getUser().getId().equals(requestingUser.getId())) {
            throw new UnauthorizedOperationException(
                    requestingUser.getId().toString(), "journeyData", journeyId.toString(), "update");
        }

        // Journey can be updated since carbon credits are only created during conversion
        // No need to check for carbon credit existence

        // validate updated data
        validateJourneyData(updatedData);

        // Update fields
        existing.setDistanceKm(updatedData.getDistanceKm());
        existing.setEnergyConsumedKwh(updatedData.getEnergyConsumedKwh());
        existing.setStartTime(updatedData.getStartTime());
        existing.setEndTime(updatedData.getEndTime());

        // Recalculate CO2 reductionn
        BigDecimal co2Reduced = carbonCreditService.calculateCO2Reduction(existing.getDistanceKm(),
                existing.getEnergyConsumedKwh());

        existing.setCo2ReducedKg(co2Reduced);

        JourneyData saved = journeyDataRepository.save(existing);
        log.info("Journey {} updated successfully", journeyId);

        return saved;

    }

    public void deleteJourney(UUID journeyId, User requestingUser) {
        log.info("Deleting journey {} by user {}", journeyId, requestingUser.getId());

        JourneyData journey = findById(journeyId);

        // Check ownership
        if (!journey.getUser().getId().equals(requestingUser.getId())) {
            throw new UnauthorizedOperationException(
                    requestingUser.getId().toString(), "JourneyData",
                    journeyId.toString(),
                    "delete");
        }

        // Journey can be deleted since carbon credits are only created during conversion
        // No need to check for carbon credit existence

        journeyDataRepository.delete(journey);
        log.info("Journey {} deleted successfully", journeyId);
    }

    // Get journey statistics for a user
    @Transactional(readOnly = true)
    public JourneyStatistics getJourneyStatistics(User user) {
        List<JourneyData> journeys = findByUser(user);

        if (journeys.isEmpty()) {
            return new JourneyStatistics(0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        BigDecimal totalDistance = journeys.stream().map(JourneyData::getDistanceKm).reduce(BigDecimal.ZERO,
                BigDecimal::add);

        BigDecimal totalEnergy = journeys.stream().map(JourneyData::getEnergyConsumedKwh).reduce(BigDecimal.ZERO,
                BigDecimal::add);

        BigDecimal totalCo2Reduced = journeys.stream().map(JourneyData::getCo2ReducedKg).reduce(BigDecimal.ZERO,
                BigDecimal::add);

        BigDecimal averageDistance = totalDistance.divide(BigDecimal.valueOf(journeys.size()), 2, RoundingMode.HALF_UP);

        return new JourneyStatistics(
                journeys.size(), totalDistance, totalEnergy, averageDistance, totalCo2Reduced);
    }

    @Transactional(readOnly = true)
    public List<JourneyData> findEligibleForCarbonCredits(User user) {
        // Since carbon credits are now only created during CO2 conversion,
        // this method is no longer needed but kept for compatibility
        return journeyDataRepository.findByUser(user).stream()
                .filter(journey -> journey.getCo2ReducedKg() != null)
                .filter(journey -> journey.getCo2ReducedKg().compareTo(BigDecimal.ZERO) > 0)
                .filter(journey -> journey.getVerificationStatus() == JourneyData.VerificationStatus.VERIFIED)
                .toList();
    }

    // Bulk create carbon credit for multiple journeys - DEPRECATED
    // Carbon credits are now only created during CO2 conversion, not per journey
    @Transactional
    @Deprecated
    public List<CarbonCredit> createCarbonCreditsForUser(User user) {
        // This method is deprecated and returns empty list
        // Carbon credits are now created during CO2 to credit conversion in WalletService
        log.warn("createCarbonCreditsForUser called but method is deprecated - use CO2 conversion instead");
        return new ArrayList<>();
    }

    // Get journey statistics including carbon credit information
    @Transactional(readOnly = true)
    public JourneyStatisticsWithCredits getDetailedJourneyStatistics(User user) {
        List<JourneyData> journeys = findByUser(user);

        if (journeys.isEmpty()) {
            return new JourneyStatisticsWithCredits(0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    0, 0, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        // Basic statistics
        BigDecimal totalDistance = journeys.stream().map(JourneyData::getDistanceKm).reduce(BigDecimal.ZERO,
                BigDecimal::add);

        BigDecimal totalEnergy = journeys.stream().map(JourneyData::getEnergyConsumedKwh).reduce(BigDecimal.ZERO,
                BigDecimal::add);

        BigDecimal totalCo2Reduced = journeys.stream()
                .map(JourneyData::getCo2ReducedKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageDistance = totalDistance.divide(BigDecimal.valueOf(journeys.size()), 2, RoundingMode.HALF_UP);

        // Carbon credit statistics - now based on CO2 conversion, not per journey
        // Since credits are created from accumulated CO2, we calculate differently
        int journeysWithCreditCount = 0; // No longer journey-specific
        int journeysWithoutCreditCount = journeys.size(); // All journeys contribute to CO2 pool

        BigDecimal totalCreditAmount = BigDecimal.ZERO; // Would need to query user's actual credits
        BigDecimal potentialCreditAmount = totalCo2Reduced.divide(new BigDecimal("1000"), 2, RoundingMode.DOWN);

        return new JourneyStatisticsWithCredits(journeys.size(), totalDistance, totalEnergy, averageDistance,
                totalCo2Reduced,
                journeysWithCreditCount, journeysWithoutCreditCount, totalCreditAmount, potentialCreditAmount);
    }

    public void deleteJourney(UUID journeyId) {
        JourneyData journey = findById(journeyId);

        // check if journey can be deleted (only pending / rejected journeys)
        if (journey.getVerificationStatus() == JourneyData.VerificationStatus.VERIFIED) {
            throw new BusinessOperationException("journeyData", "delete",
                    "Cannot delete verified journey. CO2 has been added to wallet");
        }

        // No associated carbon credit to delete since credits are only created during conversion

        journeyDataRepository.delete(journey);
        log.info("Journey {} deleted successfully", journeyId);
    }

    /**
     * Find journeys by verification status
     * Used by CVA to get pending journeys, and by admin to filter journeys
     */
    @Transactional(readOnly = true)
    public List<JourneyData> findByVerificationStatus(JourneyData.VerificationStatus status) {
        if (status == null) {
            throw new ValidationException("Verification status cannot be null");
        }
        return journeyDataRepository.findByVerificationStatus(status);
    }

    /**
     * Auto-validation logic for journeys
     * Determines if a journey can be auto-approved based on system rules
     */
    private boolean isJourneyValidForAutoApproval(JourneyData journeyData) {
        // Rule 1: Distance should be reasonable (between 1km and 500km per journey)
        BigDecimal distance = journeyData.getDistanceKm();
        if (distance.compareTo(new BigDecimal("1")) < 0 || distance.compareTo(new BigDecimal("500")) > 0) {
            log.warn("Journey distance outside auto-approval range: {} km", distance);
            return false;
        }

        // Rule 2: Energy consumption should be reasonable (0.1 to 50 kWh per km)
        BigDecimal energyPerKm = journeyData.getEnergyConsumedKwh().divide(distance, 4, RoundingMode.HALF_UP);
        if (energyPerKm.compareTo(new BigDecimal("0.1")) < 0 || energyPerKm.compareTo(new BigDecimal("50")) > 0) {
            log.warn("Journey energy consumption outside auto-approval range: {} kWh/km", energyPerKm);
            return false;
        }

        // Rule 3: CO2 reduction should be reasonable (not exceeding 1kg per km)
        BigDecimal co2PerKm = journeyData.getCo2ReducedKg().divide(distance, 4, RoundingMode.HALF_UP);
        if (co2PerKm.compareTo(new BigDecimal("1.0")) > 0) {
            log.warn("Journey CO2 reduction outside auto-approval range: {} kg/km", co2PerKm);
            return false;
        }

        // Rule 4: Journey should have realistic time data if provided
        if (journeyData.getStartTime() != null && journeyData.getEndTime() != null) {
            if (journeyData.getStartTime().isAfter(journeyData.getEndTime())) {
                log.warn("Journey start time after end time");
                return false;
            }

            // Journey should not be longer than 24 hours
            long hours = java.time.Duration.between(journeyData.getStartTime(), journeyData.getEndTime()).toHours();
            if (hours > 24) {
                log.warn("Journey duration too long: {} hours", hours);
                return false;
            }
        }

        // All validation rules passed - auto-approve
        log.info("Journey passed all auto-validation rules");
        return true;
    }
}
