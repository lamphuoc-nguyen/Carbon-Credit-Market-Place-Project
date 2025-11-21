package com.carboncredit.service;

import com.carboncredit.dto.RetirementRequestDTO;
import com.carboncredit.dto.RetirementStatistics;
import com.carboncredit.entity.*;
import com.carboncredit.repository.*;
import com.carboncredit.exception.InsufficientCreditsException;
import com.carboncredit.exception.UserNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.util.ArrayList; // <<< Thêm
import java.util.Comparator; // <<< Thêm
import java.util.List; // <<< Thêm
import java.util.UUID; // <<< Thêm
import java.util.stream.Collectors; // <<< Thêm
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;


@Service
public class RetirementService {

    private static final Logger log = LoggerFactory.getLogger(RetirementService.class);

    @Autowired private CarbonCreditRepository creditRepository;
    @Autowired private RetirementRepository retirementRepo;
    @Autowired private CertificateRepository certificateRepo;
    @Autowired private UserRepository userRepository;
    @Autowired private CertificateGenerationService certGenerationService;
    @Autowired private WalletService walletService;
    @Autowired private NotificationService notificationService;

    @Transactional
    public RetirementTransaction initiateRetirement(RetirementRequestDTO request) {
        UUID userId = request.getUserId();
        BigDecimal creditCountToRetire = request.getAmountToRetireKg(); // This is actually credit count, not kg

        log.info("Starting retirement for user {} with {} credits", userId, creditCountToRetire);
        log.info("Project info: {}, Purpose: {}", request.getProjectInfo(), request.getRetirementPurpose());

        // ---- 1. Validate buyer ----
        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        // Validate user role (should be BUYER)
        if (!buyer.getRole().equals(User.UserRole.BUYER)) {
            throw new IllegalArgumentException("Only buyers can retire carbon credits");
        }

        // Validate amount - must be whole number since we're dealing with credit count
        if (creditCountToRetire.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credit count must be greater than 0");
        }

        if (creditCountToRetire.stripTrailingZeros().scale() > 0) {
            throw new IllegalArgumentException("Credit count must be a whole number");
        }

        // ---- 2. Check wallet credit count (CORRECT APPROACH) ----
        BigDecimal currentCreditBalance = walletService.getCreditBalance(userId);
        log.info("Current wallet credit count: {} credits", currentCreditBalance);

        if (currentCreditBalance.compareTo(creditCountToRetire) < 0) {
            throw new InsufficientCreditsException(
                    "Insufficient credits in wallet. Required: " + creditCountToRetire + " credits, Available: " + currentCreditBalance + " credits");
        }

        // ---- 3. IMMEDIATELY DEDUCT FROM WALLET CREDIT BALANCE ----
        log.info("Deducting {} credits from wallet balance", creditCountToRetire);
        walletService.updateCreditBalance(userId, creditCountToRetire.negate());

        // ---- 4. SELECT AND RETIRE ACTUAL CREDITS ----
        // Get available credits for retiring
        List<CarbonCredit> verifiableCredits = creditRepository.findByUserAndStatus(buyer, CarbonCredit.CreditStatus.VERIFIED);
        List<CarbonCredit> purchasedCredits = creditRepository.findByUserAndStatus(buyer, CarbonCredit.CreditStatus.SOLD);
        List<CarbonCredit> availableCredits = new ArrayList<>();
        availableCredits.addAll(verifiableCredits);
        availableCredits.addAll(purchasedCredits);

        // Select exact number of credits to retire using FIFO
        List<CarbonCredit> selectedCredits = selectCreditsForRetirement(availableCredits, creditCountToRetire);

        // Mark selected credits as RETIRED
        List<UUID> retiredCreditIds = new ArrayList<>();
        BigDecimal totalCo2Retired = BigDecimal.ZERO; // Sum up the CO2 from retired credits

        for (CarbonCredit credit : selectedCredits) {
            credit.setStatus(CarbonCredit.CreditStatus.RETIRED);
            creditRepository.save(credit);
            retiredCreditIds.add(credit.getId());
            totalCo2Retired = totalCo2Retired.add(credit.getCo2ReducedKg());
            log.info("Credit {} marked as RETIRED ({} kg CO2)", credit.getId(), credit.getCo2ReducedKg());
        }

        log.info("Total {} credits retired representing {} kg CO2", selectedCredits.size(), totalCo2Retired);


        // ---- 5. Create RetirementTransaction (COMPLETED) ----
        RetirementTransaction retirementTx = RetirementTransaction.builder()
                .retiringUser(buyer)
                .amountRetiredKg(totalCo2Retired) // Store the actual CO2 amount from retired credits
                .retirementDate(LocalDate.now())
                .status(RetirementTransaction.RetirementStatus.COMPLETED) // Mark as COMPLETED since credits are already retired
                .retiredCarbonCreditIds(retiredCreditIds) // Include the actual retired credit IDs
                .build();
        RetirementTransaction savedRetirementTx = retirementRepo.save(retirementTx);

        // ---- 6. Build & SAVE Certificate (PENDING_GENERATION) ----
        String projectSourceInfo = extractProjectSourceInfo(selectedCredits, request);

        Certificate newCert = Certificate.builder()
                .certificateCode(generateUniqueCertificateCode())
                .buyer(buyer)
                .retirementTransaction(savedRetirementTx)
                .buyerNameSnapshot(buyer.getFullName())
                .buyerEmailSnapshot(buyer.getEmail())
                .amountRetiredKg(totalCo2Retired) // CO2 amount from the retired credits
                .co2ReducedKg(totalCo2Retired) // Same as amount retired
                .projectSourceInfo(projectSourceInfo)
                .retirementDate(savedRetirementTx.getRetirementDate())
                .issueDate(LocalDate.now())
                .status(Certificate.CertificateStatus.PENDING_GENERATION) // PDF generation pending
                .createdAt(Instant.now())
                .build();
        Certificate savedCert = certificateRepo.save(newCert);

        // Send notification for retirement success
        notificationService.notifyRetirementSuccess(buyer, savedCert.getId().toString());

        // ---- 7. Trigger async PDF generation ----
        TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        log.info("Retirement transaction committed. Triggering async PDF generation for cert ID: {}", savedCert.getId());
                        certGenerationService.generateAndStoreCertificate(savedCert.getId());
                    }
                }
        );

        return savedRetirementTx;
    }


    private List<CarbonCredit> selectCreditsForRetirement(List<CarbonCredit> available,
                                                          BigDecimal targetCreditCount) {
        List<CarbonCredit> selected = new ArrayList<>();

        log.info("Selecting {} credits for retirement from {} available", targetCreditCount, available.size());

        // Sort by creation date for FIFO (First In First Out) - oldest credits retired first
        available.sort(Comparator.comparing(CarbonCredit::getCreatedAt));

        int creditsToSelect = targetCreditCount.intValue();

        if (available.size() < creditsToSelect) {
            log.error("Not enough credits available. Required: {} credits, Available: {} credits",
                      creditsToSelect, available.size());
            throw new InsufficientCreditsException("Insufficient credits available for retirement");
        }

        // Select exact number of credits (FIFO)
        for (int i = 0; i < creditsToSelect && i < available.size(); i++) {
            CarbonCredit credit = available.get(i);
            selected.add(credit);
            log.debug("Selected credit {} for retirement ({} kg CO2)", credit.getId(), credit.getCo2ReducedKg());
        }

        log.info("Selected {} credits for retirement", selected.size());
        return selected;
    }

    private String generateUniqueCertificateCode() {
        return "CERT-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }

    /** Extract vehicle models (null-safe) and combine with user-provided project info */
    private String extractProjectSourceInfo(List<CarbonCredit> credits,
                                            RetirementRequestDTO request) {
        log.info("Extracting project source info from {} credits", credits.size());

        // ---- vehicle models -------------------------------------------------
        List<String> models = credits.stream()
                .map(CarbonCredit::getJourney)
                .filter(Objects::nonNull)
                .map(JourneyData::getVehicle)
                .filter(Objects::nonNull)
                .map(Vehicle::getModel)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(m -> !m.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        log.info("Found {} unique vehicle models", models.size());

        // ---- build final string --------------------------------------------
        StringBuilder sb = new StringBuilder();

        if (!models.isEmpty()) {
            sb.append("Vehicles: ").append(String.join(", ", models));
        } else {
            sb.append("Carbon Credits");
        }

        if (request.getProjectInfo() != null && !request.getProjectInfo().trim().isEmpty()) {
            if (!sb.isEmpty()) sb.append(" | ");
            sb.append("Project: ").append(request.getProjectInfo().trim());
        }

        if (request.getRetirementPurpose() != null && !request.getRetirementPurpose().trim().isEmpty()) {
            if (!sb.isEmpty()) sb.append(" | ");
            sb.append("Purpose: ").append(request.getRetirementPurpose().trim());
        }

        String result = sb.toString();
        log.info("Generated project source info: {}", result);
        return result;
    }

    public Optional<RetirementTransaction> findById(UUID id) {
        return retirementRepo.findById(id);
    }

    public Page<RetirementTransaction> findByUserId(UUID userId, Pageable pageable) {
        return retirementRepo.findByRetiringUserId(userId, pageable);
    }

    public RetirementStatistics getRetirementStatistics(UUID userId) {
        List<RetirementTransaction> txs = retirementRepo.findByRetiringUserIdOrderByCreatedAtDesc(userId);

        BigDecimal totalRetired = txs.stream()
                .filter(t -> t.getStatus() == RetirementTransaction.RetirementStatus.COMPLETED)
                .map(RetirementTransaction::getAmountRetiredKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long completedCount = txs.stream()
                .filter(t -> t.getStatus() == RetirementTransaction.RetirementStatus.COMPLETED)
                .count();

        return new RetirementStatistics(totalRetired, completedCount, txs.size());
    }
}