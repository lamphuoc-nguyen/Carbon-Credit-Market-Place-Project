package com.carboncredit.service;

import com.carboncredit.entity.Certificate;
import com.carboncredit.entity.RetirementTransaction;
import com.carboncredit.entity.CarbonCredit;
import com.carboncredit.entity.User;
import com.carboncredit.repository.CarbonCreditRepository;
import com.carboncredit.repository.CertificateRepository;
import com.carboncredit.repository.RetirementRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
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
    private RetirementRepository retirementRepository;

    @Autowired
    private PdfService pdfService; // Service đã được dọn dẹp

    @Autowired
    private StorageService storageService;

    @Autowired
    private CarbonCreditRepository carbonCreditRepository;

    @Autowired
    private WalletService walletService;

    @Value("${app.certificate.use-cloud-storage:true}")
    private boolean useCloudStorage;

    /**
     * Asynchronously generates and stores a PDF certificate
     * This method runs in a separate thread to avoid blocking the main retirement process
     *
     * @param certificateId The ID of the certificate to generate PDF for
     */
    @Async // <<< 4. THÊM CHÚ THÍCH (ANNOTATION) NÀY
    @Transactional(propagation = Propagation.REQUIRES_NEW) // <<< 5. THÊM CHÚ THÍCH NÀY
    public void generateAndStoreCertificate(UUID certificateId) {
        // Transaction MỚI (B) bắt đầu ở đây.
        // Nó sẽ chạy SAU KHI Transaction (A) của RetirementService commit.
        log.info("Starting async certificate generation for certificate ID: {}", certificateId);

        // Giờ đây, findById sẽ thành công vì Transaction A đã commit
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new IllegalStateException("Certificate not found: " + certificateId));

        RetirementTransaction retirementTx = certificate.getRetirementTransaction();
        if (retirementTx == null) {
            log.error("Important!!: Certificate {} No RetirementTransaction.", certificateId);
            return; // Không thể tiếp tục
        }

        try {
            // --- SỬA ĐỔI LOGIC ---
            // Gọi trực tiếp PdfService đã được dọn dẹp
                log.info("Generating PDF for certificate: {}", certificate.getCertificateCode());
            byte[] pdfBytes = pdfService.generateCertificatePdf(certificate); // <<< 6. GỌI TRỰC TIẾP

            // Logic upload (giữ nguyên)
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
            // --- KẾT THÚC SỬA ĐỔI LOGIC ---

            // Save certificate with PDF URL and mark as COMPLETED first
            certificate.setPdfUrl(pdfUrl);
            certificate.setStatus(Certificate.CertificateStatus.COMPLETED);
            certificateRepository.save(certificate);
            log.info("Certificate PDF generated and stored: {}", pdfUrl);

            // --- NOW UPDATE CARBON CREDITS AND WALLET BALANCE ---
            // This happens AFTER certificate is confirmed COMPLETED and stored in cloud
            log.info("Certificate completed and stored. Now updating carbon credits and wallet balance for retirement");

            // 1. Get buyer's available credits (VERIFIED or SOLD status)
            User buyer = certificate.getBuyer();
            List<CarbonCredit> availableCredits = carbonCreditRepository.findByUserAndStatusIn(
                buyer,
                Arrays.asList(CarbonCredit.CreditStatus.VERIFIED, CarbonCredit.CreditStatus.SOLD)
            );

            // 2. Select credits to retire (FIFO - First In First Out based on creation date)
            BigDecimal amountToRetire = certificate.getAmountRetiredKg();
            List<CarbonCredit> selectedCredits = selectCreditsForRetirement(availableCredits, amountToRetire);

            if (selectedCredits.isEmpty()) {
                log.error("No credits available to retire for amount: {} kg", amountToRetire);
                throw new IllegalStateException("Insufficient credits available for retirement");
            }

            // 3. Update selected credits status to RETIRED
            BigDecimal totalRetired = BigDecimal.ZERO;
            List<UUID> retiredCreditIds = new ArrayList<>();

            for (CarbonCredit credit : selectedCredits) {
                credit.setStatus(CarbonCredit.CreditStatus.RETIRED);
                carbonCreditRepository.save(credit);
                retiredCreditIds.add(credit.getId());
                totalRetired = totalRetired.add(credit.getCo2ReducedKg());
                log.info("Credit {} marked as RETIRED ({} kg)", credit.getId(), credit.getCo2ReducedKg());
            }

            // 4. Update retirement transaction with retired credit IDs
            retirementTx.setRetiredCarbonCreditIds(retiredCreditIds);

            // 5. Decrease wallet credit balance by retired amount
            walletService.updateCreditBalance(buyer.getId(), totalRetired.negate());
            log.info("Wallet balance decreased by {} kg for user {}", totalRetired, buyer.getId());

            // 6. Finally mark RetirementTransaction as COMPLETED
            retirementTx.setStatus(RetirementTransaction.RetirementStatus.COMPLETED);
            retirementRepository.save(retirementTx);

            log.info("Retirement completed successfully!");
            log.info("Total {} kg retired from {} credits", totalRetired, selectedCredits.size());

        } catch (Exception e) {
            log.error("Failed to generate certificate: {}", certificateId, e);
            // Cập nhật trạng thái FAILED (đã có certificate object)
            certificate.setStatus(Certificate.CertificateStatus.FAILED_GENERATION);
            certificateRepository.save(certificate);

            retirementTx.setStatus(RetirementTransaction.RetirementStatus.FAILED); // <<< THÊM DÒNG NÀY
            retirementRepository.save(retirementTx);
        }
    }

    /**
     * Helper method to select credits for retirement using FIFO strategy
     * @param available List of available credits
     * @param targetKg Target amount to retire in kg
     * @return List of selected credits
     */
    private List<CarbonCredit> selectCreditsForRetirement(List<CarbonCredit> available, BigDecimal targetKg) {
        // Sort by creation date (FIFO - First In First Out)
        available.sort(Comparator.comparing(CarbonCredit::getCreatedAt));

        List<CarbonCredit> selected = new ArrayList<>();
        BigDecimal sum = BigDecimal.ZERO;

        log.info("Selecting credits for retirement: Target {} kg from {} available credits", targetKg, available.size());

        for (CarbonCredit credit : available) {
            selected.add(credit);
            sum = sum.add(credit.getCo2ReducedKg());

            log.debug("Selected credit {} with {} kg (Total: {} kg)",
                     credit.getId(), credit.getCo2ReducedKg(), sum);

            if (sum.compareTo(targetKg) >= 0) {
                log.info("Target reached! Selected {} credits totaling {} kg", selected.size(), sum);
                break;
            }
        }

        if (sum.compareTo(targetKg) < 0) {
            log.error("Failed to select enough credits: Selected {} kg, needed {} kg", sum, targetKg);
        }

        return selected;
    }
}