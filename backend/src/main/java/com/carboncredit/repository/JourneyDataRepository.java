package com.carboncredit.repository;

import com.carboncredit.entity.JourneyData;
import com.carboncredit.entity.User;
import com.carboncredit.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface JourneyDataRepository extends JpaRepository<JourneyData, UUID> {

    List<JourneyData> findByUser(User user);

    List<JourneyData> findByVehicle(Vehicle vehicle);

    List<JourneyData> findByUserAndStartTimeBetween(User user, LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(j.co2ReducedKg) FROM JourneyData j WHERE j.user = :user")
    BigDecimal getTotalCo2ReductionByUser(User user);


    List<JourneyData> findByVerificationStatus(JourneyData.VerificationStatus verificationStatus);



    /**
     * Count journeys by verification status
     */
    long countByVerificationStatus(JourneyData.VerificationStatus status);

    /**
     * Count journeys verified by specific CVA with specific status
     */
    long countByVerifiedByAndVerificationStatus(User verifiedBy, JourneyData.VerificationStatus status);

    /**
     * Get all journeys verified by specific CVA
     */
    List<JourneyData> findByVerifiedBy(User verifiedBy);

    /**
     * Count all journeys verified by specific CVA
     */
    long countByVerifiedBy(User verifiedBy);

    /**
     * Get recent journeys for CVA review (last 30 days, pending)
     */
    @Query("SELECT j FROM JourneyData j WHERE j.verificationStatus = :status " +
            "AND j.createdAt >= :since ORDER BY j.createdAt DESC")
    List<JourneyData> findRecentPendingJourneys(
            JourneyData.VerificationStatus status,
            LocalDateTime since);

    /**
     * Count pending journeys older than X days (for SLA monitoring)
     */
    @Query("SELECT COUNT(j) FROM JourneyData j WHERE j.verificationStatus = 'PENDING_VERIFICATION' " +
            "AND j.createdAt < :threshold")
    long countOverduePendingJourneys(LocalDateTime threshold);

    /**
     * Find existing journeys for duplicate detection
     * Check for journeys with same user, vehicle, and similar time/distance within same day
     */
    @Query("SELECT j FROM JourneyData j WHERE j.user = :user " +
            "AND j.vehicle = :vehicle " +
            "AND CAST(j.startTime AS DATE) = CAST(:startTime AS DATE) " +
            "AND j.distanceKm = :distance " +
            "AND j.energyConsumedKwh = :energy")
    List<JourneyData> findPotentialDuplicates(
            User user,
            Vehicle vehicle,
            LocalDateTime startTime,
            BigDecimal distance,
            BigDecimal energy);

    /**
     * Find journeys for the same user and vehicle on the same date
     */
    @Query("SELECT j FROM JourneyData j WHERE j.user = :user " +
            "AND j.vehicle = :vehicle " +
            "AND CAST(j.startTime AS DATE) = CAST(:startTime AS DATE)")
    List<JourneyData> findJourneysByUserVehicleAndDate(
            User user,
            Vehicle vehicle,
            LocalDateTime startTime);
}
