package com.gr4.carboncredit.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.gr4.carboncredit.entity.CreditListing.ListingStatus;
import com.gr4.carboncredit.entity.CreditListing.ListingType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditListingResponse {
    private UUID id;
    private UUID creditId;
    private String creditType;
    private Integer creditQuantity;
    private String sellerUsername;
    private ListingType listingType;
    private BigDecimal price;
    private BigDecimal minBid;
    private LocalDateTime actionEndTime;
    private ListingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime upatedAt;
}
