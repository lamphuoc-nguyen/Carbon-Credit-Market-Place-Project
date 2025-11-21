package com.carboncredit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransferRequestDTO {
    private BigDecimal co2Amount;
    private List<UUID> journeyIds; // Optional: specific journeys to include
}
