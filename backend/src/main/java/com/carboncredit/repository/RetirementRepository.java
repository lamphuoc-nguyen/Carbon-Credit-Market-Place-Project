package com.carboncredit.repository;

import com.carboncredit.entity.RetirementTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RetirementRepository extends JpaRepository<RetirementTransaction, UUID> {

    /**
     * Find retirement transactions by user ID with pagination
     */
    Page<RetirementTransaction> findByRetiringUserId(UUID userId, Pageable pageable);

    /**
     * Find retirement transactions by user ID ordered by creation date descending
     */
    List<RetirementTransaction> findByRetiringUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Get total amount retired by user
     */
    @Query("SELECT COALESCE(SUM(rt.amountRetiredKg), 0) FROM RetirementTransaction rt WHERE rt.retiringUser.id = :userId AND rt.status = :status")
    java.math.BigDecimal getTotalAmountRetiredByUserAndStatus(@Param("userId") UUID userId, @Param("status") RetirementTransaction.RetirementStatus status);

}
