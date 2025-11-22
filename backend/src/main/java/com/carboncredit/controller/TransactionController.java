package com.carboncredit.controller;

// Add these imports to TransactionController.java
import com.carboncredit.dto.PurchaseRequest;

import com.carboncredit.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.Authentication;
import com.carboncredit.entity.Transaction;
import com.carboncredit.entity.User;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.carboncredit.dto.TransactionDTO;
import com.carboncredit.service.TransactionService;
import com.carboncredit.util.DTOMapper;
import com.carboncredit.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Slf4j
@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;
    private final UserService userService;
    private final VNPayService vnPayService;

    @PostMapping("/purchase")
    public ResponseEntity<Map<String, Object>> initiateTransaction(@RequestBody PurchaseRequest request,
                                                                   Authentication authentication,
                                                                   HttpServletRequest httpRequest) {
        try {
            User buyer = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String paymentMethodId = request.getPaymentMethodId();
            if (paymentMethodId == null || paymentMethodId.isEmpty()) {
                paymentMethodId = "VNPAY_PENDING"; // Default to VNPAY if not specified
            }

            log.info("💳 Creating transaction with payment method ID: {}", paymentMethodId);

            Transaction transaction;
            if (request.getQuantity() != null) {
                log.info("🔢 Partial purchase requested: {} credits", request.getQuantity());
                transaction = transactionService.initiatePurchase(
                        request.getListingId(),
                        buyer,
                        paymentMethodId,
                        request.getQuantity());
            } else {
                log.info("📦 Full purchase requested");
                transaction = transactionService.initiatePurchase(
                        request.getListingId(),
                        buyer,
                        paymentMethodId);
            }

            log.info("✅ Transaction created with payment method: {}", transaction.getPaymentMethod());

            Map<String, Object> response = new HashMap<>();
            response.put("transactionId", transaction.getId());
            response.put("paymentMethod", transaction.getPaymentMethod());

            if (transaction.getPaymentMethod() == Transaction.PaymentMethod.VNPAY) {
                String ipAddress = getIpAddress(httpRequest);
                String paymentUrl = vnPayService.createPaymentUrl(transaction, ipAddress);
                response.put("paymentUrl", paymentUrl);
                log.info("🏦 VNPay payment URL created");
            } else if (transaction.getPaymentMethod() == Transaction.PaymentMethod.WALLET) {
                response.put("message", "Transaction created. Complete payment via /transactions/{id}/complete");
                log.info("💰 WALLET transaction created. Ready for completion.");
            } else {
                response.put("message", "Transaction created with payment method: " + transaction.getPaymentMethod());
                log.info("✅ Transaction created with payment method: {}", transaction.getPaymentMethod());
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("❌ Error initiating purchase: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    private String getIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }

    @PostMapping("/{transactionId}/complete")
    public ResponseEntity<TransactionDTO> completeTransaction(@PathVariable UUID transactionId,
                                                              Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("user not found"));

            Transaction transaction = transactionService.findTransactionById(transactionId);
            if (transaction == null) {
                return ResponseEntity.notFound().build();
            }

            if (!transaction.getBuyer().getId().equals(user.getId())
                    && !transaction.getListing().getCredit().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Transaction completedTransaction;

            if (transaction.getPaymentMethod() == Transaction.PaymentMethod.WALLET) {

                log.info("💰 WALLET payment - Directly completing transaction without external payment processing");
                completedTransaction = transactionService.completeTransaction(transaction);
            } else {
                // VNPAY/OTHER PAYMENT - Process qua payment service
                log.info("💳 {} payment - Processing through payment service", transaction.getPaymentMethod());
                transactionService.processPayment(transaction);
                completedTransaction = transactionService.completeTransaction(transaction);
            }

            TransactionDTO transactionDTO = DTOMapper.toTransactionDTO(completedTransaction);

            log.info("✅ Transaction {} completed successfully", transactionId);

            return ResponseEntity.ok(transactionDTO);
        } catch (Exception e) {
            log.error("Error completing transaction {}: {}", transactionId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // cancel a transaction (before completion
    @PostMapping("/{transactionId}/cancel")
    public ResponseEntity<TransactionDTO> cancelTransaction(@PathVariable UUID transactionId,
                                                            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Transaction cancelledTransaction = transactionService.cancelTransaction(transactionId, user);
            TransactionDTO transactionDTO = DTOMapper.toTransactionDTO(cancelledTransaction);

            log.info("Transaction {} cancelled by user {}", transactionId, user.getUsername());

            return ResponseEntity.ok(transactionDTO);
        } catch (Exception e) {
            log.error("Error cancelling transaction {}: {}", transactionId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // get specific transaction by Id
    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionDTO> getTransaction(@PathVariable UUID transactionId,
                                                         Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Transaction transaction = transactionService.findTransactionById(transactionId);
            if (transaction == null) {
                return ResponseEntity.notFound().build();
            }

            // Check authorization (buyer, seller, or admin)
            boolean isAuthorized = transaction.getBuyer().getId().equals(user.getId())
                    || transaction.getListing().getCredit().getUser().getId().equals(user.getId())
                    || user.getRole() == User.UserRole.ADMIN;

            if (!isAuthorized) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            TransactionDTO transactionDTO = DTOMapper.toTransactionDTO(transaction);
            return ResponseEntity.ok(transactionDTO);
        } catch (Exception e) {
            log.error("Error fetching transaction {}: {}", transactionId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // get user's transaction history (both purchases and sales)
    @GetMapping("/my-transactions")
    public ResponseEntity<Page<TransactionDTO>> getMyTransactions(@RequestParam(defaultValue = "0") int page,
                                                                  @RequestParam(defaultValue = "10") int size,
                                                                  Authentication authentication) {

        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Page<Transaction> transactions = transactionService.getUserTransactions(user, page, size);
            Page<TransactionDTO> transactionDTOs = DTOMapper.toTransactionDTOPage(transactions);

            return ResponseEntity.ok(transactionDTOs);
        } catch (Exception e) {
            log.error("Error fetching user transaction: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // get user's purchase history
    @GetMapping("/purchases")
    public ResponseEntity<Page<TransactionDTO>> getPurchaseHistory(@RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "10") int size, Authentication authentication) {
        try {
            User buyer = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Page<Transaction> purchases = transactionService.getPurchaseHistory(buyer, page, size);
            Page<TransactionDTO> purchaseDTOs = DTOMapper.toTransactionDTOPage(purchases);

            return ResponseEntity.ok(purchaseDTOs);
        } catch (Exception e) {
            log.error("Error fetching purchase history: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Admin: get transaction status
    @GetMapping("/admin/statistics")
    public ResponseEntity<Map<String, Object>> getTransactionStatistics(
            @RequestParam(required = false) String startDate, @RequestParam(required = false) String endDate,
            Authentication authentication) {

        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check admin role
            if (user.getRole() != User.UserRole.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate)
                    : LocalDateTime.now().minusDays(30);
            LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : LocalDateTime.now();

            Map<String, Object> statistics = transactionService.getTransactionStatistics(start, end);

            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error fetching transaction statistics: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Admin: Get all transactions in the system
     */
    @GetMapping("/admin/all-transactions")
    public ResponseEntity<Page<TransactionDTO>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check admin role
            if (user.getRole() != User.UserRole.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Page<TransactionDTO> transactions = transactionService.getAllTransactionsForAdmin(page, size)
                    .map(DTOMapper::toTransactionDTO);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error fetching all transactions: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{transactionId}/status")
    public ResponseEntity<Map<String, Object>> getTransactionStatus(@PathVariable UUID transactionId,
                                                                    Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Transaction transaction = transactionService.findTransactionById(transactionId);
            if (transaction == null) {
                return ResponseEntity.notFound().build();
            }

            // Check authorization
            boolean isAuthorized = transaction.getBuyer().getId().equals(user.getId())
                    || transaction.getListing().getCredit().getUser().getId().equals(user.getId());

            if (!isAuthorized) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("transactionId", transaction.getId());
            response.put("status", transaction.getStatus());
            response.put("amount", transaction.getAmount());
            response.put("paymentMethodId", transaction.getPaymentMethodId());
            response.put("createdAt", transaction.getCreatedAt());
            response.put("completedAt", transaction.getCompletedAt());
            response.put("isPurchaseSuccessful", transaction.getStatus() == Transaction.TransactionStatus.COMPLETED);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching transaction status: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

}
