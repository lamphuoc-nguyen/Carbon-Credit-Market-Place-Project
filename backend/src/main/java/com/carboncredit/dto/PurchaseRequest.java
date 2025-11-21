package com.carboncredit.dto;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequest {
    @NotNull(message = "Listing ID is required")
    private UUID listingId;

    @NotNull(message = "Payment method ID is required")
    private String paymentMethodId;

    @Positive(message = "Quantity must be greater than 0")
    private BigDecimal quantity; // Optional: if not provided, purchases entire listing
}
