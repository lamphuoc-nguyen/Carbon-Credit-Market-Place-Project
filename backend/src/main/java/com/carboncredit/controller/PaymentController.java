package com.carboncredit.controller;

import com.carboncredit.entity.Transaction;
import com.carboncredit.service.TransactionService;
import com.carboncredit.service.VNPayService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;
    private final TransactionService transactionService;

    @PostMapping("/vnpay/create")
    public ResponseEntity<Map<String, String>> createPayment(@RequestParam UUID transactionId, HttpServletRequest request) {
        try {
            Transaction transaction = transactionService.findTransactionById(transactionId);
            if (transaction == null) {
                return ResponseEntity.notFound().build();
            }

            String ipAddress = getIpAddress(request);
            String paymentUrl = vnPayService.createPaymentUrl(transaction, ipAddress);

            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating VNPay payment: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }



    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> vnpayReturn(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {
        try {
            log.info("📥 VNPay callback received with params: {}", params);

            String transactionId = params.get("vnp_TxnRef");
            String responseCode = params.get("vnp_ResponseCode");

            // Validate required parameters
            if (transactionId == null || responseCode == null) {
                log.error("❌ Missing required parameters");
                response.sendRedirect("http://localhost:5173/payment/error?reason=missing_params");
                return ResponseEntity.ok().build();
            }

            // Verify payment signature
            boolean isValid = vnPayService.verifyPayment(params);
            log.info("🔐 Payment verification result: {}", isValid);

            if (!isValid) {
                log.error("❌ Invalid payment signature");
                response.sendRedirect("http://localhost:5173/payment/error?reason=invalid_signature");
                return ResponseEntity.ok().build();
            }

            // Find transaction
            Transaction transaction = transactionService.findTransactionById(UUID.fromString(transactionId));
            if (transaction == null) {
                log.error("❌ Transaction not found: {}", transactionId);
                response.sendRedirect("http://localhost:5173/payment/error?reason=transaction_not_found");
                return ResponseEntity.ok().build();
            }

            log.info("📝 Transaction found: {} - Current status: {}", transactionId, transaction.getStatus());

            if ("00".equals(responseCode)) {
                // Payment successful
                log.info("✅ Payment successful for transaction: {}", transactionId);

                String vnpayTransactionNo = params.get("vnp_TransactionNo");
                transaction.setPaymentMethodId("VNPAY_" + vnpayTransactionNo);

                transactionService.completeTransaction(transaction);
                log.info("✅ Transaction completed successfully");

                response.sendRedirect("http://localhost:5173/payment/success?transactionId=" + transactionId);
            } else {
                // Payment failed
                log.warn("⚠️ Payment failed with code: {} for transaction: {}", responseCode, transactionId);
                response.sendRedirect("http://localhost:5173/payment/failed?transactionId=" + transactionId + "&code=" + responseCode);
            }

            return ResponseEntity.ok().build();

        } catch (IllegalArgumentException e) {
            log.error("❌ Invalid UUID format: {}", e.getMessage());
            response.sendRedirect("http://localhost:5173/payment/error?reason=invalid_id");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Error processing VNPay callback: ", e);
            response.sendRedirect("http://localhost:5173/payment/error?reason=server_error");
            return ResponseEntity.ok().build();
        }
    }

    private String getIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }
}
