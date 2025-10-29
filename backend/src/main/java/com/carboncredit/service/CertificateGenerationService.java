package com.carboncredit.service;

import com.carboncredit.entity.Certificate;
import com.carboncredit.repository.CertificateRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for handling asynchronous certificate generation and PDF creation
 */
@Service
@Slf4j
public class CertificateGenerationService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private StorageService storageService;

    @Value("${app.certificate.use-cloud-storage:true}")
    private boolean useCloudStorage;

    /**
     * Asynchronously generates and stores a PDF certificate
     * This method runs in a separate thread to avoid blocking the main retirement process
     *
     * @param certificateId The ID of the certificate to generate PDF for
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void generateAndStoreCertificate(UUID certificateId) {
        log.info("Starting async certificate generation for certificate ID: {}", certificateId);

        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new IllegalStateException("Certificate not found: " + certificateId));

        try {
            // Generate PDF + upload
            String pdfUrl = generateAndUploadPdfDocument(certificate);

            // Save URL + status
            certificate.setPdfUrl(pdfUrl);
            certificate.setStatus(Certificate.CertificateStatus.COMPLETED);
            certificateRepository.save(certificate);

            log.info("Certificate PDF generated: {}", pdfUrl);

        } catch (Exception e) {
            log.error("Failed to generate certificate: {}", certificateId, e);
            certificate.setStatus(Certificate.CertificateStatus.FAILED_GENERATION);
            certificateRepository.save(certificate);
        }
    }

    /**
     * Generates PDF document and uploads to cloud storage
     *
     * @param certificate The certificate to generate PDF for
     * @return URL of the uploaded PDF
     */
    private String generateAndUploadPdfDocument(Certificate certificate) throws Exception {
        log.info("Generating and uploading PDF for certificate: {}", certificate.getCertificateCode());

        // Prepare data for the certificate template
        Map<String, Object> templateData = prepareTemplateData(certificate);

        // Generate PDF using PdfService
        byte[] pdfBytes = pdfService.generatePdfFromHtml("certificate_template", templateData);

        if (useCloudStorage) {
            // Upload to cloud storage (production mode)
            String cloudUrl = storageService.uploadCertificatePdf(pdfBytes, certificate.getCertificateCode());
            log.info("PDF uploaded to cloud storage: {} (Size: {} bytes)", cloudUrl, pdfBytes.length);
            return cloudUrl;
        } else {
            // Mock URL for development/testing
            String mockUrl = String.format("https://certificates.example.com/pdf/%s.pdf", certificate.getCertificateCode());
            log.info("PDF generated in development mode: {} (Size: {} bytes)", mockUrl, pdfBytes.length);
            return mockUrl;
        }
    }

    /**
     * Prepares template data for PDF generation
     *
     * @param certificate The certificate entity
     * @return Map of template variables
     */
    private Map<String, Object> prepareTemplateData(Certificate certificate) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("certificateCode", certificate.getCertificateCode());
        templateData.put("buyerName", certificate.getBuyerNameSnapshot());
        templateData.put("buyerEmail", certificate.getBuyerEmailSnapshot());
        templateData.put("amountRetired", certificate.getAmountRetiredKg());
        templateData.put("projectInfo", certificate.getProjectSourceInfo());
        templateData.put("retirementDate", certificate.getRetirementDate());
        templateData.put("createdAt", certificate.getCreatedAt());

        log.debug("Template data prepared for certificate: {}", certificate.getCertificateCode());
        return templateData;
    }
}
