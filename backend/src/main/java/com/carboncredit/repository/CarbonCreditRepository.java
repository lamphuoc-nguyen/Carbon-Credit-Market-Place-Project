package com.carboncredit.repository;

import com.carboncredit.entity.CarbonCredit;
import com.carboncredit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CarbonCreditRepository extends JpaRepository<CarbonCredit, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CarbonCredit c WHERE c.id = :id")
    Optional<CarbonCredit> findByIdForUpdate(@Param("id") UUID id);

    List<CarbonCredit> findByUser(User user);

    List<CarbonCredit> findByStatus(CarbonCredit.CreditStatus status);

    List<CarbonCredit> findByUserAndStatus(User user, CarbonCredit.CreditStatus status);

    @Query("SELECT SUM(c.creditAmount) FROM CarbonCredit c WHERE c.user = :user AND c.status = 'VERIFIED'")
    BigDecimal getTotalVerifiedCreditsByUser(User user);

    @Query("SELECT c FROM CarbonCredit c WHERE c.status = 'PENDING' AND c.createdAt < :cutoffDate")
    List<CarbonCredit> findPendingCreditsOlderThan(LocalDateTime cutoffDate);

    @Query("SELECT c FROM CarbonCredit c WHERE c.status IN ('VERIFIED', 'LISTED') ORDER BY c.createdAt DESC")
    List<CarbonCredit> findAvailableCredits();

    List<CarbonCredit> findByUserAndStatusIn(User buyer, List<CarbonCredit.CreditStatus> list);
}
