package com.carboncredit.dto;

import com.carboncredit.entity.Transaction;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    private UUID id;
    private UUID buyerId;
    private String buyerUsername;
    private UUID sellerId;
    private String sellerUsername;
    private UUID listingId;
    private UUID creditId;
    private BigDecimal amount;       // Số tiền ($)
    private BigDecimal creditAmount; // Số lượng tín chỉ (Tonnes)
    private BigDecimal co2OffsetKg;  // Lượng CO2 giảm được (Kg)

    private String status;           // Dùng String để dễ hiển thị
    private String paymentMethod;    // Dùng String để dễ hiển thị
    private String paymentMethodId;

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    // Listing information for display
    private String listingTitle;
    private BigDecimal listingPrice;

    // Credit information for display
    private BigDecimal creditCo2ReducedKg; // Tổng CO2 của Credit gốc
    private String creditStatus;

    // Static factory method to create DTO from entity
    public static TransactionDTO fromEntity(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());

        // Buyer information
        if (transaction.getBuyer() != null) {
            dto.setBuyerId(transaction.getBuyer().getId());
            dto.setBuyerUsername(transaction.getBuyer().getUsername());
        }

        // Seller information
        if (transaction.getSeller() != null) {
            dto.setSellerId(transaction.getSeller().getId());
            dto.setSellerUsername(transaction.getSeller().getUsername());
        }

        // Listing information
        if (transaction.getListing() != null) {
            dto.setListingId(transaction.getListing().getId());
            dto.setListingPrice(transaction.getListing().getPrice());
            // Listing title thường là ID hoặc tên project nếu có
            dto.setListingTitle("Carbon Credit Listing #" + transaction.getListing().getId().toString().substring(0, 8));
        }

        // Credit information
        if (transaction.getCredit() != null) {
            dto.setCreditId(transaction.getCredit().getId());
            dto.setCreditCo2ReducedKg(transaction.getCredit().getCo2ReducedKg());
            dto.setCreditStatus(transaction.getCredit().getStatus().toString());
        }

        // ✅ FIX 1: CO2 Offset Calculation (Simplification)
        // Quy tắc: 1 Credit = 1 Tấn = 1000 Kg
        if (transaction.getCreditAmount() != null) {
            // creditAmount (tons) * 1000 = kg
            dto.setCo2OffsetKg(transaction.getCreditAmount().multiply(new BigDecimal("1000")));
        } else {
            dto.setCo2OffsetKg(BigDecimal.ZERO);
        }

        // Transaction details
        dto.setAmount(transaction.getAmount());
        dto.setCreditAmount(transaction.getCreditAmount());

        // ✅ FIX 2: Mapping Status & Payment Method safely
        dto.setStatus(transaction.getStatus() != null ? transaction.getStatus().toString() : "UNKNOWN");

        // Xử lý hiển thị Payment Method đẹp hơn
        if (transaction.getPaymentMethod() != null) {
            dto.setPaymentMethod(transaction.getPaymentMethod().toString());
        } else if (transaction.getPaymentMethodId() != null) {
            // Fallback nếu enum null nhưng có ID
            if (transaction.getPaymentMethodId().contains("VNPAY")) dto.setPaymentMethod("VNPAY");
            else if (transaction.getPaymentMethodId().contains("WALLET")) dto.setPaymentMethod("WALLET");
            else dto.setPaymentMethod("UNKNOWN");
        } else {
            dto.setPaymentMethod("UNKNOWN");
        }

        // ❌ REMOVED: paymentStatus (Entity Transaction không có trường này, chỉ Payment mới có)

        dto.setPaymentMethodId(transaction.getPaymentMethodId());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setCompletedAt(transaction.getCompletedAt());

        return dto;
    }
}