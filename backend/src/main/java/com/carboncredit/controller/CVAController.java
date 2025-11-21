package com.carboncredit.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carboncredit.dto.ApiResponse;
import com.carboncredit.dto.Co2TransferRequestDTO;
import com.carboncredit.dto.JourneyDataDTO;
import com.carboncredit.dto.CarbonCreditDTO;
import com.carboncredit.entity.CarbonCredit;
import com.carboncredit.entity.JourneyData;
import com.carboncredit.entity.User;
import com.carboncredit.exception.ResourceNotFoundException;
import com.carboncredit.repository.CarbonCreditRepository;
import com.carboncredit.service.CVAService;
import com.carboncredit.service.UserService;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;


/**
 * CVAController - Carbon Verification Authority REST API
 *
 * Endpoints for CVA users to:
 * - Review pending journeys
 * - Approve journeys and issue credits
 * - Reject journeys with reasons
 * - View verification statistics
 *
 * All endpoints require CVA role authentication
 */

@Slf4j
@RestController
@RequestMapping("/api/cva")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CVAController {

    private final CVAService cvaService;
    private final UserService userService;
    private final CarbonCreditRepository carbonCreditRepository;

    /**
     * Get all pending journey for CVA reviews
     */

    @GetMapping("/pending-journeys")
    @PreAuthorize("hasRole('CVA')")
    public ResponseEntity<ApiResponse<List<JourneyDataDTO>>> getPendingJourneys() {
        try {
            List<JourneyData> pendingJourneys = cvaService.getPendingJourneyForVerification();
            List<JourneyDataDTO> dtos = pendingJourneys.stream().map(JourneyDataDTO::new).collect(Collectors.toList());

            log.info("Retrieved {}  pending journeys for CVA review", dtos.size());

            return ResponseEntity.ok(ApiResponse.success(dtos));
        } catch (Exception e) {
            log.error("Error fetching pending journeys: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch pending journeys: " + e.getMessage()));
        }
    }

    /**
     * Get specific journey for review
     *
     */
    @GetMapping("/journey/{id}")
    @PreAuthorize("hasRole('CVA')")
    public ResponseEntity<ApiResponse<JourneyDataDTO>> getJourneyForReview(@PathVariable UUID id) {
        try {
            JourneyData journey = cvaService.getJourneyDataForView(id);
            return ResponseEntity.ok(ApiResponse.success(new JourneyDataDTO(journey)));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(ApiResponse.error("Journey not found: " + id));
        } catch (Exception e) {
            log.error("Error fetching journey {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch journey: " + e.getMessage()));
        }
    }

    /**
     * Approve journey and carbon credit
     */
    @PostMapping("/journey/{id}/approve")
    @PreAuthorize("hasRole('CVA')")
    public ResponseEntity<ApiResponse<JourneyDataDTO>> approveJourney(
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "Approved by CVA") String notes,
            Authentication authentication) {
        try {
            User cva = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("CVA user not found"));

            JourneyData approvedJourney = cvaService.approveJourneyByCVA(id, cva, notes);

            log.info("CVA {} approved journey {}", cva.getUsername(), id);

            return ResponseEntity.ok(ApiResponse.success(
                    "Journey verified successfully. CO2 reduction added to owner's wallet.",
                    new JourneyDataDTO(approvedJourney)));

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error("Journey not found: " + id));
        } catch (Exception e) {
            log.error("Error approving journey {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to approve journey: " + e.getMessage()));
        }
    }

    /**
     * Reject journey with a reason
     */
    @PostMapping("/journey/{id}/reject")
    @PreAuthorize("hasRole('CVA')")
    public ResponseEntity<ApiResponse<JourneyDataDTO>> rejectJourney(@PathVariable UUID id, @RequestParam @NotBlank(message = "Rejection reason is required") String reason, Authentication authentication) {
        try {
            User cva = userService.findByUsername(authentication.getName()).orElseThrow(() -> new ResourceNotFoundException("CVA user not found"));

            JourneyData rejectedJourney = cvaService.rejectJourneyByCVA(id, cva, reason);

            log.warn("CVA {} rejected journey {}. Reason: {}", cva.getUsername(), id, reason);

            return ResponseEntity.ok(ApiResponse.success("Journey rejected. Reason: " + reason, new JourneyDataDTO(rejectedJourney)));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(ApiResponse.error("Journey not found: " + id));
        } catch (Exception e) {
            log.error("error rejecting journey {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to reject journey: " + e.getMessage()));
        }

    }


    /**
     * Get verification statistic
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('CVA')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCVAStatistics(Authentication authentication) {
        try {
            User cva = userService.findByUsername(authentication.getName()).orElseThrow(() -> new ResourceNotFoundException("CVA user not found exception"));

            Map<String, Object> stats = cvaService.getCVAStatistics(cva);

            return ResponseEntity.ok(ApiResponse.success("CVA Statistics", stats));
        } catch (Exception e) {
            log.error("Error fetching CVA statistics: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch statistics: " + e.getMessage()));
        }
    }

    // ================== CO2 TRANSFER REQUEST ENDPOINTS ==================

    /**
     * Get all pending CO2 transfer requests for CVA review
     */
    @GetMapping("/pending-transfer-requests")
    @PreAuthorize("hasRole('CVA')")
    public ResponseEntity<ApiResponse<List<Co2TransferRequestDTO>>> getPendingTransferRequests() {
        try {
            List<Co2TransferRequestDTO> pendingRequests = cvaService.getPendingTransferRequests();

            log.info("Retrieved {} pending transfer requests for CVA review", pendingRequests.size());

            return ResponseEntity.ok(ApiResponse.success(pendingRequests));
        } catch (Exception e) {
            log.error("Error fetching pending transfer requests: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch pending transfer requests: " + e.getMessage()));
        }
    }

    /**
     * Approve a CO2 to credit transfer request
     */
    @PostMapping("/transfer-request/{requestId}/approve")
    @PreAuthorize("hasRole('CVA')")
    public ResponseEntity<ApiResponse<Co2TransferRequestDTO>> approveTransferRequest(
            @PathVariable UUID requestId,
            @RequestParam(required = false, defaultValue = "Approved by CVA") String notes,
            Authentication authentication) {
        try {
            User cva = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("CVA user not found"));

            Co2TransferRequestDTO approvedRequest = cvaService.approveTransferRequest(requestId, cva, notes);

            log.info("CVA {} approved transfer request {}", cva.getUsername(), requestId);

            return ResponseEntity.ok(ApiResponse.success(
                    "Transfer request approved successfully. Credits added to user's wallet.",
                    approvedRequest));

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error("Transfer request not found: " + requestId));
        } catch (Exception e) {
            log.error("Error approving transfer request {}: {}", requestId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to approve transfer request: " + e.getMessage()));
        }
    }

    /**
     * Reject a CO2 to credit transfer request with refund
     */
    @PostMapping("/transfer-request/{requestId}/reject")
    @PreAuthorize("hasRole('CVA')")
    public ResponseEntity<ApiResponse<Co2TransferRequestDTO>> rejectTransferRequest(
            @PathVariable UUID requestId,
            @RequestParam @NotBlank(message = "Rejection reason is required") String reason,
            Authentication authentication) {
        try {
            User cva = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("CVA user not found"));

            Co2TransferRequestDTO rejectedRequest = cvaService.rejectTransferRequest(requestId, cva, reason);

            log.warn("CVA {} rejected transfer request {}. Reason: {}", cva.getUsername(), requestId, reason);

            return ResponseEntity.ok(ApiResponse.success(
                    "Transfer request rejected. CO2 refunded to user's wallet. Reason: " + reason,
                    rejectedRequest));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error("Transfer request not found: " + requestId));
        } catch (Exception e) {
            log.error("Error rejecting transfer request {}: {}", requestId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to reject transfer request: " + e.getMessage()));
        }
    }

    /**
     * Get transfer request statistics for CVA dashboard
     */
    @GetMapping("/transfer-statistics")
    @PreAuthorize("hasRole('CVA')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTransferRequestStatistics(Authentication authentication) {
        try {
            User cva = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("CVA user not found"));

            Map<String, Object> stats = cvaService.getTransferRequestStats();
            Map<String, Object> cvaStats = cvaService.getCVATransferStats(cva);

            // Combine both statistics
            stats.putAll(cvaStats);

            log.info("Retrieved transfer request statistics for CVA {}", cva.getUsername());

            return ResponseEntity.ok(ApiResponse.success("Transfer request statistics", stats));
        } catch (Exception e) {
            log.error("Error fetching transfer request statistics: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch transfer statistics: " + e.getMessage()));
        }
    }

    /**
     * Get all verifications done by the current CVA user
     */
    @GetMapping("/my-verifications")
    @PreAuthorize("hasRole('CVA')")
    public ResponseEntity<ApiResponse<List<JourneyDataDTO>>> getMyVerifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            User cva = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("CVA user not found"));

            List<JourneyData> verifiedJourneys = cvaService.getJourneysVerifiedByCVA(cva, page, size);
            List<JourneyDataDTO> dtos = verifiedJourneys.stream()
                    .map(JourneyDataDTO::new)
                    .collect(Collectors.toList());

            log.info("Retrieved {} verified journeys for CVA {}", dtos.size(), cva.getUsername());

            return ResponseEntity.ok(ApiResponse.success(
                    "Verified journeys retrieved successfully",
                    dtos));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error("CVA user not found"));
        } catch (Exception e) {
            log.error("Error fetching verified journeys: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch verified journeys: " + e.getMessage()));
        }
    }

    /**
     * Get all verified carbon credits
     */
    @GetMapping("/verified-credits")
    @PreAuthorize("hasRole('CVA')")
    public ResponseEntity<ApiResponse<List<CarbonCreditDTO>>> getVerifiedCredits() {
        try {
            List<CarbonCredit> verifiedCredits = carbonCreditRepository.findByStatus(CarbonCredit.CreditStatus.VERIFIED);
            List<CarbonCreditDTO> dtos = verifiedCredits.stream()
                    .map(credit -> new CarbonCreditDTO(credit, true))
                    .collect(Collectors.toList());

            log.info("Retrieved {} verified credits for CVA review", dtos.size());

            return ResponseEntity.ok(ApiResponse.success(
                    "Verified credits retrieved successfully",
                    dtos));
        } catch (Exception e) {
            log.error("Error fetching verified credits: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch verified credits: " + e.getMessage()));
        }
    }
}
