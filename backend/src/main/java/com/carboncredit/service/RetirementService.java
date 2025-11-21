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

    @Transactional // (Đây là Giao dịch A)
    public RetirementTransaction initiateRetirement(RetirementRequestDTO request) {
        UUID userId = request.getUserId();
        BigDecimal amountToRetireKg = request.getAmountToRetireKg();

        log.info("Starting retirement phase 1 (Validation) for user {} with amount {} kg", userId, amountToRetireKg);
        log.info("Project info: {}, Purpose: {}", request.getProjectInfo(), request.getRetirementPurpose());

        // ---- 1. Validate buyer (Giữ nguyên) ----
        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        // ... (Kiểm tra role và amount > 0) ...

        // ---- 2. Find available credits (CHỈ KIỂM TRA, KHÔNG SỬA) ----
        List<CarbonCredit> verifiableCredits = creditRepository.findByUserAndStatus(buyer, CarbonCredit.CreditStatus.VERIFIED);
        List<CarbonCredit> purchasedCredits  = creditRepository.findByUserAndStatus(buyer, CarbonCredit.CreditStatus.SOLD);
        List<CarbonCredit> availableCredits = new ArrayList<>();
        availableCredits.addAll(verifiableCredits);
        availableCredits.addAll(purchasedCredits);

        BigDecimal totalAvailable = availableCredits.stream()
                .map(CarbonCredit::getCo2ReducedKg) // Dùng co2ReducedKg
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        log.info("Total available: {} kg from {} credits", totalAvailable, availableCredits.size());

        if (totalAvailable.compareTo(amountToRetireKg) < 0) {
            throw new InsufficientCreditsException(
                    "Insufficient credits. Required: " + amountToRetireKg + " kg, Available: " + totalAvailable + " kg");
        }

        // ---- 3. BỎ LOGIC TRỪ CREDIT ----
        // (Toàn bộ logic 'selectCreditsForRetirement', 'credit.setStatus(RETIRED)',
        // 'creditRepository.save(credit)', 'walletService.updateCreditBalance'
        // ĐÃ BỊ XÓA KHỎI ĐÂY)

        // ---- 4. Persist RetirementTransaction (PENDING) ----
        RetirementTransaction retirementTx = RetirementTransaction.builder()
                .retiringUser(buyer)
                .amountRetiredKg(amountToRetireKg) // Số lượng user YÊU CẦU
                .retirementDate(LocalDate.now())
                .status(RetirementTransaction.RetirementStatus.PENDING) // Trạng thái chờ xử lý
                .retiredCarbonCreditIds(new ArrayList<>()) // <<< QUAN TRỌNG: Danh sách ID ban đầu rỗng
                .build();
        RetirementTransaction savedRetirementTx = retirementRepo.save(retirementTx);

        // ---- 5. Build & SAVE Certificate (PENDING) ----
        String projectSourceInfo = String.format("Carbon Credits | Project: %s | Purpose: %s",
                request.getProjectInfo(), request.getRetirementPurpose());

        Certificate newCert = Certificate.builder()
                .certificateCode(generateUniqueCertificateCode())
                .buyer(buyer)
                .retirementTransaction(savedRetirementTx)
                .buyerNameSnapshot(buyer.getFullName())
                .buyerEmailSnapshot(buyer.getEmail())
                .amountRetiredKg(amountToRetireKg)
                .co2ReducedKg(amountToRetireKg) // Tạm thời đặt bằng số lượng yêu cầu
                .projectSourceInfo(projectSourceInfo)
                .retirementDate(savedRetirementTx.getRetirementDate())
                .issueDate(LocalDate.now()) // NEW: Set issue date when certificate is created
                .status(Certificate.CertificateStatus.PENDING_GENERATION) // Trạng thái chờ
                .createdAt(Instant.now())
                .build();
        Certificate savedCert = certificateRepo.save(newCert);

        // Send notification for retirement success
        notificationService.notifyRetirementSuccess(buyer, savedCert.getId().toString());

        // ---- 6. Async PDF generation (Giữ nguyên) ----
        // Kích hoạt Giai đoạn 2 (Bất đồng bộ) CHỈ SAU KHI Giao dịch A commit thành công
        TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronizationAdapter() {
                    @Override
                    public void afterCommit() {
                        log.info("Transaction A committed. Triggering async generation for cert ID: {}", savedCert.getId());
                        certGenerationService.generateAndStoreCertificate(savedCert.getId());
                    }
                }
        );

        // Giao dịch A kết thúc và commit
        return savedRetirementTx;
    }


    private List<CarbonCredit> selectCreditsForRetirement(List<CarbonCredit> available,
                                                          BigDecimal targetKg) {
        List<CarbonCredit> selected = new ArrayList<>();
        BigDecimal sum = BigDecimal.ZERO;

        log.info("Selecting credits: target {} kg from {} available", targetKg, available.size());

        for (CarbonCredit c : available) {
            selected.add(c);
            sum = sum.add(c.getCo2ReducedKg());

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