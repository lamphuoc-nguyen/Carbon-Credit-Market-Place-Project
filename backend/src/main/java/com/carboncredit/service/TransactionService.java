package com.carboncredit.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carboncredit.entity.CarbonCredit;
import com.carboncredit.entity.CreditListing;
import com.carboncredit.entity.CreditListing.ListingStatus;
import com.carboncredit.entity.Dispute;
import com.carboncredit.entity.Dispute.DisputeStatus;
import com.carboncredit.entity.Transaction;
import com.carboncredit.entity.Transaction.TransactionStatus;
import com.carboncredit.entity.User;
import com.carboncredit.exception.BusinessOperationException;
import com.carboncredit.exception.EntityNotFoundException;
import com.carboncredit.exception.PaymentException;
import com.carboncredit.exception.UnauthorizedOperationException;
import com.carboncredit.repository.CarbonCreditRepository;
import com.carboncredit.repository.CreditListingRepository;
import com.carboncredit.repository.DisputeRepository;
import com.carboncredit.repository.TransactionRepository;
import com.carboncredit.service.PaymentService.PaymentResult;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    @Autowired
    private ValidationService validationService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private DisputeRepository disputeRepository;

    @Autowired
    private CreditListingRepository creditListingRepository;

    @Autowired
    private CarbonCreditRepository carbonCreditRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private WalletService walletService;

    // ==== TRANSACTION AND PROCESSING ================

    // Initiates transaction for purchasing a carbon credit (full purchase)
    public Transaction initiatePurchase(UUID listingId, User buyer, String paymentMethodId) {
        return initiatePurchase(listingId, buyer, paymentMethodId, null);
    }

    // Initiates transaction for purchasing a carbon credit with optional partial quantity
    @Transactional
    public Transaction initiatePurchase(UUID listingId, User buyer, String paymentMethodId, BigDecimal quantity) {
        // 1. Lock Listing Row for update if possible, but @Transactional handles basic isolation
        CreditListing listing = creditListingRepository.findByIdForUpdate(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        // 2. CRITICAL: Check status to prevent race condition
        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new BusinessOperationException("Listing is currently unavailable (Status: " + listing.getStatus() + "). It may be in a pending transaction.");
        }

        // Lấy credit từ listing
        CarbonCredit credit = listing.getCredit();
        if (credit == null) {
            throw new RuntimeException("Listing has no associated carbon credit");
        }

        // 3. Calculate purchase amount and Validate Quantity
        BigDecimal totalAvailableCredits = credit.getCreditAmount();
        BigDecimal purchaseAmount;
        BigDecimal purchaseQuantity;

        if (quantity != null && quantity.compareTo(BigDecimal.ZERO) > 0) {
            // Partial purchase
            if (quantity.compareTo(totalAvailableCredits) > 0) {
                throw new BusinessOperationException("Requested quantity (" + quantity + ") exceeds available credits (" + totalAvailableCredits + ")");
            }

            // Calculate proportional price: (quantity / totalCredits) * listingPrice
            purchaseAmount = listing.getPrice().multiply(quantity).divide(totalAvailableCredits, 2, RoundingMode.HALF_UP);
            purchaseQuantity = quantity;

            log.info("Partial purchase initiated: {} out of {} credits for ${}", quantity, totalAvailableCredits, purchaseAmount);
        } else {
            // Full purchase
            purchaseAmount = listing.getPrice();
            purchaseQuantity = totalAvailableCredits;

            log.info("Full purchase initiated: {} credits for ${}", purchaseQuantity, purchaseAmount);
        }

        // 4. Create Transaction Record
        Transaction transaction = new Transaction();
        transaction.setListing(listing);
        transaction.setCredit(credit);
        transaction.setBuyer(buyer);
        transaction.setSeller(credit.getUser());
        transaction.setAmount(purchaseAmount);
        transaction.setPaymentMethodId(paymentMethodId);
        transaction.setCreditAmount(purchaseQuantity); // Store purchased quantity

        // Set payment method based on paymentMethodId
        if (paymentMethodId != null && paymentMethodId.toUpperCase().contains("VNPAY")) {
            transaction.setPaymentMethod(Transaction.PaymentMethod.VNPAY);
        } else if (paymentMethodId != null && paymentMethodId.toUpperCase().contains("BANK")) {
            transaction.setPaymentMethod(Transaction.PaymentMethod.BANK_TRANSFER);
        } else {
            transaction.setPaymentMethod(Transaction.PaymentMethod.WALLET);
        }

        transaction.setStatus(Transaction.TransactionStatus.PENDING);
        transaction.setCreatedAt(LocalDateTime.now());

        Transaction savedTransaction = transactionRepository.save(transaction);

        // 5. RESOURCE LOCKING (RESERVATION)         // Trừ trực tiếp số lượng Credit của Seller để "giữ chỗ".
        // Nếu transaction fail, ta sẽ cộng lại sau.
        BigDecimal remainingQuantity = totalAvailableCredits.subtract(purchaseQuantity);

        if (remainingQuantity.compareTo(BigDecimal.ZERO) == 0) {
            // Nếu mua hết (hoặc mua phần còn lại cuối cùng) -> Khóa Listing ngay lập tức
            listing.setStatus(ListingStatus.PENDING_TRANSACTION);
            credit.setCreditAmount(BigDecimal.ZERO); // Set credit gốc về 0
            log.warn("Listing {} fully reserved. Status set to PENDING_TRANSACTION.", listingId);
        } else {
            // Nếu mua một phần -> Giảm số lượng credit gốc, Listing vẫn ACTIVE cho người khác mua phần còn lại
            credit.setCreditAmount(remainingQuantity);
            // Cập nhật giá Listing theo tỉ lệ mới (Optional logic: tùy business rule, ở đây ta cập nhật giá hiển thị nếu cần)
            BigDecimal newPrice = listing.getPrice().subtract(purchaseAmount);
            listing.setPrice(newPrice.max(BigDecimal.ZERO));

            log.info("Listing {} quantity reserved. Remaining: {}. Status: ACTIVE", listingId, remainingQuantity);
        }

        // Lưu thay đổi
        carbonCreditRepository.save(credit);
        creditListingRepository.save(listing);

        return savedTransaction;
    }

    // Process payment for a transaction
    @Transactional
    public void processPayment(Transaction transaction) {
        log.info("Processing payment for transaction {}", transaction.getId());

        // Validate transaction
        validationService.validateTransactionSecurity(transaction);

        // Process payment through payment service
        PaymentResult paymentResult = paymentService.processPayment(transaction.getId(),
                transaction.getAmount(), transaction.getBuyer().getId().toString(),
                transaction.getSeller().getId().toString());

        if (paymentResult.isSuccess()) {
            completeTransaction(transaction);
        } else {
            failTransaction(transaction, "Payment failed: " + paymentResult.getErrorMessage());
            throw new PaymentException("Payment processing failed: " + paymentResult.getErrorMessage());
        }
    }

    // Complete a successful transaction
    @Transactional
    public Transaction completeTransaction(Transaction transaction) {
        log.info("Completing transaction {}", transaction.getId());

        Transaction fullTransaction = transactionRepository.findById(transaction.getId())
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));

        // Prevent concurrent processing
        if (fullTransaction.getStatus() == TransactionStatus.COMPLETED) {
            return fullTransaction; // Idempotent
        }
        if (fullTransaction.getStatus() == TransactionStatus.CANCELLED) {
            throw new BusinessOperationException("Cannot complete a cancelled transaction");
        }

        fullTransaction.setStatus(TransactionStatus.PROCESSING);
        transactionRepository.save(fullTransaction);

        try {
            CreditListing currentListing = creditListingRepository.findByIdForUpdate(fullTransaction.getListing().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Listing not found"));

            CarbonCredit sellerCredit = carbonCreditRepository.findByIdForUpdate(fullTransaction.getCredit().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Credit not found"));

            // Update transaction status
            fullTransaction.setStatus(TransactionStatus.COMPLETED);
            fullTransaction.setCompletedAt(LocalDateTime.now());

            BigDecimal purchasedAmount = fullTransaction.getCreditAmount();

            // 1. CREATE NEW CREDIT FOR BUYER
            // Vì ta đã trừ credit gốc ở initiatePurchase (Reservation),
            // ở đây ta chỉ việc tạo credit mới cho người mua.

            CarbonCredit buyerCredit = new CarbonCredit();
            buyerCredit.setUser(fullTransaction.getBuyer());
            buyerCredit.setCreditAmount(purchasedAmount);

            // Copy metadata from seller credit
            buyerCredit.setCo2ReducedKg(sellerCredit.getCo2ReducedKg().multiply(purchasedAmount).divide(sellerCredit.getCreditAmount().add(purchasedAmount), 2, RoundingMode.HALF_UP)); // Approximate recalculation
            // Note: sellerCredit.getCreditAmount() is currently the REMAINING amount.
            // Correct Co2 math might require original total, but simple ratio is: (Purchased / OriginalTotal) * OriginalCo2.
            // For simplicity, we create a fresh record.
            buyerCredit.setCo2ReducedKg(new BigDecimal("1000").multiply(purchasedAmount)); // Assuming 1 credit = 1000kg CO2 std

            buyerCredit.setCreatedAt(LocalDateTime.now());
            buyerCredit.setStatus(CarbonCredit.CreditStatus.SOLD); // Credits bought are OWNED/SOLD
            buyerCredit.setVerifiedAt(sellerCredit.getVerifiedAt());
            buyerCredit.setVerifiedBy(sellerCredit.getVerifiedBy());

            carbonCreditRepository.save(buyerCredit);
            log.info("✅ Created new credit {} for buyer {} ({} credits)", buyerCredit.getId(), fullTransaction.getBuyer().getUsername(), purchasedAmount);

            // 2. FINALIZE LISTING STATUS
            if (currentListing.getStatus() == ListingStatus.PENDING_TRANSACTION) {
                // Nếu đang pending (tức là đã bán hết sạch ở bước initiate), giờ đóng luôn.
                currentListing.setStatus(ListingStatus.CLOSED);
                log.info("✅ Listing {} closed (Sold Out).", currentListing.getId());
            }
            // Nếu Listing là ACTIVE, nghĩa là vẫn còn hàng (partial purchase), không làm gì thêm.
            creditListingRepository.save(currentListing);

            // 3. WALLET OPERATIONS
            // Deduct from Buyer (if Wallet payment)
            if (fullTransaction.getPaymentMethod() == Transaction.PaymentMethod.WALLET) {
                walletService.updateCashBalance(fullTransaction.getBuyer().getId(), fullTransaction.getAmount().negate());
            }
            // Add Credit to Buyer Wallet (Tracker)
            walletService.updateCreditBalance(fullTransaction.getBuyer().getId(), purchasedAmount);

            // Add Cash to Seller
            walletService.updateCashBalance(fullTransaction.getSeller().getId(), fullTransaction.getAmount());

            // 4. NOTIFICATIONS & LOGS
            Transaction completedTransaction = transactionRepository.save(fullTransaction);

            auditService.logTransactionCompleted(
                    completedTransaction.getId().toString(),
                    completedTransaction.getBuyer().getId().toString(),
                    completedTransaction.getSeller().getId().toString());

            notificationService.notifyPurchaseSuccess(
                    completedTransaction.getBuyer(),
                    buyerCredit.getId().toString(),
                    purchasedAmount.toString(),
                    completedTransaction.getId().toString());

            notificationService.notifyCreditSold(
                    completedTransaction.getSeller(),
                    buyerCredit.getId().toString(),
                    purchasedAmount.toString(),
                    completedTransaction.getId().toString());

            return completedTransaction;

        } catch (Exception e) {
            log.error("❌ Error completing transaction: {}", e.getMessage(), e);
            // Nếu lỗi ở bước này, ta cần gọi failTransaction để rollback (trả lại credit)
            // Nhưng vì đây là method transactional, nó sẽ rollback DB state.
            // Tuy nhiên, trạng thái Listing đã bị đổi ở initiatePurchase (transaction khác).
            // Nên ta cần cơ chế bù trừ (Compensation).
            failTransaction(fullTransaction, "System Error during completion: " + e.getMessage());
            throw e;
        }
    }

    // Cancel a transaction and ROLLBACK resources
    @Transactional
    public Transaction failTransaction(Transaction transaction, String reason) {
        log.info("Failing/Cancelling transaction {} with reason: {}", transaction.getId(), reason);

        if (transaction.getStatus() == TransactionStatus.CANCELLED) {
            return transaction;
        }
        if (transaction.getStatus() == TransactionStatus.COMPLETED) {
            throw new BusinessOperationException("Cannot cancel a completed transaction");
        }

        // 1. Update status
        transaction.setStatus(TransactionStatus.CANCELLED);
        Transaction failedTransaction = transactionRepository.save(transaction);

        // 2. RESTORE RESOURCES (Compensation)
        CreditListing listing = creditListingRepository.findByIdForUpdate(transaction.getListing().getId()).orElse(null);
        CarbonCredit sellerCredit = carbonCreditRepository.findByIdForUpdate(transaction.getCredit().getId()).orElse(null);

        if (listing != null && sellerCredit != null) {
            BigDecimal amountToRestore = transaction.getCreditAmount();
            BigDecimal originalTotalCredits = sellerCredit.getCreditAmount().add(amountToRestore);

            // Restore Credit Amount to Seller
            sellerCredit.setCreditAmount(originalTotalCredits);
            carbonCreditRepository.save(sellerCredit);

            BigDecimal restoredPrice = listing.getPrice().add(transaction.getAmount());
            listing.setPrice(restoredPrice);

            // Restore Listing Status
            if (listing.getStatus() == ListingStatus.PENDING_TRANSACTION) {
                // If it was locked (thought to be sold out), reopen as ACTIVE
                listing.setStatus(ListingStatus.ACTIVE);
                log.warn("Listing {} unlocked. Status reverted from PENDING_TRANSACTION to ACTIVE.", listing.getId());
            }

            creditListingRepository.save(listing);
            log.info("🔄 Restored {} credits to seller. Listing {} is now ACTIVE with restored price {}.",
                    amountToRestore, listing.getId(), restoredPrice);
        }

        // Audit & Notify
        auditService.logTransactionFailed(transaction.getId().toString(), reason);

        // Notify Buyer
        notificationService.notifyTransactionFailed(
                transaction.getBuyer(),
                transaction.getSeller(),
                transaction.getId().toString(),
                reason
        );

        return failedTransaction;
    }

    // Cancel a pending transaction (Triggered by user or admin)
    @Transactional
    public Transaction cancelTransaction(UUID transactionId, User requestingUser) {
        log.info("Cancelling transaction {} by user {}", transactionId, requestingUser.getUsername());

        Transaction transaction = findTransactionById(transactionId);

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new BusinessOperationException("Only pending transactions can be cancelled");
        }

        if (!canCancelTransaction(transaction, requestingUser)) {
            throw new UnauthorizedOperationException("User not authorized to cancel this transaction");
        }

        return failTransaction(transaction, "Cancelled by " + requestingUser.getUsername());
    }

    private boolean canCancelTransaction(Transaction transaction, User user) {
        return transaction.getBuyer().getId().equals(user.getId()) ||
                transaction.getSeller().getId().equals(user.getId()) ||
                hasAdminRole(user);
    }

    private boolean hasAdminRole(User user) {
        return User.UserRole.ADMIN.equals(user.getRole()) || User.UserRole.CVA.equals(user.getRole());
    }

    // =========== QUERY METHODS ===========

    public Transaction findTransactionById(UUID transactionId) {
        validationService.validateId(transactionId, "Transaction");
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found with ID: " + transactionId));
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getUserTransactions(User user, int page, int size) {
        validationService.validateUser(user);
        validationService.validatePageParameters(page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return transactionRepository.findByBuyerOrSeller(user, user, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getPurchaseHistory(User buyer, int page, int size) {
        validationService.validateUser(buyer);
        validationService.validatePageParameters(page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return transactionRepository.findByBuyer(buyer, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getSalesHistory(User seller, int page, int size) {
        validationService.validateUser(seller);
        validationService.validatePageParameters(page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return transactionRepository.findBySeller(seller, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getTransactionsByStatus(TransactionStatus status, int page, int size) {
        validationService.validatePageParameters(page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return transactionRepository.findByStatus(status, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getDisputedTransactions(int page, int size) {
        validationService.validatePageParameters(page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return transactionRepository.findByStatus(TransactionStatus.DISPUTED, pageable);
    }

    // ================== Dispute related methods ====================

    @Transactional
    public Dispute createDispute(UUID transactionId, User user, String reason) {
        log.info("Create dispute for transaction {} by user {}", transactionId, user.getUsername());
        Transaction transaction = findTransactionById(transactionId);
        validationService.validateDisputeCreationRights(transaction, user);
        validationService.validateDisputeReason(reason);
        validationService.validateNoExistingOpenDisputes(transactionId);

        Dispute dispute = new Dispute();
        dispute.setTransaction(transaction);
        dispute.setRaisedBy(user);
        dispute.setReason(reason);
        dispute.setStatus(DisputeStatus.OPEN);
        dispute.setCreatedAt(LocalDateTime.now());

        Dispute savedDispute = disputeRepository.save(dispute);

        transaction.setStatus(TransactionStatus.DISPUTED);
        transactionRepository.save(transaction);

        User otherParty = transaction.getBuyer().getId().equals(user.getId()) ? transaction.getSeller() : transaction.getBuyer();
        notificationService.notifyDisputeCreated(user, otherParty, transaction.getId().toString());
        auditService.logDisputeCreated(savedDispute.getId().toString(), transaction.getId().toString());

        return savedDispute;
    }

    @Transactional
    public Transaction markAsDisputed(UUID transactionId, String disputeId) {
        log.info("Marking transaction {} as disputed due to dispute {}", transactionId, disputeId);
        Transaction transaction = findTransactionById(transactionId);
        validationService.validateTransactionStatusChange(transaction, TransactionStatus.DISPUTED);
        transaction.setStatus(TransactionStatus.DISPUTED);
        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction resolveDisputedTransaction(UUID transactionId, String resolution) {
        log.info("Resolving disputed transaction {} with resolution: {}", transactionId, resolution);
        Transaction transaction = findTransactionById(transactionId);

        if (transaction.getStatus() != TransactionStatus.DISPUTED) {
            throw new BusinessOperationException("Transaction is not in disputed state");
        }

        if (resolution.toLowerCase().contains("complete") || resolution.toLowerCase().contains("proceed")) {
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setCompletedAt(LocalDateTime.now());
            CreditListing listing = transaction.getListing();
            listing.setStatus(ListingStatus.CLOSED);
            creditListingRepository.save(listing);
        } else if (resolution.toLowerCase().contains("cancel") || resolution.toLowerCase().contains("refund")) {
            // Sử dụng failTransaction để đảm bảo hoàn trả tài nguyên
            return failTransaction(transaction, "Dispute resolved: Refund/Cancel");
        }

        Transaction resolvedTransaction = transactionRepository.save(transaction);
        auditService.logTransactionCompleted(transactionId.toString(), transaction.getBuyer().getId().toString(), transaction.getSeller().getId().toString());
        return resolvedTransaction;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTransactionStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> stats = new HashMap<>();
        long totalTransactions = transactionRepository.countByDateRange(startDate, endDate);
        long completedTransactions = transactionRepository.countByStatusAndDateRange(TransactionStatus.COMPLETED, startDate, endDate);
        long pendingTransactions = transactionRepository.countByStatusAndDateRange(TransactionStatus.PENDING, startDate, endDate);
        long processingTransactions = transactionRepository.countByStatusAndDateRange(TransactionStatus.PROCESSING, startDate, endDate);
        long disputedTransactions = transactionRepository.countByStatusAndDateRange(TransactionStatus.DISPUTED, startDate, endDate);
        long cancelledTransactions = transactionRepository.countByStatusAndDateRange(TransactionStatus.CANCELLED, startDate, endDate);

        // Revenue calculations - only from completed transactions
        BigDecimal totalRevenue = transactionRepository.sumAmountByStatusAndDateRange(TransactionStatus.COMPLETED, startDate, endDate);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        Double averageTransactionValue = transactionRepository.averageAmountByDateRange(startDate, endDate);
        if (averageTransactionValue == null) averageTransactionValue = 0.0;

        // Put count statistics
        stats.put("totalTransactions", totalTransactions);
        stats.put("completedTransactions", completedTransactions);
        stats.put("pendingTransactions", pendingTransactions);
        stats.put("processingTransactions", processingTransactions);
        stats.put("disputedTransactions", disputedTransactions);
        stats.put("cancelledTransactions", cancelledTransactions);

        // Put revenue statistics
        stats.put("totalRevenue", totalRevenue);
        stats.put("averageTransactionValue", averageTransactionValue);

        // Calculate rates
        double successRate = totalTransactions > 0 ? (double) completedTransactions / totalTransactions * 100 : 0.0;
        stats.put("successRate", Math.round(successRate * 100.0) / 100.0);

        double disputeRate = totalTransactions > 0 ? (double) disputedTransactions / totalTransactions * 100 : 0.0;
        stats.put("disputeRate", Math.round(disputeRate * 100.0) / 100.0);

        double pendingRate = totalTransactions > 0 ? (double) pendingTransactions / totalTransactions * 100 : 0.0;
        stats.put("pendingRate", Math.round(pendingRate * 100.0) / 100.0);

        stats.put("dateRange", Map.of("startDate", startDate, "endDate", endDate));
        return stats;
    }
    @Transactional(readOnly = true)
    public Page<Transaction> getAllTransactionsForAdmin(int page, int size) {
        validationService.validatePageParameters(page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return transactionRepository.findAll(pageable);
    }
}
