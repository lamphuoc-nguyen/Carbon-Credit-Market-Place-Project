package com.carboncredit.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carboncredit.dto.Co2TransferRequestDTO;
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
    private final Co2TransferService co2TransferService;

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
     * Get journeys verified by a specific CVA with pagination
     *
     * @param cva CVA user
     * @param page page number
     * @param size page size
     * @return List of journeys verified by this CVA
     */
    @Transactional(readOnly = true)
    public List<JourneyData> getJourneysVerifiedByCVA(User cva, int page, int size) {
        List<JourneyData> allVerifications = journeyDataRepository.findByVerifiedBy(cva);

        // Simple pagination since repository doesn't have pageable method
        int start = page * size;
        int end = Math.min(start + size, allVerifications.size());

        if (start >= allVerifications.size()) {
            return new ArrayList<>();
        }

        return allVerifications.subList(start, end);
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

    // ================== CO2 TRANSFER REQUEST MANAGEMENT ==================

    /**
     * Get all pending transfer requests for CVA review
     */
    @Transactional(readOnly = true)
    public List<Co2TransferRequestDTO> getPendingTransferRequests() {
        return co2TransferService.getPendingTransferRequests();
    }

    /**
     * CVA approves a CO2 to credit transfer request
     */
    public Co2TransferRequestDTO approveTransferRequest(UUID requestId, User cva, String notes) {
        return co2TransferService.approveTransferRequest(requestId, cva, notes);
    }

    /**
     * CVA rejects a CO2 to credit transfer request with refund
     */
    public Co2TransferRequestDTO rejectTransferRequest(UUID requestId, User cva, String rejectionReason) {
        return co2TransferService.rejectTransferRequest(requestId, cva, rejectionReason);
    }

    /**
     * Get transfer request statistics for CVA dashboard
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getTransferRequestStats() {
        Map<String, Object> stats = new HashMap<>();

        var transferStats = co2TransferService.getTransferRequestStats(null);
        stats.put("pendingTransfers", transferStats.pending());
        stats.put("approvedTransfers", transferStats.approved());
        stats.put("rejectedTransfers", transferStats.rejected());
        stats.put("totalTransfers", transferStats.total());

        return stats;
    }

    /**
     * Get CVA's transfer processing statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCVATransferStats(User cva) {
        Map<String, Object> stats = new HashMap<>();

        var cvaStats = co2TransferService.getCVAStats(cva);
        stats.put("approvedTransfers", cvaStats.approved());
        stats.put("rejectedTransfers", cvaStats.rejected());
        stats.put("totalProcessedTransfers", cvaStats.totalProcessed());
        stats.put("transferApprovalRate", cvaStats.approvalRate());

        return stats;
    }

}
