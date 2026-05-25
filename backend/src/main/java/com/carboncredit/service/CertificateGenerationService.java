package com.carboncredit.service;

import com.carboncredit.entity.Certificate;
import com.carboncredit.entity.RetirementTransaction;
import com.carboncredit.repository.CertificateRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service for handling asynchronous certificate generation and PDF creation
 */
@Service
@Slf4j
public class CertificateGenerationService {

    private final CertificateRepository certificateRepository;
    private final PdfService pdfService;
    private final StorageService storageService;
    private final boolean useCloudStorage;

    public CertificateGenerationService(
            CertificateRepository certificateRepository,
            PdfService pdfService,
            StorageService storageService,
            @Value("${app.certificate.use-cloud-storage:true}") boolean useCloudStorage) {
        this.certificateRepository = certificateRepository;
        this.pdfService = pdfService;
        this.storageService = storageService;
        this.useCloudStorage = useCloudStorage;
    }

    /**
     * Asynchronously generates and stores a PDF certificate
     * This method runs in a separate thread to avoid blocking the main retirement process
     * Note: Credits are already retired in the main transaction, this only handles PDF generation
     *
     * @param certificateId The ID of the certificate to generate PDF for
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void generateAndStoreCertificate(UUID certificateId) {
        log.info("Starting async certificate PDF generation for certificate ID: {}", certificateId);

        // Find certificate with retirement transaction
        Certificate certificate = certificateRepository.findByIdWithRetirementTransaction(certificateId)
                .orElseThrow(() -> new IllegalStateException("Certificate not found: " + certificateId));

        RetirementTransaction retirementTx = certificate.getRetirementTransaction();
        if (retirementTx == null) {
            log.error("Certificate {} has no RetirementTransaction", certificateId);
            markCertificateFailed(certificate);
            return;
        }

        try {
            // Generate PDF
            log.info("Generating PDF for certificate: {}", certificate.getCertificateCode());
            byte[] pdfBytes = pdfService.generateCertificatePdf(certificate);

            // Upload to storage
            String pdfUrl;
            if (useCloudStorage) {
                // Upload to cloud storage (production mode)
                pdfUrl = storageService.uploadCertificatePdf(pdfBytes, certificate.getCertificateCode());
                log.info("PDF uploaded to cloud storage: {} (Size: {} bytes)", pdfUrl, pdfBytes.length);
            } else {
                // Mock URL for development/testing
                pdfUrl = String.format("https://certificates.example.com/pdf/%s.pdf", certificate.getCertificateCode());
                log.info("PDF generated in development mode: {} (Size: {} bytes)", pdfUrl, pdfBytes.length);
            }

            // Update certificate with PDF URL and mark as COMPLETED
            certificate.setPdfUrl(pdfUrl);
            certificate.setStatus(Certificate.CertificateStatus.COMPLETED);
            certificateRepository.save(certificate);

            log.info("Certificate PDF generation completed successfully: {}", certificate.getCertificateCode());

        } catch (Exception e) {
            log.error("Failed to generate certificate PDF: {}", certificateId, e);
            markCertificateFailed(certificate);
        }
    }

    /**
     * Mark certificate as failed generation
     */
    private void markCertificateFailed(Certificate certificate) {
        try {
            certificate.setStatus(Certificate.CertificateStatus.FAILED_GENERATION);
            certificateRepository.save(certificate);
            log.info("Certificate {} marked as FAILED_GENERATION", certificate.getId());
        } catch (Exception e) {
            log.error("Failed to mark certificate as failed: {}", certificate.getId(), e);
        }
    }
}
