package com.carboncredit.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carboncredit.entity.CarbonCredit;
import com.carboncredit.entity.JourneyData;
import com.carboncredit.entity.User;
import com.carboncredit.exception.BusinessOperationException;
import com.carboncredit.exception.ResourceNotFoundException;
import com.carboncredit.repository.CarbonCreditRepository;
import com.carboncredit.repository.JourneyDataRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CVAService {

    private final JourneyDataRepository journeyDataRepository;
    private final CarbonCreditRepository carbonCreditRepository;
    private final AuditService auditService;
    private final WalletService walletService;

    /**
     * Get all journeys pending CVA verification
     */
    @Transactional(readOnly = true)
    public List<JourneyData> getPendingJourneyForVerification() {
        List<JourneyData> pending = journeyDataRepository
                .findByVerificationStatus(JourneyData.VerificationStatus.PENDING_VERIFICATION);

        log.info("Found {} journeys pending verification", pending.size());
        return pending;
    }

    /**
     * Get a specific journey for CVA review
     */
    @Transactional(readOnly = true)
    public JourneyData getJourneyDataForView(UUID journeyId) {
        return journeyDataRepository.findById(journeyId)
                .orElseThrow(() -> new ResourceNotFoundException("Journey not found"));
    }

    /**
     * CVA approve a journey and adds CO2 reduction to wallet
     *
     * Workflow:
     * 1. Update journey status to Verified
     * 2. Add CO2 reduction to owner's wallet
     * 3. Log verification in audit trail
     *
     * Note: Carbon credits are NOT created here - only during CO2 conversion
     */
    public JourneyData approveJourneyByCVA(UUID journeyId, User cva, String notes) {
        // validate CVA role
        if (cva.getRole() != User.UserRole.CVA) {
            throw new BusinessOperationException("Only CVA users can verify journeys");
        }

        // Fetch journey
        JourneyData journey = journeyDataRepository.findById(journeyId)
                .orElseThrow(() -> new ResourceNotFoundException("Journey not found"));

        // validate journey status
        if (journey.getVerificationStatus() != JourneyData.VerificationStatus.PENDING_VERIFICATION) {
            throw new BusinessOperationException("Journey must be in PENDING_VERIFICATION status. Current status: "
                    + journey.getVerificationStatus());
        }

        // Get owner's current CO2 balance for audit
        BigDecimal co2Before = walletService.getCo2ReducedKg(journey.getUser().getId());

        // Update journey verification status
        journey.setVerificationStatus(JourneyData.VerificationStatus.VERIFIED);
        journey.setVerifiedBy(cva);
        journey.setVerificationDate(LocalDateTime.now());
        journey.setVerificationNotes(notes);
        journeyDataRepository.save(journey);

        // Add CO2 reduction to owner's wallet (NOT creating carbon credits yet)
        walletService.updateCo2ReducedKg(journey.getUser().getId(), journey.getCo2ReducedKg());
        BigDecimal co2After = walletService.getCo2ReducedKg(journey.getUser().getId());

        // Log verification in audit trail (using a simplified audit for CO2 addition)
        log.info("CVA {} approved journey {} - {} kg CO2 reduction added to {}",
                cva.getUsername(), journeyId, journey.getCo2ReducedKg(), journey.getUser().getUsername());


        return journey;
    }

    /**
     * CVA rejects a journey with a reason
     */

    public JourneyData rejectJourneyByCVA(UUID journeyId, User cva, String reason) {

        // validate CVA role
        if (cva.getRole() != User.UserRole.CVA) {
            throw new BusinessOperationException("Only CVA users can reject journeys");
        }

        // Fetch journey
        JourneyData journey = journeyDataRepository.findById(journeyId)
                .orElseThrow(() -> new ResourceNotFoundException("Journey not found"));

        // validate journey status
        if (journey.getVerificationStatus() != JourneyData.VerificationStatus.PENDING_VERIFICATION) {
            throw new BusinessOperationException(
                    "Journey must be in PENDING_VERIFICATION status. Current status: " +
                            journey.getVerificationStatus());
        }

        // Update journey status
        journey.setVerificationStatus(JourneyData.VerificationStatus.REJECTED);
        journey.setVerifiedBy(cva);
        journey.setVerificationDate(LocalDateTime.now());
        journey.setRejectionReason(reason);
        journeyDataRepository.save(journey);

        // No carbon credits to handle since they're only created during conversion
        // No CO2 is added to wallet for rejected journeys

        log.warn("CVA {} rejected journey {}. Reason: {}", cva.getUsername(), journeyId, reason);

        return journey;
    }

    /**
     * Get verification statistics for a CVA user
     *
     * @param cva CVA user
     * @return Map with statistics (totalVerified, totalRejected, pendingReview,
     *         etc.)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCVAStatistics(User cva) {
        Map<String, Object> stats = new HashMap<>();

        // Count journeys verified by this CVA
        long verified = journeyDataRepository.countByVerifiedByAndVerificationStatus(
                cva, JourneyData.VerificationStatus.VERIFIED);

        long rejected = journeyDataRepository.countByVerifiedByAndVerificationStatus(
                cva, JourneyData.VerificationStatus.REJECTED);

        // Count total pending (all CVAs)
        long pending = journeyDataRepository.countByVerificationStatus(
                JourneyData.VerificationStatus.PENDING_VERIFICATION);

        // Get recent journeys verified by this CVA
        List<JourneyData> recentVerifications = journeyDataRepository.findByVerifiedBy(cva);

        stats.put("cvaUsername", cva.getUsername());
        stats.put("totalVerified", verified);
        stats.put("totalRejected", rejected);
        stats.put("totalProcessed", verified + rejected);
        stats.put("pendingReview", pending);
        stats.put("recentVerifications", recentVerifications.size());
        stats.put("approvalRate", calculateApprovalRate(verified, rejected));

        log.info("CVA {} statistics: {} verified, {} rejected, {} pending",
                cva.getUsername(), verified, rejected, pending);

        return stats;
    }

    /**
     * Get journeys verified by a specific CVA
     *
     * @param cva CVA user
     * @return List of journeys verified by this CVA
     */
    @Transactional(readOnly = true)
    public List<JourneyData> getMyVerifications(User cva) {
        return journeyDataRepository.findByVerifiedBy(cva);
    }

    /**
     * Calculate approval rate percentage
     */
    private double calculateApprovalRate(long verified, long rejected) {
        long total = verified + rejected;
        if (total == 0)
            return 0.0;
        return (double) verified / total * 100.0;
    }

}
