package com.carboncredit.controller;

import com.carboncredit.entity.Transaction;
import com.carboncredit.service.TransactionService;
import com.carboncredit.service.VNPayService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

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
                response.sendRedirect(frontendRedirect("/payment/error?reason=missing_params"));
                return ResponseEntity.ok().build();
            }

            // Verify payment signature
            boolean isValid = vnPayService.verifyPayment(params);
            log.info("🔐 Payment verification result: {}", isValid);

            if (!isValid) {
                log.error("❌ Invalid payment signature");
                response.sendRedirect(frontendRedirect("/payment/error?reason=invalid_signature"));
                return ResponseEntity.ok().build();
            }

            // Find transaction
            Transaction transaction = transactionService.findTransactionById(UUID.fromString(transactionId));
            if (transaction == null) {
                log.error("❌ Transaction not found: {}", transactionId);
                response.sendRedirect(frontendRedirect("/payment/error?reason=transaction_not_found"));
                return ResponseEntity.ok().build();
            }

            // File: PaymentController.java

// ...
            log.info("📝 Transaction found: {} - Current status: {}", transactionId, transaction.getStatus());

            if ("00".equals(responseCode)) {
                // Payment successful
                log.info("✅ Payment successful for transaction: {}", transactionId);

                String vnpayTransactionNo = params.get("vnp_TransactionNo");
                transaction.setPaymentMethodId("VNPAY_" + vnpayTransactionNo);

                try {
                    transactionService.completeTransaction(transaction);
                    log.info("✅ Transaction completed successfully");
                    response.sendRedirect(frontendRedirect("/payment/success?transactionId=" + transactionId));
                } catch (com.carboncredit.exception.BusinessOperationException e) {
                    log.error("❌ Business validation failed during transaction completion: {}", e.getMessage());

                    // Handle specific validation errors
                    if (e.getMessage().contains("does not match") && e.getMessage().contains("price")) {
                        // Price validation failed - likely due to price changes during payment
                        log.warn("⚠️ Price validation failed - attempting to cancel transaction and restore listing");

                        try {
                            transactionService.failTransaction(transaction, "Price changed during payment processing");
                        } catch (Exception failException) {
                            log.error("❌ Failed to cancel transaction after price validation error: {}", failException.getMessage());
                        }

                        response.sendRedirect(frontendRedirect("/payment/failed?transactionId=" + transactionId +
                                            "&code=PRICE_CHANGED&message=The listing price changed while you were completing payment. Please try again."));
                    } else {
                        // Other business validation errors
                        try {
                            transactionService.failTransaction(transaction, "Validation failed: " + e.getMessage());
                        } catch (Exception failException) {
                            log.error("❌ Failed to cancel transaction after validation error: {}", failException.getMessage());
                        }

                        response.sendRedirect(frontendRedirect("/payment/failed?transactionId=" + transactionId +
                                            "&code=VALIDATION_ERROR&message=" + java.net.URLEncoder.encode(e.getMessage(), "UTF-8")));
                    }
                }
            } else {
                // Payment failed hoặc Customer Cancelled (vnp_ResponseCode=24)
                log.warn("⚠️ Payment failed with code: {} for transaction: {}", responseCode, transactionId);

                // 🔑 BỔ SUNG: Cập nhật trạng thái giao dịch nội bộ và giải phóng Credit/Listing
                String reason = "VNPay failure code: " + responseCode + " (" + getVnpayResponseDescription(responseCode) + ")";

                // Gọi service để chuyển Transaction -> CANCELLED và Listing -> ACTIVE
                transactionService.failTransaction(transaction, reason);

                response.sendRedirect(frontendRedirect("/payment/failed?transactionId=" + transactionId + "&code=" + responseCode));
            }

            return ResponseEntity.ok().build();
// ...

        } catch (IllegalArgumentException e) {
            log.error("❌ Invalid UUID format: {}", e.getMessage());
            response.sendRedirect(frontendRedirect("/payment/error?reason=invalid_id"));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ Error processing VNPay callback: ", e);
            response.sendRedirect(frontendRedirect("/payment/error?reason=server_error"));
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

    private String frontendRedirect(String pathAndQuery) {
        return frontendBaseUrl + pathAndQuery;
    }
    // File: PaymentController.java

// ... (thêm vào cuối file, cùng cấp với getIpAddress)

    /**
     * Helper to get a simple description for VNPay response codes
     * Note: This list is incomplete; check full VNPay docs for production use.
     */
    private String getVnpayResponseDescription(String code) {
        return switch (code) {
            case "00" -> "Giao dịch thành công";
            case "07" -> "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan gian lận, lừa đảo)";
            case "09" -> "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ Internet Banking";
            case "10" -> "Giao dịch không thành công do: Khách hàng xác thực thông tin không đúng quá 3 lần";
            case "11" -> "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Vui lòng thử lại";
            case "12" -> "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa";
            case "13" -> "Giao dịch không thành công do: Sai số tiền giao dịch (Vui lòng kiểm tra lại) [Mã lỗi này thường hiếm khi xảy ra]";
            case "24" -> "Giao dịch không thành công do: Khách hàng hủy giao dịch"; // Mã lỗi đang quan tâm
            case "51" -> "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch";
            default -> "Lỗi không xác định";
        };
    }

// ...
}
