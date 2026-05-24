package com.carboncredit.controller;

import com.carboncredit.dto.CertificateDTO;
import com.carboncredit.dto.RetirementRequestDTO;
import com.carboncredit.dto.RetirementResponseDTO;
import com.carboncredit.entity.Certificate;
import com.carboncredit.entity.RetirementTransaction;
import com.carboncredit.exception.InsufficientCreditsException;
import com.carboncredit.exception.UserNotFoundException;
import com.carboncredit.repository.CertificateRepository;
import com.carboncredit.service.RetirementService;
import com.carboncredit.service.StorageService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST Controller for carbon credit retirement operations
 */
@RestController
@RequestMapping("/api/retirement")
@Slf4j
public class RetirementController {

    @Autowired
    private RetirementService retirementService;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private StorageService storageService;

    /**
     * Initiate carbon credit retirement
     * POST /api/retirement/initiate
     *
     * FIX: Pass the complete request object to service
     */
    @PostMapping("/initiate")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<?> initiateRetirement(@Valid @RequestBody RetirementRequestDTO request) {
        log.info("Initiating retirement for user: {} with amount: {} kg",
                request.getUserId(), request.getAmountToRetireKg());
        log.info("Project info: {}, Purpose: {}",
                request.getProjectInfo(), request.getRetirementPurpose());

        try {
            // FIX: Pass the complete request object instead of individual fields
            RetirementTransaction retirement = retirementService.initiateRetirement(request);

            RetirementResponseDTO response = new RetirementResponseDTO(
                    retirement,
                    "Retirement initiated successfully. Certificate generation in progress."
            );

            log.info("Retirement initiated successfully with ID: {}", retirement.getId());
            return ResponseEntity.ok(response);

        } catch (UserNotFoundException e) {
            log.error("User not found: {}", request.getUserId(), e);
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("User not found: " + e.getMessage()));

        } catch (InsufficientCreditsException e) {
            log.error("Insufficient credits for retirement: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Insufficient credits: " + e.getMessage()));

        } catch (Exception e) {
            log.error("Error initiating retirement", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get retirement transaction by ID
     * GET /api/retirement/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('BUYER') or hasRole('CVA') or hasRole('ADMIN')")
    public ResponseEntity<?> getRetirement(@PathVariable UUID id) {
        log.info("Fetching retirement transaction: {}", id);

        try {
            Optional<RetirementTransaction> retirement = retirementService.findById(id);

            if (retirement.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            RetirementResponseDTO response = new RetirementResponseDTO(retirement.get());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching retirement: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching retirement: " + e.getMessage()));
        }
    }

    /**
     * Get user's retirement history
     * GET /api/retirement/user/{userId}?page=0&size=10
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('BUYER') or hasRole('CVA') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserRetirements(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Fetching retirement history for user: {}", userId);

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<RetirementTransaction> retirements = retirementService.findByUserId(userId, pageable);

            List<RetirementResponseDTO> responseList = retirements.getContent().stream()
                    .map(RetirementResponseDTO::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new PagedResponse<>(
                    responseList,
                    retirements.getNumber(),
                    retirements.getSize(),
                    retirements.getTotalElements(),
                    retirements.getTotalPages(),
                    retirements.isLast()
            ));

        } catch (Exception e) {
            log.error("Error fetching user retirements: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching retirement history: " + e.getMessage()));
        }
    }

    /**
     * Get certificate by retirement ID
     * GET /api/retirement/{retirementId}/certificate
     */
    @GetMapping("/{retirementId}/certificate")
    @PreAuthorize("hasRole('BUYER') or hasRole('CVA') or hasRole('ADMIN')")
    public ResponseEntity<?> getCertificate(@PathVariable UUID retirementId) {
        log.info("Fetching certificate for retirement: {}", retirementId);

        try {
            Optional<Certificate> optCert = certificateRepository.findByRetirementTransactionId(retirementId);

            if (optCert.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Certificate cert = optCert.get();

            // Build DTO with pdfUrl
            CertificateDTO dto = new CertificateDTO(cert);

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            log.error("Error fetching certificate: {}", retirementId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to retrieve certificate: " + e.getMessage()));
        }
    }

    /**
     * Get all certificates for a user
     * GET /api/retirement/certificates/user/{userId}
     */
    @GetMapping("/certificates/user/{userId}")
    @PreAuthorize("hasRole('BUYER') or hasRole('CVA') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserCertificates(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Fetching certificates for user: {}", userId);

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Certificate> certificates = certificateRepository.findByBuyerId(userId, pageable);

            List<CertificateDTO> responseList = certificates.getContent().stream()
                    .map(CertificateDTO::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new PagedResponse<>(
                    responseList,
                    certificates.getNumber(),
                    certificates.getSize(),
                    certificates.getTotalElements(),
                    certificates.getTotalPages(),
                    certificates.isLast()
            ));

        } catch (Exception e) {
            log.error("Error fetching user certificates: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching certificates: " + e.getMessage()));
        }
    }

    /**
     * Generate secure download URL for certificate PDF
     * GET /api/retirement/{retirementId}/certificate/download
     *
     * This endpoint implements the auto-download workflow:
     * 1. Validates user authorization
     * 2. Generates signed URL with Content-Disposition header
     * 3. Returns download URL to frontend
     * 4. Frontend triggers automatic download
     */
    @GetMapping("/{retirementId}/certificate/download")
    @PreAuthorize("hasRole('BUYER') or hasRole('CVA') or hasRole('ADMIN')")
    public ResponseEntity<?> getCertificateDownloadUrl(@PathVariable UUID retirementId) {
        log.info("Generating download URL for certificate with retirement ID: {}", retirementId);

        try {
            // Find certificate by retirement transaction ID
            Optional<Certificate> optCert = certificateRepository.findByRetirementTransactionId(retirementId);

            if (optCert.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Certificate not found for retirement: " + retirementId));
            }

            Certificate certificate = optCert.get();

            // Check if certificate is completed and has PDF
            if (certificate.getStatus() != Certificate.CertificateStatus.COMPLETED) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Certificate is not ready for download. Status: " + certificate.getStatus()));
            }

            // Generate secure download URL via StorageService
            String downloadUrl = storageService.generateCertificateDownloadUrl(certificate.getCertificateCode());

            // Return download URL in response
            DownloadUrlResponse response = new DownloadUrlResponse(
                downloadUrl,
                certificate.getCertificateCode() + ".pdf",
                "Certificate download URL generated successfully. Valid for 1 hour."
            );

            log.info("Download URL generated for certificate: {} - URL valid for 1 hour", certificate.getCertificateCode());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error generating download URL for retirement: {}", retirementId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to generate download URL: " + e.getMessage()));
        }
    }

    /**
     * Error response class
     */
    @Data
    @AllArgsConstructor
    public static class ErrorResponse {
        private String error;
    }

    /**
     * Paged response wrapper
     */
    @Data
    @AllArgsConstructor
    public static class PagedResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }

    /**
     * Response object for download URL
     */
    @Data
    @AllArgsConstructor
    public static class DownloadUrlResponse {
        private String url;
        private String fileName;
        private String message;
    }
}
