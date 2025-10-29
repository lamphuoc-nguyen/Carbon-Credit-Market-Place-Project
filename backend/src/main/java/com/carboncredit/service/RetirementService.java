package com.carboncredit.service;

import com.carboncredit.dto.RetirementStatistics;
import com.carboncredit.entity.*;
import com.carboncredit.repository.*;
import com.carboncredit.exception.InsufficientCreditsException;
import com.carboncredit.exception.UserNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RetirementService {

    @Autowired
    private CarbonCreditRepository creditRepository;

    @Autowired
    private RetirementRepository retirementRepo;

    @Autowired
    private CertificateRepository certificateRepo;

    @Autowired
    private UserRepository userRepository; // Cần để lấy thông tin Buyer

    @Autowired
    private CertificateGenerationService certGenerationService; // Service Bất đồng bộ

    /**
     * Khởi tạo quá trình loại bỏ tín chỉ cho một người dùng.
     * Đây là phương thức đồng bộ, cần chạy nhanh và trả về kết quả ngay.
     * Việc tạo PDF và upload sẽ được xử lý bất đồng bộ.
     *
     * @param userId ID của người dùng (Buyer) muốn loại bỏ tín chỉ.
     * @param amountToRetireKg Số lượng CO2e (kg) muốn loại bỏ.
     * @return Đối tượng RetirementTransaction vừa được tạo (với trạng thái PENDING).
     * @throws UserNotFoundException nếu người dùng không tồn tại.
     * @throws InsufficientCreditsException nếu người dùng không có đủ tín chỉ khả dụng.
     * @throws IllegalStateException nếu người dùng không có vai trò BUYER.
     */
    @Transactional
    public RetirementTransaction initiateRetirement(UUID userId, BigDecimal amountToRetireKg) {
        // --- 1. Xác thực và Lấy thông tin User (Buyer) ---
        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        // Đảm bảo rằng chỉ BUYER mới có thể retire credits
        if (buyer.getRole() != User.UserRole.BUYER) {
            throw new IllegalStateException("Người dùng " + buyer.getFullName() + " không có vai trò BUYER và không thể loại bỏ tín chỉ.");
        }

        if (amountToRetireKg.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số lượng tín chỉ muốn loại bỏ phải lớn hơn 0.");
        }

        // --- 2. Tìm và chọn các CarbonCredit khả dụng để loại bỏ ---
        // Lấy tất cả tín chỉ VERIFIED của User (tín chỉ có thể retire)
        List<CarbonCredit> availableCredits = creditRepository.findByUserAndStatus(buyer, CarbonCredit.CreditStatus.VERIFIED);

        BigDecimal totalAvailable = availableCredits.stream()
                .map(CarbonCredit::getCo2ReducedKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalAvailable.compareTo(amountToRetireKg) < 0) {
            throw new InsufficientCreditsException("Không đủ tín chỉ khả dụng. Yêu cầu: " + amountToRetireKg + " kg, Khả dụng: " + totalAvailable + " kg.");
        }

        // Sắp xếp để chọn tín chỉ (ví dụ: ưu tiên tín chỉ cũ hơn - FIFO)
        availableCredits.sort(Comparator.comparing(CarbonCredit::getCreatedAt));

        List<CarbonCredit> creditsToRetire = selectCreditsForRetirement(availableCredits, amountToRetireKg);
        if (creditsToRetire.isEmpty()) {
            // Trường hợp này không nên xảy ra nếu tổng số lượng đủ, nhưng là kiểm tra an toàn
            throw new InsufficientCreditsException("Không thể chọn đủ tín chỉ để loại bỏ, mặc dù tổng số lượng khả dụng.");
        }

        // --- 3. Cập nhật trạng thái của các CarbonCredit được chọn ---
        List<UUID> retiredCreditIds = creditsToRetire.stream()
                .map(credit -> {
                    credit.setStatus(CarbonCredit.CreditStatus.RETIRED);
                    creditRepository.save(credit); // Lưu thay đổi trạng thái
                    return credit.getId();
                })
                .collect(Collectors.toList());

        // --- 4. Tạo RetirementTransaction ---
        RetirementTransaction retirementTx = RetirementTransaction.builder()
                .retiringUser(buyer)
                .amountRetiredKg(amountToRetireKg)
                .retirementDate(LocalDate.now()) // Ngày hiện tại Buyer thực hiện hành động retire
                .status(RetirementTransaction.RetirementStatus.PENDING) // Trạng thái chờ xử lý tiếp
                .retiredCarbonCreditIds(retiredCreditIds) // Lưu ID các tín chỉ đã loại bỏ
                .build();
        RetirementTransaction savedRetirementTx = retirementRepo.save(retirementTx);

        // --- 5. Tạo Certificate (với dữ liệu snapshot) ---
        // Lấy thông tin snapshot cần thiết
        String projectSourceInfo = extractProjectSourceInfo(creditsToRetire); // Hàm tùy chỉnh để tổng hợp

        Certificate newCert = Certificate.builder()
                .certificateCode(generateUniqueCertificateCode()) // Hàm tự tạo mã
                .buyer(buyer)
                .retirementTransaction(savedRetirementTx)
                .buyerNameSnapshot(buyer.getFullName())
                .buyerEmailSnapshot(buyer.getEmail())
                .amountRetiredKg(amountToRetireKg)
                .projectSourceInfo(projectSourceInfo)
                .retirementDate(savedRetirementTx.getRetirementDate())
                .status(Certificate.CertificateStatus.PENDING_GENERATION) // Trạng thái chờ tạo PDF
                .createdAt(Instant.now()) // Dùng Instant cho createdAt của Certificate
                .build();
        Certificate savedCert = certificateRepo.save(newCert);

        // --- 6. Kích hoạt Service Bất đồng bộ để tạo và lưu trữ PDF ---
        certGenerationService.generateAndStoreCertificate(savedCert.getId());

        // --- 7. Trả về đối tượng giao dịch đã tạo (đồng bộ) ---
        return savedRetirementTx;
    }

    /**
     * Logic để chọn các CarbonCredit đủ số lượng cần thiết.
     *
     * @param availableCredits Danh sách các tín chỉ khả dụng.
     * @param targetAmountKg Số lượng CO2e (kg) cần đạt.
     * @return Danh sách các CarbonCredit được chọn.
     */
    private List<CarbonCredit> selectCreditsForRetirement(List<CarbonCredit> availableCredits, BigDecimal targetAmountKg) {
        List<CarbonCredit> selectedCredits = new java.util.ArrayList<>();
        BigDecimal currentTotal = BigDecimal.ZERO;

        for (CarbonCredit credit : availableCredits) {
            if (currentTotal.compareTo(targetAmountKg) < 0) {
                selectedCredits.add(credit);
                currentTotal = currentTotal.add(credit.getCo2ReducedKg());
            } else {
                break; // Đã đạt hoặc vượt quá số lượng mục tiêu
            }
        }
        // Kiểm tra lại để đảm bảo tổng số lượng các tín chỉ đã chọn đủ hoặc vượt quá targetAmountKg
        if (currentTotal.compareTo(targetAmountKg) < 0) {
            return List.of(); // Không đủ tín chỉ, trả về rỗng
        }
        return selectedCredits;
    }

    /**
     * Tạo mã chứng chỉ duy nhất.
     */
    private String generateUniqueCertificateCode() {
        // Logic tạo mã duy nhất, ví dụ: "CERT-" + timestamp + random
        return "CERT-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }

    /**
     * Tổng hợp thông tin nguồn gốc dự án từ các tín chỉ.
     * @param creditsToRetire Danh sách các tín chỉ được loại bỏ.
     * @return Chuỗi mô tả nguồn gốc.
     */
    private String extractProjectSourceInfo(List<CarbonCredit> creditsToRetire) {
        // Logic có thể phức tạp tùy thuộc vào cách bạn muốn hiển thị nguồn gốc.
        // Ví dụ: lấy tên dự án từ JourneyData liên kết với mỗi CarbonCredit
        return creditsToRetire.stream()
                .map(credit -> credit.getJourney().getVehicle().getModel() + " (" + credit.getJourney().getVehicle().getVin() + ")")
                .distinct() // Chỉ lấy tên dự án duy nhất
                .collect(Collectors.joining(", "));
    }

    /**
     * Find retirement transaction by ID
     * @param id Retirement transaction ID
     * @return Optional retirement transaction
     */
    public Optional<RetirementTransaction> findById(UUID id) {
        return retirementRepo.findById(id);
    }

    /**
     * Find retirement transactions by user ID with pagination
     * @param userId User ID
     * @param pageable Pagination information
     * @return Page of retirement transactions
     */
    public Page<RetirementTransaction> findByUserId(UUID userId, Pageable pageable) {
        return retirementRepo.findByRetiringUserId(userId, pageable);
    }

    /**
     * Get retirement statistics for a user
     * @param userId User ID
     * @return Retirement statistics
     */
    public RetirementStatistics getRetirementStatistics(UUID userId) {
        List<RetirementTransaction> userRetirements = retirementRepo.findByRetiringUserIdOrderByCreatedAtDesc(userId);

        BigDecimal totalRetired = userRetirements.stream()
            .filter(r -> r.getStatus() == RetirementTransaction.RetirementStatus.COMPLETED)
            .map(RetirementTransaction::getAmountRetiredKg)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        long completedCount = userRetirements.stream()
            .filter(r -> r.getStatus() == RetirementTransaction.RetirementStatus.COMPLETED)
            .count();

        return new RetirementStatistics(totalRetired, completedCount, userRetirements.size());
    }
}