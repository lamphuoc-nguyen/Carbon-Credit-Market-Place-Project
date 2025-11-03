package com.carboncredit.repository;

import com.carboncredit.entity.Certificate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, UUID> {

    /**
     * Find certificate by retirement transaction ID
     */
    Optional<Certificate> findByRetirementTransactionId(UUID retirementTransactionId);

    /**
     * Find certificates by buyer ID with pagination
     */
    Page<Certificate> findByBuyerId(UUID buyerId, Pageable pageable);

    /**
     * Find certificates by buyer ID ordered by creation date descending
     */
    List<Certificate> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId);

    /**
     * Find certificates by status
     */
    List<Certificate> findByStatus(Certificate.CertificateStatus status);

    /**
     * Find certificates by buyer ID and status
     */
    List<Certificate> findByBuyerIdAndStatus(UUID buyerId, Certificate.CertificateStatus status);

    /**
     * Count certificates by buyer ID
     */
    long countByBuyerId(UUID buyerId);

    /**
     * Count certificates by buyer ID and status
     */
    long countByBuyerIdAndStatus(UUID buyerId, Certificate.CertificateStatus status);

    /**
     * Find certificate by certificate code
     */
    Optional<Certificate> findByCertificateCode(String certificateCode);

    /**
     * Find certificate by ID with retirement transaction eagerly loaded for PDF generation
     */
    @Query("SELECT c FROM Certificate c JOIN FETCH c.retirementTransaction WHERE c.id = :certificateId")
    Optional<Certificate> findByIdWithRetirementTransaction(@Param("certificateId") UUID certificateId);
}
