package com.carboncredit.dto;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;
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
}
