package com.carboncredit.service;

import com.carboncredit.dto.Co2TransferRequestDTO;
import com.carboncredit.dto.CreateTransferRequestDTO;
import com.carboncredit.entity.Co2TransferRequest;
import com.carboncredit.entity.JourneyData;
import com.carboncredit.entity.User;
import com.carboncredit.entity.Wallet;
import com.carboncredit.exception.BusinessOperationException;
import com.carboncredit.exception.InsufficientCreditsException;
import com.carboncredit.exception.ResourceNotFoundException;
import com.carboncredit.repository.Co2TransferRequestRepository;
import com.carboncredit.repository.JourneyDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class Co2TransferService {

    private final Co2TransferRequestRepository transferRequestRepository;
    private final JourneyDataRepository journeyDataRepository;
    private final WalletService walletService;
    private final CarbonCreditService carbonCreditService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    /**
     * Create a new transfer request from CO2 to credits
     * User must have at least 1000kg CO2 to create a transfer request
     */
    public Co2TransferRequestDTO createTransferRequest(User user, CreateTransferRequestDTO requestDTO) {
        log.info("Creating CO2 transfer request for user {} with amount {}", user.getId(), requestDTO.getCo2Amount());

        // Validate minimum CO2 amount
        BigDecimal minAmount = new BigDecimal("1000");
        if (requestDTO.getCo2Amount().compareTo(minAmount) < 0) {
            throw new BusinessOperationException("Minimum 1000kg CO2 required for transfer to credits");
        }

        // Check user's available CO2 balance
        Wallet wallet = walletService.getOrCreateWallet(user);
        BigDecimal availableCo2 = wallet.getAvailableCo2();

        if (availableCo2.compareTo(requestDTO.getCo2Amount()) < 0) {
            throw new InsufficientCreditsException("Insufficient CO2 balance. Available: " + availableCo2 + "kg, Requested: " + requestDTO.getCo2Amount() + "kg");
        }

        // Calculate credits to generate (1000kg CO2 = 1 credit)
        BigDecimal creditsToGenerate = requestDTO.getCo2Amount().divide(new BigDecimal("1000"), 6, RoundingMode.DOWN);

        // Find valid journeys for this request (optional feature)
        List<UUID> journeyIds = requestDTO.getJourneyIds() != null ? requestDTO.getJourneyIds() : new ArrayList<>();

        // Create transfer request
        Co2TransferRequest request = new Co2TransferRequest();
        request.setUser(user);
        request.setCo2Amount(requestDTO.getCo2Amount());
        request.setCreditsToGenerate(creditsToGenerate);
        request.setStatus(Co2TransferRequest.TransferStatus.PENDING);
        request.setJourneyIds(journeyIds);

        // Lock CO2 amount in wallet
        walletService.lockCo2ForTransfer(user.getId(), requestDTO.getCo2Amount());

        Co2TransferRequest savedRequest = transferRequestRepository.save(request);

        log.info("Transfer request created with ID {} for {} kg CO2 -> {} credits",
                savedRequest.getId(), requestDTO.getCo2Amount(), creditsToGenerate);

        // Send notification for credit conversion requested
        notificationService.notifyCreditConversionRequested(user, savedRequest.getId().toString());

        return convertToDTO(savedRequest);
    }

    /**
     * Get all transfer requests for a user
     */
    @Transactional(readOnly = true)
    public List<Co2TransferRequestDTO> getUserTransferRequests(User user) {
        List<Co2TransferRequest> requests = transferRequestRepository.findByUser(user);
        return requests.stream().map(this::convertToDTO).toList();
    }

    /**
     * Get pending transfer requests for CVA review
     */
    @Transactional(readOnly = true)
    public List<Co2TransferRequestDTO> getPendingTransferRequests() {
        List<Co2TransferRequest> requests = transferRequestRepository.findPendingRequests();
        return requests.stream().map(this::convertToDTO).toList();
    }

    /**
     * CVA approves a transfer request
     */
    public Co2TransferRequestDTO approveTransferRequest(UUID requestId, User cva, String notes) {
        // Validate CVA role
        if (cva.getRole() != User.UserRole.CVA) {
            throw new BusinessOperationException("Only CVA users can approve transfer requests");
        }

        Co2TransferRequest request = transferRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer request not found"));

        if (request.getStatus() != Co2TransferRequest.TransferStatus.PENDING) {
            throw new BusinessOperationException("Transfer request must be in PENDING status. Current status: " + request.getStatus());
        }

        // Process the transfer
        walletService.processApprovedTransfer(request.getUser().getId(), request.getCo2Amount(), request.getCreditsToGenerate());

        // Update request status
        request.setStatus(Co2TransferRequest.TransferStatus.APPROVED);
        request.setProcessedBy(cva);
        request.setProcessedAt(LocalDateTime.now());
        request.setCvaNotes(notes);

        Co2TransferRequest savedRequest = transferRequestRepository.save(request);

        log.info("CVA {} approved transfer request {} for user {}",
                cva.getUsername(), requestId, request.getUser().getUsername());

        // Send notification for approved transfer request
        notificationService.notifyCreditConversionResult(request.getUser(), true, notes, requestId.toString());

        return convertToDTO(savedRequest);
    }

    /**
     * CVA rejects a transfer request and refunds CO2
     */
    public Co2TransferRequestDTO rejectTransferRequest(UUID requestId, User cva, String rejectionReason) {
        // Validate CVA role
        if (cva.getRole() != User.UserRole.CVA) {
            throw new BusinessOperationException("Only CVA users can reject transfer requests");
        }

        Co2TransferRequest request = transferRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer request not found"));

        if (request.getStatus() != Co2TransferRequest.TransferStatus.PENDING) {
            throw new BusinessOperationException("Transfer request must be in PENDING status. Current status: " + request.getStatus());
        }

        // Refund locked CO2 to user's available balance
        walletService.refundRejectedTransfer(request.getUser().getId(), request.getCo2Amount());

        // Update request status
        request.setStatus(Co2TransferRequest.TransferStatus.REJECTED);
        request.setProcessedBy(cva);
        request.setProcessedAt(LocalDateTime.now());
        request.setRejectionReason(rejectionReason);

        Co2TransferRequest savedRequest = transferRequestRepository.save(request);

        log.info("CVA {} rejected transfer request {} for user {}. Reason: {}",
                cva.getUsername(), requestId, request.getUser().getUsername(), rejectionReason);

        // Send notification for rejected transfer request
        notificationService.notifyCreditConversionResult(request.getUser(), false, rejectionReason, requestId.toString());

        return convertToDTO(savedRequest);
    }

    /**
     * Get transfer request statistics
     */
    @Transactional(readOnly = true)
    public TransferRequestStats getTransferRequestStats(User user) {
        long pending = transferRequestRepository.countByStatus(Co2TransferRequest.TransferStatus.PENDING);
        long approved = transferRequestRepository.countByStatus(Co2TransferRequest.TransferStatus.APPROVED);
        long rejected = transferRequestRepository.countByStatus(Co2TransferRequest.TransferStatus.REJECTED);

        return new TransferRequestStats(pending, approved, rejected, pending + approved + rejected);
    }

    /**
     * Get CVA's processing statistics
     */
    @Transactional(readOnly = true)
    public CVATransferStats getCVAStats(User cva) {
        long approvedByThisCVA = transferRequestRepository.countByProcessedByAndStatus(cva, Co2TransferRequest.TransferStatus.APPROVED);
        long rejectedByThisCVA = transferRequestRepository.countByProcessedByAndStatus(cva, Co2TransferRequest.TransferStatus.REJECTED);
        long totalProcessedByThisCVA = approvedByThisCVA + rejectedByThisCVA;

        double approvalRate = totalProcessedByThisCVA > 0 ?
            (double) approvedByThisCVA / totalProcessedByThisCVA * 100.0 : 0.0;

        return new CVATransferStats(approvedByThisCVA, rejectedByThisCVA, totalProcessedByThisCVA, approvalRate);
    }

    private Co2TransferRequestDTO convertToDTO(Co2TransferRequest request) {
        Co2TransferRequestDTO dto = new Co2TransferRequestDTO();
        dto.setId(request.getId());
        dto.setUserId(request.getUser().getId());
        dto.setUsername(request.getUser().getUsername());
        dto.setCo2Amount(request.getCo2Amount());
        dto.setCreditsToGenerate(request.getCreditsToGenerate());
        dto.setStatus(request.getStatus());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setProcessedAt(request.getProcessedAt());
        dto.setProcessedByUsername(request.getProcessedBy() != null ? request.getProcessedBy().getUsername() : null);
        dto.setCvaNotes(request.getCvaNotes());
        dto.setRejectionReason(request.getRejectionReason());
        dto.setJourneyIds(request.getJourneyIds());
        
        // Load journey details if journeyIds exist - using batch query to avoid N+1
        if (request.getJourneyIds() != null && !request.getJourneyIds().isEmpty()) {
            List<JourneyData> journeys = journeyDataRepository.findAllById(request.getJourneyIds());
            List<com.carboncredit.dto.JourneyDataDTO> journeyDetails = journeys.stream()
                    .map(com.carboncredit.dto.JourneyDataDTO::new)
                    .toList();
            dto.setJourneyDetails(journeyDetails);
        }
        
        return dto;
    }

    // Inner classes for statistics
    public record TransferRequestStats(long pending, long approved, long rejected, long total) {}
    public record CVATransferStats(long approved, long rejected, long totalProcessed, double approvalRate) {}
}
