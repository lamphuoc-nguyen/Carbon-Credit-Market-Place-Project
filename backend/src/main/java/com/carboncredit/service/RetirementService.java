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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RetirementService {

    private static final Logger log = LoggerFactory.getLogger(RetirementService.class);

    @Autowired private CarbonCreditRepository creditRepository;
    @Autowired private RetirementRepository retirementRepo;
    @Autowired private CertificateRepository certificateRepo;
    @Autowired private UserRepository userRepository;
    @Autowired private CertificateGenerationService certGenerationService;
    @Autowired private WalletService walletService;

    /* --------------------------------------------------------------------- */
    /* --------------------------- MAIN METHOD ----------------------------- */
    /* --------------------------------------------------------------------- */
    @Transactional
    public RetirementTransaction initiateRetirement(RetirementRequestDTO request) {
        UUID userId = request.getUserId();
        BigDecimal amountToRetireKg = request.getAmountToRetireKg();

        log.info("Starting retirement for user {} with amount {} kg", userId, amountToRetireKg);
        log.info("Project info: {}, Purpose: {}", request.getProjectInfo(), request.getRetirementPurpose());

        // ---- 1. Validate buyer ------------------------------------------------
        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (buyer.getRole() != User.UserRole.BUYER) {
            throw new IllegalStateException("User " + buyer.getFullName() + " does not have BUYER role.");
        }
        if (amountToRetireKg.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount to retire must be greater than 0.");
        }

        // ---- 2. Find available credits -----------------------------------------
        List<CarbonCredit> listedCredits = creditRepository.findByUserAndStatus(buyer, CarbonCredit.CreditStatus.LISTED);
        List<CarbonCredit> soldCredits   = creditRepository.findByUserAndStatus(buyer, CarbonCredit.CreditStatus.SOLD);

        log.info("Found {} LISTED and {} SOLD credits", listedCredits.size(), soldCredits.size());

        List<CarbonCredit> availableCredits = new ArrayList<>();
        availableCredits.addAll(listedCredits);
        availableCredits.addAll(soldCredits);

        BigDecimal totalAvailable = availableCredits.stream()
                .map(CarbonCredit::getCreditAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        log.info("Total available: {} kg from {} credits", totalAvailable, availableCredits.size());

        if (totalAvailable.compareTo(amountToRetireKg) < 0) {
            throw new InsufficientCreditsException(
                    "Insufficient credits. Required: " + amountToRetireKg + " kg, Available: " + totalAvailable + " kg");
        }

        // FIFO order
        availableCredits.sort(Comparator.comparing(
                CarbonCredit::getCreatedAt,
                Comparator.nullsLast(Comparator.naturalOrder())));

        List<CarbonCredit> creditsToRetire = selectCreditsForRetirement(availableCredits, amountToRetireKg);
        if (creditsToRetire.isEmpty()) {
            throw new InsufficientCreditsException("Failed to select credits for retirement");
        }

        // ---- 3. Mark credits as RETIRED (allowed after DB migration) ----------
        List<UUID> retiredCreditIds = creditsToRetire.stream()
                .map(credit -> {
                    credit.setStatus(CarbonCredit.CreditStatus.RETIRED);
                    creditRepository.save(credit);
                    return credit.getId();
                })
                .collect(Collectors.toList());

        // ---- 3.1. Update wallet ------------------------------------------------
        walletService.updateCreditBalance(buyer.getId(), amountToRetireKg.negate());

        // ---- 4. Persist RetirementTransaction ---------------------------------
        RetirementTransaction retirementTx = RetirementTransaction.builder()
                .retiringUser(buyer)
                .amountRetiredKg(amountToRetireKg)
                .retirementDate(LocalDate.now())
                .status(RetirementTransaction.RetirementStatus.PENDING)
                .retiredCarbonCreditIds(retiredCreditIds)
                .build();
        RetirementTransaction savedRetirementTx = retirementRepo.save(retirementTx);

        // ---- 5. Build & SAVE Certificate (must be saved BEFORE async) -------
        String projectSourceInfo = extractProjectSourceInfo(creditsToRetire, request);

        BigDecimal totalCo2Reduced = creditsToRetire.stream()
                .map(CarbonCredit::getCo2ReducedKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // --- 5. Create & SAVE Certificate ---
        Certificate newCert = Certificate.builder()
                .certificateCode(generateUniqueCertificateCode())
                .buyer(buyer)
                .retirementTransaction(savedRetirementTx)
                .buyerNameSnapshot(buyer.getFullName())
                .buyerEmailSnapshot(buyer.getEmail())
                .amountRetiredKg(amountToRetireKg)
                .co2ReducedKg(totalCo2Reduced)
                .projectSourceInfo(projectSourceInfo)
                .retirementDate(savedRetirementTx.getRetirementDate())
                .status(Certificate.CertificateStatus.PENDING_GENERATION)
                .createdAt(Instant.now())
                .build();

        Certificate savedCert = certificateRepo.save(newCert);  // ← Save FIRST

// --- 6. Trigger async PDF generation ---
        certGenerationService.generateAndStoreCertificate(savedCert.getId());  // ← Now safe

        // ---- 6. Async PDF generation (row already exists) --------------------
        certGenerationService.generateAndStoreCertificate(savedCert.getId());

        return savedRetirementTx;
    }

    /* --------------------------------------------------------------------- */
    /* --------------------------- HELPERS --------------------------------- */
    /* --------------------------------------------------------------------- */

    private List<CarbonCredit> selectCreditsForRetirement(List<CarbonCredit> available,
                                                          BigDecimal targetKg) {
        List<CarbonCredit> selected = new ArrayList<>();
        BigDecimal sum = BigDecimal.ZERO;

        log.info("Selecting credits: target {} kg from {} available", targetKg, available.size());

        for (CarbonCredit c : available) {
            selected.add(c);
            sum = sum.add(c.getCreditAmount());

            if (sum.compareTo(targetKg) >= 0) {
                log.info("Target reached! {} credits, total {} kg", selected.size(), sum);
                break;
            }
        }
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
            if (sb.length() > 0) sb.append(" | ");
            sb.append("Project: ").append(request.getProjectInfo().trim());
        }

        if (request.getRetirementPurpose() != null && !request.getRetirementPurpose().trim().isEmpty()) {
            if (sb.length() > 0) sb.append(" | ");
            sb.append("Purpose: ").append(request.getRetirementPurpose().trim());
        }

        String result = sb.toString();
        log.info("Generated project source info: {}", result);
        return result;
    }

    /* --------------------------------------------------------------------- */
    /* ---------------------- READ-ONLY QUERIES --------------------------- */
    /* --------------------------------------------------------------------- */
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