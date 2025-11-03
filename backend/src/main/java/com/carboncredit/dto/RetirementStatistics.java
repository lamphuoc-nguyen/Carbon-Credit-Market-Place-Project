package com.carboncredit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for retirement statistics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RetirementStatistics {
    private BigDecimal totalRetiredKg;
    private long completedRetirements;
    private long totalRetirements;

    // Calculated fields
    public BigDecimal getAverageRetirementKg() {
        if (completedRetirements == 0) {
            return BigDecimal.ZERO;
        }
        return totalRetiredKg.divide(BigDecimal.valueOf(completedRetirements), 2, BigDecimal.ROUND_HALF_UP);
    }

    public double getSuccessRate() {
        if (totalRetirements == 0) {
            return 0.0;
        }
        return (double) completedRetirements / totalRetirements * 100;
    }
}
